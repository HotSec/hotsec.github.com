package traffic

import (
	"context"
	"fmt"

	"github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
	"github.com/traffic-analytics/server/internal/ws"
)

type TrafficService struct {
	repo *TrafficRepository
	hub  *ws.Hub
}

func NewTrafficService(repo *TrafficRepository, hub *ws.Hub) *TrafficService {
	return &TrafficService{
		repo: repo,
		hub:  hub,
	}
}

func (s *TrafficService) Ingest(ctx context.Context, req IngestRequest) error {
	if err := validateIngestRequest(req); err != nil {
		return err
	}

	if err := s.repo.Insert(ctx, req); err != nil {
		logger.S.Errorw("failed to insert traffic event", "error", err)
		return errors.InternalError("failed to ingest event")
	}

	s.publishPageView(req)

	return nil
}

func (s *TrafficService) IngestBatch(ctx context.Context, req IngestBatchRequest) error {
	if len(req.Events) == 0 {
		return errors.ValidationError([]errors.FieldError{
			{Field: "events", Message: "events list cannot be empty"},
		})
	}

	for i, event := range req.Events {
		if err := validateIngestRequest(event); err != nil {
			return errors.ValidationError([]errors.FieldError{
				{Field: "events", Message: fmt.Sprintf("validation failed for event at index %d: %s", i, err.Error())},
			})
		}
	}

	if err := s.repo.InsertBatch(ctx, req.Events); err != nil {
		logger.S.Errorw("failed to batch insert traffic events", "error", err)
		return errors.InternalError("failed to ingest batch events")
	}

	for _, event := range req.Events {
		s.publishPageView(event)
	}

	return nil
}

func validateIngestRequest(req IngestRequest) *errors.AppError {
	var fieldErrors []errors.FieldError

	if req.SiteID == "" {
		fieldErrors = append(fieldErrors, errors.FieldError{Field: "site_id", Message: "site_id is required"})
	}
	if req.SessionID == "" {
		fieldErrors = append(fieldErrors, errors.FieldError{Field: "session_id", Message: "session_id is required"})
	}
	if req.PageURL == "" {
		fieldErrors = append(fieldErrors, errors.FieldError{Field: "page_url", Message: "page_url is required"})
	}

	if len(fieldErrors) > 0 {
		return errors.ValidationError(fieldErrors)
	}

	return nil
}

func (s *TrafficService) publishPageView(event IngestRequest) {
	payload := map[string]interface{}{
		"site_id":     event.SiteID,
		"session_id":  event.SessionID,
		"page_url":    event.PageURL,
		"referrer":    event.Referrer,
		"country":     event.Country,
		"city":        event.City,
		"device_type": event.DeviceType,
		"browser":     event.Browser,
		"os":          event.OS,
		"duration_ms": event.DurationMs,
	}

	msg := ws.BuildMessage("page_view", payload)
	if msg != nil {
		s.hub.BroadcastToSite(event.SiteID, msg)
	}
}

