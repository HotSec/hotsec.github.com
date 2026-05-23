package middleware

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	apperr "onlinenote/internal/errors"
)

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) == 0 {
			return
		}

		err := c.Errors.Last().Err

		if appErr, ok := err.(*apperr.AppError); ok {
			c.JSON(appErr.StatusCode, gin.H{
				"code":       appErr.Code,
				"message":    appErr.Message,
				"request_id": GetRequestID(c),
			})
			return
		}

		slog.Error("unexpected error",
			"path", c.Request.URL.Path,
			"method", c.Request.Method,
			"request_id", GetRequestID(c),
			"error", err.Error(),
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"code":       "INTERNAL_ERROR",
			"message":    "Internal server error",
			"request_id": GetRequestID(c),
		})
	}
}

func AbortWithError(c *gin.Context, err *apperr.AppError) {
	_ = c.Error(err)
	c.AbortWithStatusJSON(err.StatusCode, gin.H{
		"code":       err.Code,
		"message":    err.Message,
		"request_id": GetRequestID(c),
	})
}