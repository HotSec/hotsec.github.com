package sites

import (
	"context"

	"github.com/traffic-analytics/server/internal/shared/errors"
)

type SitesService struct {
	repo *SitesRepository
}

func NewSitesService(repo *SitesRepository) *SitesService {
	return &SitesService{repo: repo}
}

func (s *SitesService) CreateSite(ctx context.Context, req CreateSiteRequest, userID string) (SiteResponse, error) {
	site, err := s.repo.Create(ctx, userID, req.Domain, req.Name)
	if err != nil {
		return SiteResponse{}, err
	}

	return toSiteResponse(site), nil
}

func (s *SitesService) ListSites(ctx context.Context, userID string) ([]SiteResponse, error) {
	sites, err := s.repo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	responses := make([]SiteResponse, len(sites))
	for i, site := range sites {
		responses[i] = toSiteResponse(site)
	}

	return responses, nil
}

func (s *SitesService) GetSite(ctx context.Context, id string) (SiteResponse, error) {
	site, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return SiteResponse{}, err
	}

	return toSiteResponse(site), nil
}

func (s *SitesService) DeleteSite(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func toSiteResponse(site Site) SiteResponse {
	return SiteResponse{
		ID:         site.ID,
		Domain:     site.Domain,
		Name:       site.Name,
		TrackingID: site.TrackingID,
		CreatedAt:  site.CreatedAt,
	}
}

func (s *SitesService) VerifySiteOwnership(ctx context.Context, siteID, userID string) error {
	site, err := s.repo.FindByID(ctx, siteID)
	if err != nil {
		return err
	}

	if site.UserID != userID {
		return errors.ForbiddenError("you do not have access to this site")
	}

	return nil
}
