package analytics

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
)

type AnalyticsHandler struct {
	service *AnalyticsService
}

func NewAnalyticsHandler(service *AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: service}
}

func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	siteID := c.Query("site_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	startDate, endDate, appErr := parseDateRange(startDateStr, endDateStr)
	if appErr != nil {
		appErrors.AbortWithAppError(c, appErr)
		return
	}

	overview, err := h.service.GetOverview(c.Request.Context(), siteID, startDate, endDate)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, overview)
}

func (h *AnalyticsHandler) GetComparison(c *gin.Context) {
	siteID := c.Query("site_id")
	currentStartStr := c.Query("current_start")
	currentEndStr := c.Query("current_end")
	prevStartStr := c.Query("prev_start")
	prevEndStr := c.Query("prev_end")

	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	currentStart, currentEnd, appErr := parseDateRange(currentStartStr, currentEndStr)
	if appErr != nil {
		appErrors.AbortWithAppError(c, appErr)
		return
	}

	prevStart, prevEnd, appErr := parseDateRange(prevStartStr, prevEndStr)
	if appErr != nil {
		appErrors.AbortWithAppError(c, appErr)
		return
	}

	comparison, err := h.service.GetComparison(c.Request.Context(), siteID, currentStart, currentEnd, prevStart, prevEnd)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, comparison)
}

func (h *AnalyticsHandler) GetDailyStats(c *gin.Context) {
	siteID := c.Query("site_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if siteID == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "site_id", Message: "site_id query parameter is required"},
		}))
		return
	}

	startDate, endDate, appErr := parseDateRange(startDateStr, endDateStr)
	if appErr != nil {
		appErrors.AbortWithAppError(c, appErr)
		return
	}

	stats, err := h.service.GetDailyStats(c.Request.Context(), siteID, startDate, endDate)
	if err != nil {
		appErrors.AbortWithAppError(c, err.(*appErrors.AppError))
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func parseDateRange(startStr, endStr string) (time.Time, time.Time, *appErrors.AppError) {
	if startStr == "" || endStr == "" {
		return time.Time{}, time.Time{}, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "dates", Message: "start_date and end_date query parameters are required (format: 2006-01-02)"},
		})
	}

	startDate, err := time.Parse("2006-01-02", startStr)
	if err != nil {
		return time.Time{}, time.Time{}, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "start_date", Message: "invalid start_date format, use YYYY-MM-DD"},
		})
	}

	endDate, err := time.Parse("2006-01-02", endStr)
	if err != nil {
		return time.Time{}, time.Time{}, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "end_date", Message: "invalid end_date format, use YYYY-MM-DD"},
		})
	}

	return startDate, endDate.AddDate(0, 0, 1), nil
}

func (h *AnalyticsHandler) RegisterRoutes(rg *gin.RouterGroup) {
	analytics := rg.Group("/analytics")
	{
		analytics.GET("/overview", h.GetOverview)
		analytics.GET("/comparison", h.GetComparison)
		analytics.GET("/daily", h.GetDailyStats)
	}
}
