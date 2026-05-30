package sites

import "time"

type Site struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	Domain     string    `json:"domain"`
	Name       string    `json:"name"`
	TrackingID string    `json:"tracking_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CreateSiteRequest struct {
	Domain string `json:"domain" binding:"required"`
	Name   string `json:"name" binding:"required"`
}

type SiteResponse struct {
	ID         string    `json:"id"`
	Domain     string    `json:"domain"`
	Name       string    `json:"name"`
	TrackingID string    `json:"tracking_id"`
	CreatedAt  time.Time `json:"created_at"`
}
