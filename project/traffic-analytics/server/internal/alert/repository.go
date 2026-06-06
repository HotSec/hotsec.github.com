package alert

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
)

type AlertRepository struct {
	pool *pgxpool.Pool
}

func NewAlertRepository(pool *pgxpool.Pool) *AlertRepository {
	return &AlertRepository{pool: pool}
}

func (r *AlertRepository) Create(ctx context.Context, rule AlertRule) (AlertRule, error) {
	now := time.Now()
	err := r.pool.QueryRow(ctx, `
		INSERT INTO alert_rules (site_id, name, metric, condition, threshold, enabled, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`,
		rule.SiteID, rule.Name, rule.Metric, rule.Condition, rule.Threshold, rule.Enabled, now, now,
	).Scan(&rule.ID)

	if err != nil {
		logger.S.Errorw("failed to create alert rule", "error", err)
		return AlertRule{}, errors.InternalError("failed to create alert rule")
	}

	rule.CreatedAt = now
	rule.UpdatedAt = now
	return rule, nil
}

func (r *AlertRepository) FindBySiteID(ctx context.Context, siteID string) ([]AlertRule, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, site_id, name, metric, condition, threshold, enabled, created_at, updated_at
		FROM alert_rules
		WHERE site_id = $1
		ORDER BY created_at DESC
	`,
		siteID,
	)
	if err != nil {
		logger.S.Errorw("failed to find alert rules by site_id", "error", err)
		return nil, errors.InternalError("failed to find alert rules")
	}
	defer rows.Close()

	var rules []AlertRule
	for rows.Next() {
		var rule AlertRule
		if err := rows.Scan(&rule.ID, &rule.SiteID, &rule.Name, &rule.Metric, &rule.Condition, &rule.Threshold, &rule.Enabled, &rule.CreatedAt, &rule.UpdatedAt); err != nil {
			logger.S.Errorw("failed to scan alert rule", "error", err)
			continue
		}
		rules = append(rules, rule)
	}

	return rules, nil
}

func (r *AlertRepository) FindByID(ctx context.Context, id string) (AlertRule, error) {
	var rule AlertRule
	err := r.pool.QueryRow(ctx, `
		SELECT id, site_id, name, metric, condition, threshold, enabled, created_at, updated_at
		FROM alert_rules
		WHERE id = $1
	`,
		id,
	).Scan(&rule.ID, &rule.SiteID, &rule.Name, &rule.Metric, &rule.Condition, &rule.Threshold, &rule.Enabled, &rule.CreatedAt, &rule.UpdatedAt)

	if err != nil {
		if err == pgx.ErrNoRows {
			return AlertRule{}, errors.NotFoundError("alert_rule", id)
		}
		logger.S.Errorw("failed to find alert rule by id", "error", err)
		return AlertRule{}, errors.InternalError("failed to find alert rule")
	}

	return rule, nil
}

func (r *AlertRepository) Update(ctx context.Context, rule AlertRule) (AlertRule, error) {
	now := time.Now()
	err := r.pool.QueryRow(ctx, `
		UPDATE alert_rules
		SET name = $1, metric = $2, condition = $3, threshold = $4, enabled = $5, updated_at = $6
		WHERE id = $7
		RETURNING site_id, created_at
	`,
		rule.Name, rule.Metric, rule.Condition, rule.Threshold, rule.Enabled, now, rule.ID,
	).Scan(&rule.SiteID, &rule.CreatedAt)

	if err != nil {
		if err == pgx.ErrNoRows {
			return AlertRule{}, errors.NotFoundError("alert_rule", rule.ID)
		}
		logger.S.Errorw("failed to update alert rule", "error", err)
		return AlertRule{}, errors.InternalError("failed to update alert rule")
	}

	rule.UpdatedAt = now
	return rule, nil
}

func (r *AlertRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.pool.Exec(ctx, `
		DELETE FROM alert_rules WHERE id = $1
	`,
		id,
	)
	if err != nil {
		logger.S.Errorw("failed to delete alert rule", "error", err)
		return errors.InternalError("failed to delete alert rule")
	}

	if tag.RowsAffected() == 0 {
		return errors.NotFoundError("alert_rule", id)
	}

	return nil
}

func (r *AlertRepository) FindAllEnabled(ctx context.Context) ([]AlertRule, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, site_id, name, metric, condition, threshold, enabled, created_at, updated_at
		FROM alert_rules
		WHERE enabled = TRUE
	`)
	if err != nil {
		logger.S.Errorw("failed to find enabled alert rules", "error", err)
		return nil, errors.InternalError("failed to find enabled alert rules")
	}
	defer rows.Close()

	var rules []AlertRule
	for rows.Next() {
		var rule AlertRule
		if err := rows.Scan(&rule.ID, &rule.SiteID, &rule.Name, &rule.Metric, &rule.Condition, &rule.Threshold, &rule.Enabled, &rule.CreatedAt, &rule.UpdatedAt); err != nil {
			logger.S.Errorw("failed to scan alert rule", "error", err)
			continue
		}
		rules = append(rules, rule)
	}

	return rules, nil
}
