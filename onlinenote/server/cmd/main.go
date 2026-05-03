package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"onlinenote/config"
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
		return true
	},
}

type Server struct {
	Config *config.Config
	DB     *storage.Database
	DocMgr *document.Manager
	Hub    *ws.Hub
}

func main() {
	cfg := config.Load()

	db, err := storage.NewDatabase(cfg.DataDir)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	docMgr := document.NewManager(cfg.DataDir, cfg.StaticDir)
	hub := ws.NewHub()
	go hub.Run()

	srv := &Server{
		Config: cfg,
		DB:     db,
		DocMgr: docMgr,
		Hub:    hub,
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
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
		}
	}

	r.GET("/ws", srv.handleWebSocket)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func (s *Server) handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
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
		color = user.AssignColor(len(s.Hub.GetDocUsers(docID)))
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
		Color:        user.AssignColor(0),
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

	doc, err := s.DocMgr.Load(docID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if src != "" {
		filePath := s.resolveSrcPath(src)
		if filePath == "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
			return
		}
		if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err := os.WriteFile(filePath, []byte(req.Content), 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"id":      docID,
			"version": 1,
			"src":     src,
		})
		return
	}

	if err := s.DocMgr.Save(docID, req.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	doc, _ := s.DocMgr.Load(docID)

	msg, _ := json.Marshal(ws.Message{
		Type:   "document-saved",
		DocID:  docID,
		UserID: "server",
	})
	s.Hub.Broadcast(docID, msg, nil)

	c.JSON(http.StatusOK, gin.H{
		"id":      doc.ID,
		"version": doc.Version,
	})
}

func (s *Server) handleGetVersions(c *gin.Context) {
	docID := c.Param("id")
	versions, err := s.DocMgr.ListVersions(docID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"docId":    docID,
		"versions": versions,
	})
}
