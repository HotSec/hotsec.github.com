package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"

	apperr "onlinenote/internal/errors"
	"onlinenote/internal/crdt"
	"onlinenote/internal/document"
	"onlinenote/internal/middleware"
	"onlinenote/internal/storage"
	ws "onlinenote/internal/websocket"
)

type DocumentHandler struct {
	DB        *storage.Database
	DocMgr    *document.Manager
	CRDTStore *crdt.DocumentStore
	Hub       *ws.Hub
	Config    *DocumentHandlerConfig
}

type DocumentHandlerConfig struct {
	MarkdownDir string
	StaticDir   string
}

func (h *DocumentHandler) resolveSrcPath(src string) string {
	resolved := src
	if len(resolved) >= 2 && resolved[:2] == "./" {
		resolved = resolved[2:]
	}
	if h.Config.MarkdownDir != "" {
		mdPath := filepath.Join(h.Config.MarkdownDir, resolved)
		if _, err := os.Stat(mdPath); err == nil {
			return mdPath
		}
	}
	staticPath := filepath.Join(h.Config.StaticDir, resolved)
	if _, err := os.Stat(staticPath); err == nil {
		return staticPath
	}
	return ""
}

func (h *DocumentHandler) Get(c *gin.Context) {
	docID := c.Param("id")
	src := c.Query("src")
	userID := middleware.GetUserID(c)

	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		slog.Error("check access failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied"))
		return
	}

	doc, err := h.DocMgr.Load(docID)
	if err != nil {
		slog.Error("load document failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	if doc.Content == "" && src != "" {
		filePath := h.resolveSrcPath(src)
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

func (h *DocumentHandler) Save(c *gin.Context) {
	docID := c.Param("id")
	src := c.Query("src")
	userID := middleware.GetUserID(c)

	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessWrite)
	if err != nil {
		slog.Error("check access failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied"))
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
		UserID  string `json:"userId,omitempty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.AbortWithError(c, apperr.NewBadRequest(err.Error()))
		return
	}

	if req.UserID == "" {
		req.UserID = "anonymous"
	}

	if src != "" {
		filePath := h.resolveSrcPath(src)
		if filePath == "" {
			middleware.AbortWithError(c, apperr.NewNotFound("file", src))
			return
		}
		if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
			slog.Error("create dir failed", "path", filePath, "error", err)
			middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
			return
		}
		if err := os.WriteFile(filePath, []byte(req.Content), 0644); err != nil {
			slog.Error("write file failed", "path", filePath, "error", err)
			middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
			return
		}
		if err := h.DB.SaveDocumentVersion(docID, req.Content, req.UserID); err != nil {
			slog.Warn("failed to save document version for src", "error", err)
		}
		c.JSON(http.StatusOK, gin.H{
			"id":      docID,
			"version": 1,
			"src":     src,
		})
		return
	}

	if err := h.DocMgr.Save(docID, req.Content); err != nil {
		slog.Error("save document failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	if err := h.DB.SaveDocumentVersion(docID, req.Content, req.UserID); err != nil {
		slog.Warn("failed to save document version", "error", err)
	}

	doc, err := h.DocMgr.Load(docID)
	if err != nil {
		slog.Error("load document after save failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	msg, _ := json.Marshal(ws.Message{
		Type:   "document-saved",
		DocID:  docID,
		UserID: req.UserID,
	})
	h.Hub.Broadcast(docID, msg, nil)

	c.JSON(http.StatusOK, gin.H{
		"id":      doc.ID,
		"version": doc.Version,
	})
}

func (h *DocumentHandler) GetVersions(c *gin.Context) {
	docID := c.Param("id")
	userID := middleware.GetUserID(c)

	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		slog.Error("check access failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied"))
		return
	}

	versions, err := h.DocMgr.ListVersions(docID)
	if err != nil {
		slog.Error("list versions failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	dbVersions, err := h.DB.GetDocumentVersions(docID)
	if err != nil {
		slog.Error("get db versions failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"docId":    docID,
		"files":    versions,
		"database": dbVersions,
	})
}

func (h *DocumentHandler) GetVersion(c *gin.Context) {
	docID := c.Param("id")
	versionStr := c.Param("version")
	version, err := strconv.Atoi(versionStr)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewBadRequest("invalid version"))
		return
	}

	userID := middleware.GetUserID(c)
	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		slog.Error("check access failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied"))
		return
	}

	dbVersion, err := h.DB.GetDocumentVersion(docID, version)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewNotFound("version", versionStr))
		return
	}

	c.JSON(http.StatusOK, dbVersion)
}

func (h *DocumentHandler) Rollback(c *gin.Context) {
	docID := c.Param("id")
	versionStr := c.Param("version")
	version, err := strconv.Atoi(versionStr)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewBadRequest("invalid version"))
		return
	}

	userID := middleware.GetUserID(c)
	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessWrite)
	if err != nil {
		slog.Error("check access failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied"))
		return
	}

	var req struct {
		UserID string `json:"userId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		req.UserID = "anonymous"
	}

	newVersion, err := h.DB.RollbackToVersion(docID, version, req.UserID)
	if err != nil {
		slog.Error("rollback failed", "docId", docID, "version", version, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	if err := h.DocMgr.Save(docID, newVersion.Content); err != nil {
		slog.Error("save after rollback failed", "docId", docID, "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	crdtDoc := h.CRDTStore.Get(docID)
	crdtDoc.ResetFromContent(newVersion.Content)

	msg, _ := json.Marshal(ws.Message{
		Type:   "document-rollback",
		DocID:  docID,
		UserID: req.UserID,
		Data:   json.RawMessage(`{"version":` + strconv.Itoa(newVersion.Version) + `}`),
	})
	h.Hub.Broadcast(docID, msg, nil)

	c.JSON(http.StatusOK, newVersion)
}