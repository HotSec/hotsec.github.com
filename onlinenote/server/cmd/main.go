package main

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"onlinenote/config"
	"onlinenote/internal/crdt"
	"onlinenote/internal/document"
	"onlinenote/internal/storage"
	"onlinenote/internal/user"
	ws "onlinenote/internal/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	gws "github.com/gorilla/websocket"
)

var upgrader = gws.Upgrader{
	ReadBufferSize:  1024 * 1024,
	WriteBufferSize: 1024 * 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true
		}
		// Reject plain-http origins over TLS (wss) connections to prevent
		// mixed-content / downgrade attacks.
		isTLS := r.TLS != nil
		originIsHTTP := len(origin) > 7 && origin[:7] == "http://"
		if isTLS && originIsHTTP {
			return false
		}
		host := r.Host
		if origin == "http://"+host || origin == "https://"+host {
			return true
		}
		return false
	},
}

type Server struct {
	Config    *config.Config
	DB        *storage.Database
	DocMgr    *document.Manager
	Hub       *ws.Hub
	CRDTStore *crdt.DocumentStore
}

func main() {
	cfg := config.Load()

	if cfg.JWTSecret == "onlinenote-secret-key-change-in-production" {
		slog.Warn("JWT_SECRET is set to the default value - this is insecure for production use")
	}

	db, err := storage.NewDatabase(cfg.DataDir)
	if err != nil {
		slog.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	docMgr := document.NewManager(cfg.DataDir, cfg.StaticDir)

	crdtStore := crdt.NewDocumentStore()

	hub := ws.NewHub()
	go hub.Run()

	srv := &Server{
		Config:    cfg,
		DB:        db,
		DocMgr:    docMgr,
		Hub:       hub,
		CRDTStore: crdtStore,
	}

	hub.OnCRDTOp = func(docID string, data []byte) {
		var msg struct {
			Data json.RawMessage `json:"data"`
		}
		if err := json.Unmarshal(data, &msg); err != nil {
			return
		}

		var crdtMsg struct {
			Operations []crdt.Operation `json:"operations"`
		}
		if err := json.Unmarshal(msg.Data, &crdtMsg); err != nil {
			return
		}

		doc := crdtStore.Get(docID)
		for _, op := range crdtMsg.Operations {
			doc.ApplyOperation(op)
		}

		if err := srv.DB.SaveCRDTState(docID, doc.GetState(), doc.GetVector()); err != nil {
			slog.Warn("failed to persist CRDT state", "docId", docID, "error", err)
		}
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	r.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:   []string{"Content-Length"},
	}))

	staticFS := gin.Dir(cfg.StaticDir, false)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		f, err := staticFS.Open(path)
		if err == nil {
			defer f.Close()
			stat, _ := f.Stat()
			if stat != nil && !stat.IsDir() {
				http.ServeContent(c.Writer, c.Request, stat.Name(), stat.ModTime(), f)
				return
			}
		}
		c.File(filepath.Join(cfg.StaticDir, "index.html"))
	})

	api := r.Group("/api")
	{
		api.POST("/auth/register", srv.handleRegister)
		api.POST("/auth/login", srv.handleLogin)

		docs := api.Group("/documents")
		{
			docs.GET("/:id", srv.handleGetDocument)
			docs.PUT("/:id", srv.handleSaveDocument)
			docs.GET("/:id/versions", srv.handleGetVersions)
			docs.GET("/:id/versions/:version", srv.handleGetVersion)
			docs.POST("/:id/rollback/:version", srv.handleRollback)
			docs.GET("/:id/permissions", srv.handleGetPermissions)
			docs.PUT("/:id/permissions", srv.handleSetPermission)
			docs.DELETE("/:id/permissions/:userId", srv.handleDeletePermission)
			docs.GET("/:id/crdt/state", srv.handleCRDTState)
			docs.POST("/:id/crdt/sync", srv.handleCRDTSync)
		}
	}

	r.GET("/ws", srv.handleWebSocket)

	addr := fmt.Sprintf(":%s", cfg.Port)
	slog.Info("server starting", "addr", addr)
	if err := r.Run(addr); err != nil {
		slog.Error("failed to start server", "error", err)
		os.Exit(1)
	}
}

func (s *Server) handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Warn("websocket upgrade error", "error", err)
		return
	}

	userID := c.Query("userId")
	userName := c.Query("userName")
	docID := c.Query("docId")
	color := c.Query("color")

	if userID == "" {
		userID = user.GenerateID()
	}
	if userName == "" {
		userName = "Anonymous"
	}
	if docID == "" {
		docID = "all-md"
	}
	if color == "" {
		color = user.RandomColor()
	}

	client := &ws.Client{
		Hub:      s.Hub,
		Conn:     conn,
		Send:     make(chan []byte, 256),
		UserID:   userID,
		UserName: userName,
		Color:    color,
		DocID:    docID,
	}

	s.Hub.Register(client)

	go client.WritePump()
	go client.ReadPump()
}

func (s *Server) handleRegister(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required,min=6"`
		Email    string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := user.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	u := user.User{
		ID:           user.GenerateID(),
		Username:     req.Username,
		PasswordHash: hash,
		Email:        req.Email,
		Color:        user.RandomColor(),
	}

	_, err = s.DB.DB().Exec(
		"INSERT INTO users (id, username, password_hash, email, color) VALUES (?, ?, ?, ?, ?)",
		u.ID, u.Username, u.PasswordHash, u.Email, u.Color,
	)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	token, err := user.GenerateToken(u.ID, u.Username, s.Config.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user": gin.H{
			"id":       u.ID,
			"username": u.Username,
			"color":    u.Color,
		},
	})
}

func (s *Server) handleLogin(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var u user.User
	err := s.DB.DB().QueryRow(
		"SELECT id, username, password_hash, color FROM users WHERE username = ?",
		req.Username,
	).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Color)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !user.CheckPassword(req.Password, u.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := user.GenerateToken(u.ID, u.Username, s.Config.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       u.ID,
			"username": u.Username,
			"color":    u.Color,
		},
	})
}

func (s *Server) resolveSrcPath(src string) string {
	resolved := src
	if len(resolved) >= 2 && resolved[:2] == "./" {
		resolved = resolved[2:]
	}
	if s.Config.MarkdownDir != "" {
		mdPath := filepath.Join(s.Config.MarkdownDir, resolved)
		if _, err := os.Stat(mdPath); err == nil {
			return mdPath
		}
	}
	staticPath := filepath.Join(s.Config.StaticDir, resolved)
	if _, err := os.Stat(staticPath); err == nil {
		return staticPath
	}
	return ""
}

func (s *Server) handleGetDocument(c *gin.Context) {
	docID := c.Param("id")
	src := c.Query("src")

	userID := s.getUserIdFromRequest(c)
	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	doc, err := s.DocMgr.Load(docID)
	if err != nil {
		s.internalError(c, err)
		return
	}

	if doc.Content == "" && src != "" {
		filePath := s.resolveSrcPath(src)
		if filePath != "" {
			content, err := os.ReadFile(filePath)
			if err == nil {
				doc.Content = string(content)
				doc.Version = 1
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      doc.ID,
		"content": doc.Content,
		"version": doc.Version,
	})
}

func (s *Server) handleSaveDocument(c *gin.Context) {
	docID := c.Param("id")
	src := c.Query("src")

	userID := s.getUserIdFromRequest(c)
	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessWrite)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
		UserID  string `json:"userId,omitempty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.UserID == "" {
		req.UserID = "anon-" + user.GenerateID()
	}
	if src != "" {
		filePath := s.resolveSrcPath(src)
		if filePath == "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
			return
		}
		if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
			s.internalError(c, err)
			return
		}
		if err := os.WriteFile(filePath, []byte(req.Content), 0644); err != nil {
			s.internalError(c, err)
			return
		}
		if err := s.DB.SaveDocumentVersion(docID, req.Content, req.UserID); err != nil {
			slog.Warn("failed to save document version for src", "error", err)
		}
		c.JSON(http.StatusOK, gin.H{
			"id":      docID,
			"version": 1,
			"src":     src,
		})
		return
	}

	if err := s.DocMgr.Save(docID, req.Content); err != nil {
		s.internalError(c, err)
		return
	}

	if err := s.DB.SaveDocumentVersion(docID, req.Content, req.UserID); err != nil {
		slog.Warn("failed to save document version", "error", err)
	}

	doc, _ := s.DocMgr.Load(docID)

	msg, _ := json.Marshal(ws.Message{
		Type:   "document-saved",
		DocID:  docID,
		UserID: req.UserID,
	})
	s.Hub.Broadcast(docID, msg, nil)

	c.JSON(http.StatusOK, gin.H{
		"id":      doc.ID,
		"version": doc.Version,
	})
}

func (s *Server) handleGetVersions(c *gin.Context) {
	docID := c.Param("id")

	userID := s.getUserIdFromRequest(c)
	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	versions, err := s.DocMgr.ListVersions(docID)
	if err != nil {
		s.internalError(c, err)
		return
	}

	dbVersions, err := s.DB.GetDocumentVersions(docID)
	if err != nil {
		s.internalError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"docId":    docID,
		"files":    versions,
		"database": dbVersions,
	})
}

func (s *Server) handleGetVersion(c *gin.Context) {
	docID := c.Param("id")
	versionStr := c.Param("version")
	version, err := strconv.Atoi(versionStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid version"})
		return
	}

	userID := s.getUserIdFromRequest(c)
	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	dbVersion, err := s.DB.GetDocumentVersion(docID, version)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "version not found"})
		return
	}

	c.JSON(http.StatusOK, dbVersion)
}

func (s *Server) handleRollback(c *gin.Context) {
	docID := c.Param("id")
	versionStr := c.Param("version")
	version, err := strconv.Atoi(versionStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid version"})
		return
	}

	userID := s.getUserIdFromRequest(c)
	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessWrite)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var req struct {
		UserID string `json:"userId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		req.UserID = "anon-" + user.GenerateID()
	}

	newVersion, err := s.DB.RollbackToVersion(docID, version, req.UserID)
	if err != nil {
		s.internalError(c, err)
		return
	}

	if err := s.DocMgr.Save(docID, newVersion.Content); err != nil {
		s.internalError(c, err)
		return
	}

	crdtDoc := s.CRDTStore.Get(docID)
	crdtDoc.ResetFromContent(newVersion.Content)

	msg, _ := json.Marshal(ws.Message{
		Type:   "document-rollback",
		DocID:  docID,
		UserID: req.UserID,
		Data:   json.RawMessage(`{"version":` + strconv.Itoa(newVersion.Version) + `}`),
	})
	s.Hub.Broadcast(docID, msg, nil)

	c.JSON(http.StatusOK, newVersion)
}

func (s *Server) getUserIdFromRequest(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		token := authHeader[7:]
		claims, err := user.ParseToken(token, s.Config.JWTSecret)
		if err == nil {
			return claims.UserID
		}
	}
	return ""
}

func (s *Server) internalError(c *gin.Context, err error) {
	slog.Error("internal error", "path", c.Request.URL.Path, "error", err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
}

func (s *Server) handleGetPermissions(c *gin.Context) {
	docID := c.Param("id")
	userID := s.getUserIdFromRequest(c)

	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		s.internalError(c, err)
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	permissions, err := s.DB.GetDocumentPermissions(docID)
	if err != nil {
		s.internalError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"permissions": permissions})
}

func (s *Server) handleSetPermission(c *gin.Context) {
	docID := c.Param("id")
	userID := s.getUserIdFromRequest(c)

	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessAdmin)
	if err != nil {
		s.internalError(c, err)
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied. Admin privileges required."})
		return
	}

	var req struct {
		UserID string `json:"userId" binding:"required"`
		Access string `json:"access" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Access != storage.AccessRead && req.Access != storage.AccessWrite && req.Access != storage.AccessAdmin {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid access level. Must be read, write, or admin."})
		return
	}

	if err := s.DB.SetPermission(docID, req.UserID, req.Access); err != nil {
		s.internalError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (s *Server) handleCRDTState(c *gin.Context) {
	docID := c.Param("id")

	userID := s.getUserIdFromRequest(c)
	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	doc := s.CRDTStore.Get(docID)
	c.JSON(http.StatusOK, gin.H{
		"docId":  docID,
		"state":  doc.GetState(),
		"vector": doc.GetVector(),
	})
}

func (s *Server) handleCRDTSync(c *gin.Context) {
	docID := c.Param("id")

	userID := s.getUserIdFromRequest(c)
	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var req struct {
		Operations []crdt.Operation `json:"operations"`
		Vector     map[string]int64 `json:"vector"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	doc := s.CRDTStore.Get(docID)

	for _, op := range req.Operations {
		doc.ApplyOperation(op)
	}

	missedOps := doc.GetOperationsSince(req.Vector)

	c.JSON(http.StatusOK, gin.H{
		"docId":      docID,
		"operations": missedOps,
		"vector":     doc.GetVector(),
	})
}

func (s *Server) handleDeletePermission(c *gin.Context) {
	docID := c.Param("id")
	targetUserID := c.Param("userId")
	userID := s.getUserIdFromRequest(c)

	hasAccess, err := s.DB.CheckAccess(docID, userID, storage.AccessAdmin)
	if err != nil {
		s.internalError(c, err)
		return
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied. Admin privileges required."})
		return
	}

	if err := s.DB.DeletePermission(docID, targetUserID); err != nil {
		s.internalError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
