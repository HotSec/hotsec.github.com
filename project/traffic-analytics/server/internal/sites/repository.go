package sites

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
)

type SitesRepository struct {
	pool *pgxpool.Pool
}

func NewSitesRepository(pool *pgxpool.Pool) *SitesRepository {
	return &SitesRepository{pool: pool}
}

func (r *SitesRepository) Create(ctx context.Context, userID, domain, name string) (Site, error) {
	trackingID := "ta_" + uuid.New().String()[:28]
	now := time.Now()

	var site Site
	err := r.pool.QueryRow(ctx, `
		INSERT INTO sites (user_id, domain, name, tracking_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`,
		userID, domain, name, trackingID, now, now,
	).Scan(&site.ID)

	if err != nil {
		logger.S.Errorw("failed to create site", "error", err)
		return Site{}, errors.InternalError("failed to create site")
	}

	site.UserID = userID
	site.Domain = domain
	site.Name = name
	site.TrackingID = trackingID
	site.CreatedAt = now
	site.UpdatedAt = now

	return site, nil
}

func (r *SitesRepository) FindByUserID(ctx context.Context, userID string) ([]Site, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, domain, name, tracking_id, created_at, updated_at
		FROM sites
		WHERE user_id = $1
		ORDER BY created_at DESC
	`,
		userID,
	)
	if err != nil {
		logger.S.Errorw("failed to find sites by user_id", "error", err)
		return nil, errors.InternalError("failed to find sites")
	}
	defer rows.Close()

	var sites []Site
	for rows.Next() {
		var s Site
		if err := rows.Scan(&s.ID, &s.UserID, &s.Domain, &s.Name, &s.TrackingID, &s.CreatedAt, &s.UpdatedAt); err != nil {
			logger.S.Errorw("failed to scan site", "error", err)
			continue
		}
		sites = append(sites, s)
	}

	return sites, nil
}

func (r *SitesRepository) FindByID(ctx context.Context, id string) (Site, error) {
	var s Site
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, domain, name, tracking_id, created_at, updated_at
		FROM sites
		WHERE id = $1
	`,
		id,
	).Scan(&s.ID, &s.UserID, &s.Domain, &s.Name, &s.TrackingID, &s.CreatedAt, &s.UpdatedAt)

	if err != nil {
		if err == pgx.ErrNoRows {
			return Site{}, errors.NotFoundError("site", id)
		}
		logger.S.Errorw("failed to find site by id", "error", err)
		return Site{}, errors.InternalError("failed to find site")
	}

	return s, nil
}

func (r *SitesRepository) FindByTrackingID(ctx context.Context, trackingID string) (Site, error) {
	var s Site
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, domain, name, tracking_id, created_at, updated_at
		FROM sites
		WHERE tracking_id = $1
	`,
		trackingID,
	).Scan(&s.ID, &s.UserID, &s.Domain, &s.Name, &s.TrackingID, &s.CreatedAt, &s.UpdatedAt)

	if err != nil {
		if err == pgx.ErrNoRows {
			return Site{}, errors.NotFoundError("site", trackingID)
		}
		logger.S.Errorw("failed to find site by tracking_id", "error", err)
		return Site{}, errors.InternalError("failed to find site")
	}

	return s, nil
}

func (r *SitesRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.pool.Exec(ctx, `
		DELETE FROM sites WHERE id = $1
	`,
		id,
	)
	if err != nil {
		logger.S.Errorw("failed to delete site", "error", err)
		return errors.InternalError("failed to delete site")
	}

	if tag.RowsAffected() == 0 {
		return errors.NotFoundError("site", id)
	}

	return nil
}
