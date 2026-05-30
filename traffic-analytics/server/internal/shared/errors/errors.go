package errors

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type AppError struct {
	Message       string       `json:"message"`
	Code          string       `json:"code"`
	StatusCode    int          `json:"-"`
	IsOperational bool         `json:"-"`
	Fields        []FieldError `json:"fields,omitempty"`
}

func (e *AppError) Error() string {
	if len(e.Fields) > 0 {
		return fmt.Sprintf("%s: %s (fields: %v)", e.Code, e.Message, e.Fields)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func NotFoundError(resource, id string) *AppError {
	return &AppError{
		Message:       fmt.Sprintf("%s with id %q not found", resource, id),
		Code:          "NOT_FOUND",
		StatusCode:    http.StatusNotFound,
		IsOperational: true,
	}
}

func ValidationError(fields []FieldError) *AppError {
	return &AppError{
		Message:       "Validation failed",
		Code:          "VALIDATION_ERROR",
		StatusCode:    http.StatusUnprocessableEntity,
		IsOperational: true,
		Fields:        fields,
	}
}

func UnauthorizedError(msg string) *AppError {
	return &AppError{
		Message:       msg,
		Code:          "UNAUTHORIZED",
		StatusCode:    http.StatusUnauthorized,
		IsOperational: true,
	}
}

func ForbiddenError(msg string) *AppError {
	return &AppError{
		Message:       msg,
		Code:          "FORBIDDEN",
		StatusCode:    http.StatusForbidden,
		IsOperational: true,
	}
}

func ConflictError(msg string) *AppError {
	return &AppError{
		Message:       msg,
		Code:          "CONFLICT",
		StatusCode:    http.StatusConflict,
		IsOperational: true,
	}
}

func RateLimitError() *AppError {
	return &AppError{
		Message:       "Too many requests, please try again later",
		Code:          "RATE_LIMIT_EXCEEDED",
		StatusCode:    http.StatusTooManyRequests,
		IsOperational: true,
	}
}

func InternalError(msg string) *AppError {
	return &AppError{
		Message:       msg,
		Code:          "INTERNAL_ERROR",
		StatusCode:    http.StatusInternalServerError,
		IsOperational: false,
	}
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) == 0 {
			return
		}

		err := c.Errors.Last().Err

		if appErr, ok := err.(*AppError); ok {
			c.JSON(appErr.StatusCode, appErr)
			return
		}

		c.JSON(http.StatusInternalServerError, &AppError{
			Message:       "An unexpected error occurred",
			Code:          "INTERNAL_ERROR",
			StatusCode:    http.StatusInternalServerError,
			IsOperational: false,
		})
	}
}

func AbortWithAppError(c *gin.Context, err *AppError) {
	_ = c.Error(err)
	c.Abort()
}
