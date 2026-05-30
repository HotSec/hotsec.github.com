package alert

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
)

type AlertHandler struct {
	service *AlertService
}

func NewAlertHandler(service *AlertService) *AlertHandler {
	return &AlertHandler{service: service}
}

func (h *AlertHandler) CreateRule(c *gin.Context) {
	var req CreateAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "body", Message: "invalid request body: " + err.Error()},
		}))
		return
	}

	userID, _ := c.Get("user_id")

	rule, err := h.service.CreateRule(c.Request.Context(), req, userID.(string))
	if err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok {
			appErrors.AbortWithAppError(c, appErr)
			return
		}
		appErrors.AbortWithAppError(c, appErrors.InternalError("failed to create alert rule"))
		return
	}

	c.JSON(http.StatusCreated, rule)
}

func (h *AlertHandler) ListRules(c *gin.Context) {
	siteID := c.Query("site_id")
	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	rules, err := h.service.ListRules(c.Request.Context(), siteID)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	if rules == nil {
		rules = []AlertRule{}
	}

	c.JSON(http.StatusOK, gin.H{"data": rules})
}

func (h *AlertHandler) UpdateRule(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "id", Message: "alert rule id is required"},
		}))
		return
	}

	var req UpdateAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "body", Message: "invalid request body: " + err.Error()},
		}))
		return
	}

	rule, err := h.service.UpdateRule(c.Request.Context(), id, req)
	if err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok {
			appErrors.AbortWithAppError(c, appErr)
			return
		}
		appErrors.AbortWithAppError(c, appErrors.InternalError("failed to update alert rule"))
		return
	}

	c.JSON(http.StatusOK, rule)
}

func (h *AlertHandler) DeleteRule(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "id", Message: "alert rule id is required"},
		}))
		return
	}

	if err := h.service.DeleteRule(c.Request.Context(), id); err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok {
			appErrors.AbortWithAppError(c, appErr)
			return
		}
		appErrors.AbortWithAppError(c, appErrors.InternalError("failed to delete alert rule"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "alert rule deleted"})
}

func (h *AlertHandler) RegisterRoutes(rg *gin.RouterGroup) {
	alerts := rg.Group("/alerts")
	{
		alerts.POST("", h.CreateRule)
		alerts.GET("", h.ListRules)
		alerts.PUT("/:id", h.UpdateRule)
		alerts.DELETE("/:id", h.DeleteRule)
	}
}
