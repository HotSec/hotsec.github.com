package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"onlinenote/internal/storage"
)

type HealthHandler struct {
	DB *storage.Database
}

func (h *HealthHandler) Liveness(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *HealthHandler) Readiness(c *gin.Context) {
	checks := map[string]string{}

	if err := h.DB.DB().Ping(); err != nil {
		checks["database"] = "error: " + err.Error()
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "degraded",
			"checks": checks,
		})
		return
	}
	checks["database"] = "ok"

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"checks": checks,
	})
}