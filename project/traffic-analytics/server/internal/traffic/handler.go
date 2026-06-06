package traffic

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
)

type TrafficHandler struct {
	service *TrafficService
}

func NewTrafficHandler(service *TrafficService) *TrafficHandler {
	return &TrafficHandler{service: service}
}

func (h *TrafficHandler) Ingest(c *gin.Context) {
	var req IngestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "body", Message: "invalid request body: " + err.Error()},
		}))
		return
	}

	if err := h.service.Ingest(c.Request.Context(), req); err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"status": "accepted"})
}

func (h *TrafficHandler) IngestBatch(c *gin.Context) {
	var req IngestBatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "body", Message: "invalid request body: " + err.Error()},
		}))
		return
	}

	if err := h.service.IngestBatch(c.Request.Context(), req); err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"status": "accepted", "count": len(req.Events)})
}

func (h *TrafficHandler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.POST("/ingest", h.Ingest)
	rg.POST("/ingest/batch", h.IngestBatch)
}
