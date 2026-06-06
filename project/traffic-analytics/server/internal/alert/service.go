package alert

import (
	"context"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"

	"github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
	"github.com/traffic-analytics/server/internal/ws"
)

type AlertService struct {
	repo     *AlertRepository
	chConn   clickhouse.Conn
	hub      *ws.Hub
}

func NewAlertService(repo *AlertRepository, chConn clickhouse.Conn, hub *ws.Hub) *AlertService {
	return &AlertService{
		repo:   repo,
		chConn: chConn,
		hub:    hub,
	}
}

func (s *AlertService) CreateRule(ctx context.Context, req CreateAlertRequest, userID string) (AlertRule, error) {
	if err := validateAlertRequest(req.Name, req.Metric, req.Condition); err != nil {
		return AlertRule{}, err
	}

	enabled := true
	if req.Enabled != nil {
		enabled = *req.Enabled
	}

	rule := AlertRule{
		SiteID:    req.SiteID,
		Name:      req.Name,
		Metric:    req.Metric,
		Condition: req.Condition,
		Threshold: req.Threshold,
		Enabled:   enabled,
	}

	created, err := s.repo.Create(ctx, rule)
	if err != nil {
		return AlertRule{}, err
	}

	return created, nil
}

func (s *AlertService) ListRules(ctx context.Context, siteID string) ([]AlertRule, error) {
	return s.repo.FindBySiteID(ctx, siteID)
}

func (s *AlertService) UpdateRule(ctx context.Context, id string, req UpdateAlertRequest) (AlertRule, error) {
	if err := validateAlertRequest(req.Name, req.Metric, req.Condition); err != nil {
		return AlertRule{}, err
	}

	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return AlertRule{}, err
	}

	enabled := existing.Enabled
	if req.Enabled != nil {
		enabled = *req.Enabled
	}

	existing.Name = req.Name
	existing.Metric = req.Metric
	existing.Condition = req.Condition
	existing.Threshold = req.Threshold
	existing.Enabled = enabled

	return s.repo.Update(ctx, existing)
}

func (s *AlertService) DeleteRule(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *AlertService) CheckAlerts(ctx context.Context) {
	rules, err := s.repo.FindAllEnabled(ctx)
	if err != nil {
		logger.S.Errorw("failed to fetch enabled alert rules", "error", err)
		return
	}

	if len(rules) == 0 {
		return
	}

	for _, rule := range rules {
		value, err := s.queryMetricValue(ctx, rule.SiteID, rule.Metric)
		if err != nil {
			logger.S.Warnw("failed to query metric for alert check", "rule_id", rule.ID, "metric", rule.Metric, "error", err)
			continue
		}

		triggered := evaluateCondition(rule.Condition, value, rule.Threshold)
		if triggered {
			logger.S.Infow("alert triggered",
				"rule_id", rule.ID,
				"rule_name", rule.Name,
				"site_id", rule.SiteID,
				"metric", rule.Metric,
				"value", value,
				"threshold", rule.Threshold,
			)

			payload := map[string]interface{}{
				"rule_id":   rule.ID,
				"rule_name": rule.Name,
				"site_id":   rule.SiteID,
				"metric":    rule.Metric,
				"value":     value,
				"threshold": rule.Threshold,
				"condition": rule.Condition,
				"timestamp": time.Now().Format(time.RFC3339),
			}

			msg := ws.BuildMessage("alert", payload)
			if msg != nil {
				s.hub.BroadcastToSite(rule.SiteID, msg)
			}
		}
	}
}

func (s *AlertService) queryMetricValue(ctx context.Context, siteID, metric string) (float64, error) {
	now := time.Now()
	oneHourAgo := now.Add(-1 * time.Hour)

	var query string
	var value float64

	switch metric {
	case "page_views":
		query = `
			SELECT COUNT(*) as value
			FROM page_views
			WHERE site_id = ? AND timestamp >= ?
		`
	case "unique_visitors":
		query = `
			SELECT uniqExact(session_id) as value
			FROM page_views
			WHERE site_id = ? AND timestamp >= ?
		`
	case "avg_duration":
		query = `
			SELECT avg(duration_ms) as value
			FROM page_views
			WHERE site_id = ? AND timestamp >= ?
		`
	case "bounce_rate":
		query = `
			SELECT
				CAST(SUM(CASE WHEN page_count = 1 THEN 1 ELSE 0 END) AS Float64) / COUNT(*) * 100 as value
			FROM (
				SELECT session_id, COUNT(*) as page_count
				FROM page_views
				WHERE site_id = ? AND timestamp >= ?
				GROUP BY session_id
			)
		`
	default:
		return 0, fmt.Errorf("unknown metric: %s", metric)
	}

	row := s.chConn.QueryRow(ctx, query, siteID, oneHourAgo)
	if err := row.Scan(&value); err != nil {
		return 0, err
	}

	return value, nil
}

func evaluateCondition(condition string, value, threshold float64) bool {
	switch condition {
	case "gt":
		return value > threshold
	case "gte":
		return value >= threshold
	case "lt":
		return value < threshold
	case "lte":
		return value <= threshold
	case "eq":
		return value == threshold
	default:
		return false
	}
}

func validateAlertRequest(name, metric, condition string) *errors.AppError {
	var fieldErrors []errors.FieldError

	if name == "" {
		fieldErrors = append(fieldErrors, errors.FieldError{Field: "name", Message: "name is required"})
	}

	validMetrics := map[string]bool{
		"page_views":       true,
		"unique_visitors":  true,
		"avg_duration":     true,
		"bounce_rate":      true,
	}
	if !validMetrics[metric] {
		fieldErrors = append(fieldErrors, errors.FieldError{Field: "metric", Message: "metric must be one of: page_views, unique_visitors, avg_duration, bounce_rate"})
	}

	validConditions := map[string]bool{
		"gt":  true,
		"gte": true,
		"lt":  true,
		"lte": true,
		"eq":  true,
	}
	if !validConditions[condition] {
		fieldErrors = append(fieldErrors, errors.FieldError{Field: "condition", Message: "condition must be one of: gt, gte, lt, lte, eq"})
	}

	if len(fieldErrors) > 0 {
		return errors.ValidationError(fieldErrors)
	}

	return nil
}
