package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	apperr "onlinenote/internal/errors"
	"onlinenote/internal/middleware"
	"onlinenote/internal/storage"
)

type PermissionHandler struct {
	DB *storage.Database
}

func (h *PermissionHandler) GetPermissions(c *gin.Context) {
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

	permissions, err := h.DB.GetDocumentPermissions(docID)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"permissions": permissions})
}

func (h *PermissionHandler) SetPermission(c *gin.Context) {
	docID := c.Param("id")
	userID := middleware.GetUserID(c)

	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessAdmin)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied. Admin privileges required."))
		return
	}

	var req struct {
		UserID string `json:"userId" binding:"required"`
		Access string `json:"access" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.AbortWithError(c, apperr.NewBadRequest(err.Error()))
		return
	}

	if req.Access != storage.AccessRead && req.Access != storage.AccessWrite && req.Access != storage.AccessAdmin {
		middleware.AbortWithError(c, apperr.NewBadRequest("Invalid access level. Must be read, write, or admin."))
		return
	}

	if err := h.DB.SetPermission(docID, req.UserID, req.Access); err != nil {
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *PermissionHandler) DeletePermission(c *gin.Context) {
	docID := c.Param("id")
	targetUserID := c.Param("userId")
	userID := middleware.GetUserID(c)

	hasAccess, err := h.DB.CheckAccess(docID, userID, storage.AccessAdmin)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}
	if !hasAccess {
		middleware.AbortWithError(c, apperr.NewForbidden("Access denied. Admin privileges required."))
		return
	}

	if err := h.DB.DeletePermission(docID, targetUserID); err != nil {
		middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}