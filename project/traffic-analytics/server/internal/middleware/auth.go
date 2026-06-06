package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/traffic-analytics/server/internal/config"
	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
)

var skipPaths = map[string]bool{
	"/api/auth/login":         true,
	"/api/auth/register":      true,
	"/api/ingest":             true,
	"/api/ingest/batch":       true,
	"/health":                 true,
	"/ready":                  true,
}

func Auth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if skipPaths[c.Request.URL.Path] {
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			appErrors.AbortWithAppError(c, appErrors.UnauthorizedError("Authorization header is required"))
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			appErrors.AbortWithAppError(c, appErrors.UnauthorizedError("Authorization header must be in the format: Bearer <token>"))
			return
		}

		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, appErrors.UnauthorizedError("unexpected signing method")
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil {
			appErrors.AbortWithAppError(c, appErrors.UnauthorizedError("Invalid or expired token"))
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			appErrors.AbortWithAppError(c, appErrors.UnauthorizedError("Invalid token claims"))
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			appErrors.AbortWithAppError(c, appErrors.UnauthorizedError("Invalid token: missing user id"))
			return
		}

		email, _ := claims["email"].(string)

		c.Set("user_id", userID)
		c.Set("email", email)
		c.Next()
	}
}
