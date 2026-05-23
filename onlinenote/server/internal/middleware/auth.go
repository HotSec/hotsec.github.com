package middleware

import (
	"github.com/gin-gonic/gin"

	"onlinenote/internal/user"
)

const (
	UserIDKey   = "user_id"
	UsernameKey = "username"
)

func Auth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			token := authHeader[7:]
			claims, err := user.ParseToken(token, jwtSecret)
			if err == nil {
				c.Set(UserIDKey, claims.UserID)
				c.Set(UsernameKey, claims.Username)
				c.Next()
				return
			}
		}

		userID := c.Query("userId")
		if userID != "" {
			c.Set(UserIDKey, userID)
			c.Set(UsernameKey, c.Query("userName"))
			c.Next()
			return
		}

		c.Set(UserIDKey, "")
		c.Next()
	}
}

func GetUserID(c *gin.Context) string {
	if uid, exists := c.Get(UserIDKey); exists {
		if s, ok := uid.(string); ok {
			return s
		}
	}
	return ""
}

func GetUsername(c *gin.Context) string {
	if uname, exists := c.Get(UsernameKey); exists {
		if s, ok := uname.(string); ok {
			return s
		}
	}
	return ""
}