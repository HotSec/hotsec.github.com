package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
)

type AuthHandler struct {
	service *AuthService
}

func NewAuthHandler(service *AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

func (h *AuthHandler) RegisterRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.RefreshToken)
		auth.POST("/logout", h.Logout)
		auth.GET("/me", h.GetCurrentUser)
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError(parseBindingErrors(err)))
		return
	}

	resp, err := h.service.Register(c.Request.Context(), req)
	if err != nil {
		abortWithError(c, err)
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError(parseBindingErrors(err)))
		return
	}

	resp, err := h.service.Login(c.Request.Context(), req)
	if err != nil {
		abortWithError(c, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError(parseBindingErrors(err)))
		return
	}

	resp, err := h.service.RefreshToken(c.Request.Context(), req)
	if err != nil {
		abortWithError(c, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErrors.AbortWithAppError(c, appErrors.ValidationError(parseBindingErrors(err)))
		return
	}

	if err := h.service.Logout(c.Request.Context(), req.RefreshToken); err != nil {
		abortWithError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		appErrors.AbortWithAppError(c, appErrors.UnauthorizedError("User not authenticated"))
		return
	}

	resp, err := h.service.GetCurrentUser(c.Request.Context(), userID.(string))
	if err != nil {
		abortWithError(c, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}

func abortWithError(c *gin.Context, err error) {
	if appErr, ok := err.(*appErrors.AppError); ok {
		appErrors.AbortWithAppError(c, appErr)
		return
	}
	appErrors.AbortWithAppError(c, appErrors.InternalError("An unexpected error occurred"))
}

func parseBindingErrors(err error) []appErrors.FieldError {
	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		fields := make([]appErrors.FieldError, 0, len(validationErrs))
		for _, ve := range validationErrs {
			field := toCamelCase(ve.Field())
			fields = append(fields, appErrors.FieldError{
				Field:   field,
				Message: validationMessage(ve),
			})
		}
		return fields
	}

	return []appErrors.FieldError{
		{Field: "body", Message: "Invalid request body: " + err.Error()},
	}
}

func validationMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return fe.Field() + " is required"
	case "email":
		return "Invalid email format"
	case "min":
		return fe.Field() + " must be at least " + fe.Param() + " characters"
	default:
		return fe.Field() + " failed validation: " + fe.Tag()
	}
}

func toCamelCase(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}
