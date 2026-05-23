package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	apperr "onlinenote/internal/errors"
	"onlinenote/internal/crdt"
	"onlinenote/internal/middleware"
	"onlinenote/internal/storage"
)

type CRDTHandler struct {
	DB        *storage.Database
	CRDTStore *crdt.DocumentStore
}

func (h *CRDTHandler) GetState(c *gin.Context) {
	docID := c.Param("id")
	userID := middleware.GetUserID(c)

	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied"))
		return
	}

	doc := h.CRDTStore.Get(docID)
	c.JSON(http.StatusOK, gin.H{
		"docId":  docID,
		"state":  doc.GetState(),
		"vector": doc.GetVector(),
	})
}

func (h *CRDTHandler) Sync(c *gin.Context) {
	docID := c.Param("id")
	userID := middleware.GetUserID(c)

	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessRead)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied"))
		return
	}

	var req struct {
		Operations []crdt.Operation `json:"operations"`
		Vector     map[string]int64 `json:"vector"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.AbortWithError(c, apperr.NewBadRequest(err.Error()))
		return
	}

	doc := h.CRDTStore.Get(docID)

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