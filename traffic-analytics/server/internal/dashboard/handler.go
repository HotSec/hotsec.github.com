package dashboard

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
)

type DashboardHandler struct {
	service *DashboardService
}

func NewDashboardHandler(service *DashboardService) *DashboardHandler {
	return &DashboardHandler{service: service}
}

func (h *DashboardHandler) GetRealtimeMetrics(c *gin.Context) {
	siteID := c.Query("site_id")
	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	metrics, err := h.service.GetRealtimeMetrics(c.Request.Context(), siteID)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, metrics)
}

func (h *DashboardHandler) GetTimeSeries(c *gin.Context) {
	siteID := c.Query("site_id")
	period := c.DefaultQuery("period", "24h")

	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	points, err := h.service.GetTimeSeries(c.Request.Context(), siteID, period)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": points})
}

func (h *DashboardHandler) GetTopPages(c *gin.Context) {
	siteID := c.Query("site_id")
	period := c.DefaultQuery("period", "24h")
	limitStr := c.DefaultQuery("limit", "10")

	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	pages, err := h.service.GetTopPages(c.Request.Context(), siteID, period, limit)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pages})
}

func (h *DashboardHandler) GetTrafficSources(c *gin.Context) {
	siteID := c.Query("site_id")
	period := c.DefaultQuery("period", "24h")

	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	sources, err := h.service.GetTrafficSources(c.Request.Context(), siteID, period)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": sources})
}

func (h *DashboardHandler) GetGeoData(c *gin.Context) {
	siteID := c.Query("site_id")
	period := c.DefaultQuery("period", "24h")

	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	geoData, err := h.service.GetGeoData(c.Request.Context(), siteID, period)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": geoData})
}

func (h *DashboardHandler) GetDeviceStats(c *gin.Context) {
	siteID := c.Query("site_id")
	period := c.DefaultQuery("period", "24h")

	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	stats, err := h.service.GetDeviceStats(c.Request.Context(), siteID, period)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func (h *DashboardHandler) RegisterRoutes(rg *gin.RouterGroup) {
	dashboard := rg.Group("/dashboard")
	{
		dashboard.GET("/realtime", h.GetRealtimeMetrics)
		dashboard.GET("/timeseries", h.GetTimeSeries)
		dashboard.GET("/top-pages", h.GetTopPages)
		dashboard.GET("/sources", h.GetTrafficSources)
		dashboard.GET("/geo", h.GetGeoData)
		dashboard.GET("/devices", h.GetDeviceStats)
	}
}
