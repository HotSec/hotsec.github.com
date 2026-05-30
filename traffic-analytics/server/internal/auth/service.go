package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/traffic-analytics/server/internal/config"
	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

type AuthService struct {
	repo AuthRepository
	cfg  *config.Config
}

func NewAuthService(repo AuthRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *AuthService) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error) {
	if !emailRegex.MatchString(req.Email) {
		return nil, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "email", Message: "Invalid email format"},
		})
	}

	if len(req.Password) < 8 {
		return nil, appErrors.ValidationError([]appErrors.FieldError{
			{Field: "password", Message: "Password must be at least 8 characters"},
		})
	}

	existing, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		logger.S.Errorw("failed to check existing email", "email", req.Email, "error", err)
		return nil, appErrors.InternalError("Failed to check email availability")
	}
	if existing != nil {
		return nil, appErrors.ConflictError("Email is already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.S.Errorw("failed to hash password", "error", err)
		return nil, appErrors.InternalError("Failed to process password")
	}

	user, err := s.repo.Create(ctx, req.Email, string(hashedPassword), req.Name)
	if err != nil {
		logger.S.Errorw("failed to create user", "email", req.Email, "error", err)
		return nil, appErrors.InternalError("Failed to create user")
	}

	accessToken, refreshToken, err := s.generateTokenPair(user)
	if err != nil {
		return nil, appErrors.InternalError("Failed to generate tokens")
	}

	if err := s.storeRefreshToken(ctx, user.ID, refreshToken); err != nil {
		logger.S.Errorw("failed to store refresh token", "user_id", user.ID, "error", err)
		return nil, appErrors.InternalError("Failed to store refresh token")
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         toUserResponse(user),
	}, nil
}

func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	user, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		logger.S.Errorw("failed to find user by email", "email", req.Email, "error", err)
		return nil, appErrors.InternalError("Failed to find user")
	}
	if user == nil {
		return nil, appErrors.UnauthorizedError("Invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, appErrors.UnauthorizedError("Invalid email or password")
	}

	accessToken, refreshToken, err := s.generateTokenPair(user)
	if err != nil {
		return nil, appErrors.InternalError("Failed to generate tokens")
	}

	if err := s.storeRefreshToken(ctx, user.ID, refreshToken); err != nil {
		logger.S.Errorw("failed to store refresh token", "user_id", user.ID, "error", err)
		return nil, appErrors.InternalError("Failed to store refresh token")
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         toUserResponse(user),
	}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, req RefreshRequest) (*AuthResponse, error) {
	tokenHash := hashToken(req.RefreshToken)

	storedToken, err := s.repo.FindRefreshToken(ctx, tokenHash)
	if err != nil {
		logger.S.Errorw("failed to find refresh token", "error", err)
		return nil, appErrors.InternalError("Failed to validate refresh token")
	}
	if storedToken == nil {
		return nil, appErrors.UnauthorizedError("Invalid refresh token")
	}

	if time.Now().After(storedToken.ExpiresAt) {
		_ = s.repo.DeleteRefreshToken(ctx, tokenHash)
		return nil, appErrors.UnauthorizedError("Refresh token has expired")
	}

	user, err := s.repo.FindByID(ctx, storedToken.UserID)
	if err != nil {
		logger.S.Errorw("failed to find user for refresh token", "user_id", storedToken.UserID, "error", err)
		return nil, appErrors.InternalError("Failed to find user")
	}
	if user == nil {
		_ = s.repo.DeleteRefreshToken(ctx, tokenHash)
		return nil, appErrors.UnauthorizedError("User not found")
	}

	if err := s.repo.DeleteRefreshToken(ctx, tokenHash); err != nil {
		logger.S.Errorw("failed to delete old refresh token", "error", err)
		return nil, appErrors.InternalError("Failed to rotate refresh token")
	}

	accessToken, newRefreshToken, err := s.generateTokenPair(user)
	if err != nil {
		return nil, appErrors.InternalError("Failed to generate tokens")
	}

	if err := s.storeRefreshToken(ctx, user.ID, newRefreshToken); err != nil {
		logger.S.Errorw("failed to store new refresh token", "user_id", user.ID, "error", err)
		return nil, appErrors.InternalError("Failed to store refresh token")
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		User:         toUserResponse(user),
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	tokenHash := hashToken(refreshToken)

	storedToken, err := s.repo.FindRefreshToken(ctx, tokenHash)
	if err != nil {
		logger.S.Errorw("failed to find refresh token for logout", "error", err)
		return appErrors.InternalError("Failed to logout")
	}
	if storedToken == nil {
		return nil
	}

	if err := s.repo.DeleteRefreshToken(ctx, tokenHash); err != nil {
		logger.S.Errorw("failed to delete refresh token on logout", "error", err)
		return appErrors.InternalError("Failed to logout")
	}

	return nil
}

func (s *AuthService) GetCurrentUser(ctx context.Context, userID string) (*UserResponse, error) {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		logger.S.Errorw("failed to find user by id", "id", userID, "error", err)
		return nil, appErrors.InternalError("Failed to find user")
	}
	if user == nil {
		return nil, appErrors.NotFoundError("User", userID)
	}

	resp := toUserResponse(user)
	return &resp, nil
}

func (s *AuthService) generateTokenPair(user *User) (string, string, error) {
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return accessToken, refreshToken, nil
}

func (s *AuthService) generateAccessToken(user *User) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"role":  user.Role,
		"iat":   now.Unix(),
		"exp":   now.Add(s.cfg.JWTExpiresIn).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) generateRefreshToken(user *User) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"type":  "refresh",
		"iat":   now.Unix(),
		"exp":   now.Add(s.cfg.JWTRefreshExpiresIn).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) storeRefreshToken(ctx context.Context, userID, refreshToken string) error {
	tokenHash := hashToken(refreshToken)
	expiresAt := time.Now().Add(s.cfg.JWTRefreshExpiresIn)
	return s.repo.StoreRefreshToken(ctx, userID, tokenHash, expiresAt)
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

func toUserResponse(user *User) UserResponse {
	return UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}
}
