package alert

import "time"

type AlertRule struct {
	ID        string    `json:"id"`
	SiteID    string    `json:"site_id"`
	Name      string    `json:"name"`
	Metric    string    `json:"metric"`
	Condition string    `json:"condition"`
	Threshold float64   `json:"threshold"`
	Enabled   bool      `json:"enabled"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateAlertRequest struct {
	SiteID    string  `json:"site_id" binding:"required"`
	Name      string  `json:"name" binding:"required"`
	Metric    string  `json:"metric" binding:"required"`
	Condition string  `json:"condition" binding:"required"`
	Threshold float64 `json:"threshold" binding:"required"`
	Enabled   *bool   `json:"enabled"`
}

type UpdateAlertRequest struct {
	Name      string  `json:"name" binding:"required"`
	Metric    string  `json:"metric" binding:"required"`
	Condition string  `json:"condition" binding:"required"`
	Threshold float64 `json:"threshold" binding:"required"`
	Enabled   *bool   `json:"enabled"`
}
