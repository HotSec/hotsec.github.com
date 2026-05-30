package sites

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
)

type SitesHandler struct {
	service *SitesService
}

func NewSitesHandler(service *SitesService) *SitesHandler {
	return &SitesHandler{service: service}
}

func (h *SitesHandler) CreateSite(c *gin.Context) {
	var req CreateSiteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "body", Message: "invalid request body: " + err.Error()},
		}))
		return
	}

	userID, _ := c.Get("user_id")

	site, err := h.service.CreateSite(c.Request.Context(), req, userID.(string))
	if err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok {
			appErrors.AbortWithAppError(c, appErr)
			return
		}
		appErrors.AbortWithAppError(c, appErrors.InternalError("failed to create site"))
		return
	}

	c.JSON(http.StatusCreated, site)
}

func (h *SitesHandler) ListSites(c *gin.Context) {
	userID, _ := c.Get("user_id")

	sites, err := h.service.ListSites(c.Request.Context(), userID.(string))
	if err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok {
			appErrors.AbortWithAppError(c, appErr)
			return
		}
		appErrors.AbortWithAppError(c, appErrors.InternalError("failed to list sites"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": sites})
}

func (h *SitesHandler) GetSite(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "id", Message: "site id is required"},
		}))
		return
	}

	site, err := h.service.GetSite(c.Request.Context(), id)
	if err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok {
			appErrors.AbortWithAppError(c, appErr)
			return
		}
		appErrors.AbortWithAppError(c, appErrors.InternalError("failed to get site"))
		return
	}

	c.JSON(http.StatusOK, site)
}

func (h *SitesHandler) DeleteSite(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		appErrors.AbortWithAppError(c, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "id", Message: "site id is required"},
		}))
		return
	}

	if err := h.service.DeleteSite(c.Request.Context(), id); err != nil {
		if appErr, ok := err.(*appErrors.AppError); ok {
			appErrors.AbortWithAppError(c, appErr)
			return
		}
		appErrors.AbortWithAppError(c, appErrors.InternalError("failed to delete site"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "site deleted"})
}

func (h *SitesHandler) RegisterRoutes(rg *gin.RouterGroup) {
	sites := rg.Group("/sites")
	{
		sites.POST("", h.CreateSite)
		sites.GET("", h.ListSites)
		sites.GET("/:id", h.GetSite)
		sites.DELETE("/:id", h.DeleteSite)
	}
}
