package auth

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/traffic-analytics/server/internal/shared/logger"
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type RefreshToken struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	TokenHash string    `json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type AuthRepository interface {
	Create(ctx context.Context, email, passwordHash, name string) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindByID(ctx context.Context, id string) (*User, error)
	StoreRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error
	FindRefreshToken(ctx context.Context, tokenHash string) (*RefreshToken, error)
	DeleteRefreshToken(ctx context.Context, tokenHash string) error
	DeleteUserRefreshTokens(ctx context.Context, userID string) error
}

type postgresAuthRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresAuthRepository(pool *pgxpool.Pool) AuthRepository {
	return &postgresAuthRepository{pool: pool}
}

func (r *postgresAuthRepository) Create(ctx context.Context, email, passwordHash, name string) (*User, error) {
	var user User
	err := r.pool.QueryRow(ctx,
		`INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, password_hash, name, role, created_at, updated_at`,
		email, passwordHash, name,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		logger.S.Errorw("failed to create user", "email", email, "error", err)
		return nil, err
	}
	return &user, nil
}

func (r *postgresAuthRepository) FindByEmail(ctx context.Context, email string) (*User, error) {
	var user User
	err := r.pool.QueryRow(ctx,
		`SELECT id, email, password_hash, name, role, created_at, updated_at FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		logger.S.Errorw("failed to find user by email", "email", email, "error", err)
		return nil, err
	}
	return &user, nil
}

func (r *postgresAuthRepository) FindByID(ctx context.Context, id string) (*User, error) {
	var user User
	err := r.pool.QueryRow(ctx,
		`SELECT id, email, password_hash, name, role, created_at, updated_at FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		logger.S.Errorw("failed to find user by id", "id", id, "error", err)
		return nil, err
	}
	return &user, nil
}

func (r *postgresAuthRepository) StoreRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt,
	)
	if err != nil {
		logger.S.Errorw("failed to store refresh token", "user_id", userID, "error", err)
		return err
	}
	return nil
}

func (r *postgresAuthRepository) FindRefreshToken(ctx context.Context, tokenHash string) (*RefreshToken, error) {
	var rt RefreshToken
	err := r.pool.QueryRow(ctx,
		`SELECT id, user_id, token_hash, expires_at, created_at FROM refresh_tokens WHERE token_hash = $1`,
		tokenHash,
	).Scan(&rt.ID, &rt.UserID, &rt.TokenHash, &rt.ExpiresAt, &rt.CreatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		logger.S.Errorw("failed to find refresh token", "error", err)
		return nil, err
	}
	return &rt, nil
}

func (r *postgresAuthRepository) DeleteRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := r.pool.Exec(ctx,
		`DELETE FROM refresh_tokens WHERE token_hash = $1`,
		tokenHash,
	)
	if err != nil {
		logger.S.Errorw("failed to delete refresh token", "error", err)
		return err
	}
	return nil
}

func (r *postgresAuthRepository) DeleteUserRefreshTokens(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx,
		`DELETE FROM refresh_tokens WHERE user_id = $1`,
		userID,
	)
	if err != nil {
		logger.S.Errorw("failed to delete user refresh tokens", "user_id", userID, "error", err)
		return err
	}
	return nil
}
