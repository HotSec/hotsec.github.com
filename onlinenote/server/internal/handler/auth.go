package handler

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	apperr "onlinenote/internal/errors"
	"onlinenote/internal/middleware"
	"onlinenote/internal/storage"
	"onlinenote/internal/user"
)

type AuthHandler struct {
	DB        *storage.Database
	JWTSecret string
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required,min=6"`
		Email    string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.AbortWithError(c, apperr.NewBadRequest(err.Error()))
		return
	}

	hash, err := user.HashPassword(req.Password)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewInternal("Failed to hash password"))
		return
	}

	u := user.User{
		ID:           user.GenerateID(),
		Username:     req.Username,
		PasswordHash: hash,
		Email:        req.Email,
		Color:        user.AssignColor(0),
	}

	_, err = h.DB.DB().Exec(
		"INSERT INTO users (id, username, password_hash, email, color) VALUES (?, ?, ?, ?, ?)",
		u.ID, u.Username, u.PasswordHash, u.Email, u.Color,
	)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			middleware.AbortWithError(c, apperr.NewConflict("Username already exists"))
		} else {
			slog.Error("register insert user failed", "error", err)
			middleware.AbortWithError(c, apperr.NewInternal("Internal error"))
		}
		return
	}

	token, err := user.GenerateToken(u.ID, u.Username, h.JWTSecret)
	if err != nil {
		slog.Error("generate token failed", "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Failed to generate token"))
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user": gin.H{
			"id":       u.ID,
			"username": u.Username,
			"color":    u.Color,
		},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.AbortWithError(c, apperr.NewBadRequest(err.Error()))
		return
	}

	var u user.User
	err := h.DB.DB().QueryRow(
		"SELECT id, username, password_hash, color FROM users WHERE username = ?",
		req.Username,
	).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Color)
	if err != nil {
		middleware.AbortWithError(c, apperr.NewUnauthorized("Invalid credentials"))
		return
	}

	if !user.CheckPassword(req.Password, u.PasswordHash) {
		middleware.AbortWithError(c, apperr.NewUnauthorized("Invalid credentials"))
		return
	}

	token, err := user.GenerateToken(u.ID, u.Username, h.JWTSecret)
	if err != nil {
		slog.Error("generate token failed", "error", err)
		middleware.AbortWithError(c, apperr.NewInternal("Failed to generate token"))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       u.ID,
			"username": u.Username,
			"color":    u.Color,
		},
	})
}

func (h *AuthHandler) GetUserFromContext(c *gin.Context) string {
	return middleware.GetUserID(c)
}