package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"onlinenote/config"
	"onlinenote/internal/crdt"
	"onlinenote/internal/document"
	"onlinenote/internal/handler"
	"onlinenote/internal/middleware"
	"onlinenote/internal/storage"
	ws "onlinenote/internal/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	gws "github.com/gorilla/websocket"
)

func main() {
	cfg := config.Load()

	db, err := storage.NewDatabase(cfg.DataDir)
	if err != nil {
		slog.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	docMgr := document.NewManager(cfg.DataDir, cfg.StaticDir)
	crdtStore := crdt.NewDocumentStore()

	hub := ws.NewHub()
	hub.OnCRDTOp = func(docID string, userID string, data []byte) {
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
	}
	go hub.Run()

	authH := &handler.AuthHandler{DB: db, JWTSecret: cfg.JWTSecret}

	docH := &handler.DocumentHandler{
		DB:        db,
		DocMgr:    docMgr,
		CRDTStore: crdtStore,
		Hub:       hub,
		Config: &handler.DocumentHandlerConfig{
			MarkdownDir: cfg.MarkdownDir,
			StaticDir:   cfg.StaticDir,
		},
	}

	permH := &handler.PermissionHandler{DB: db}
	crdtH := &handler.CRDTHandler{DB: db, CRDTStore: crdtStore}
	healthH := &handler.HealthHandler{DB: db}

	wsH := &handler.WebSocketHandler{
		Hub: hub,
		Upgrader: gws.Upgrader{
			ReadBufferSize:  cfg.WSReadSize,
			WriteBufferSize: cfg.WSWriteSize,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	r.Use(middleware.RequestID())
	r.Use(middleware.SecurityHeaders())
	r.Use(gin.Logger())

	corsCfg := cors.DefaultConfig()
	if len(cfg.CORSOrigins) == 1 && cfg.CORSOrigins[0] == "*" {
		corsCfg.AllowAllOrigins = true
	} else {
		corsCfg.AllowOrigins = cfg.CORSOrigins
	}
	corsCfg.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsCfg.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "X-Request-ID"}
	corsCfg.ExposeHeaders = []string{"Content-Length", "X-Request-ID"}
	r.Use(cors.New(corsCfg))

	r.Use(middleware.Auth(cfg.JWTSecret))
	r.Use(middleware.ErrorHandler())

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
		c.File(cfg.StaticDir + "/index.html")
	})

	r.GET("/health", healthH.Liveness)
	r.GET("/ready", healthH.Readiness)

	api := r.Group("/api")
	{
		api.POST("/auth/register", authH.Register)
		api.POST("/auth/login", authH.Login)

		docs := api.Group("/documents")
		{
			docs.GET("/:id", docH.Get)
			docs.PUT("/:id", docH.Save)
			docs.GET("/:id/versions", docH.GetVersions)
			docs.GET("/:id/versions/:version", docH.GetVersion)
			docs.POST("/:id/rollback/:version", docH.Rollback)
			docs.GET("/:id/permissions", permH.GetPermissions)
			docs.PUT("/:id/permissions", permH.SetPermission)
			docs.DELETE("/:id/permissions/:userId", permH.DeletePermission)
			docs.GET("/:id/crdt/state", crdtH.GetState)
			docs.POST("/:id/crdt/sync", crdtH.Sync)
		}
	}

	r.GET("/ws", wsH.Handle)

	srv := &http.Server{
		Addr:           ":" + cfg.Port,
		Handler:        r,
		ReadTimeout:    time.Duration(cfg.ReadTimeout) * time.Second,
		WriteTimeout:   time.Duration(cfg.WriteTimeout) * time.Second,
		MaxHeaderBytes: cfg.MaxHeaderBytes,
	}

	go func() {
		slog.Info("server starting", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("server forced to shutdown", "error", err)
	}

	slog.Info("server exited")
}