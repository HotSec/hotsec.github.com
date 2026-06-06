package traffic

type IngestRequest struct {
	SiteID      string `json:"site_id"`
	SessionID   string `json:"session_id"`
	PageURL     string `json:"page_url"`
	Referrer    string `json:"referrer"`
	UTMSource   string `json:"utm_source"`
	UTMMedium   string `json:"utm_medium"`
	UTMCampaign string `json:"utm_campaign"`
	Country     string `json:"country"`
	City        string `json:"city"`
	DeviceType  string `json:"device_type"`
	Browser     string `json:"browser"`
	OS          string `json:"os"`
	DurationMs  uint32 `json:"duration_ms"`
}

type IngestBatchRequest struct {
	Events []IngestRequest `json:"events" binding:"required"`
}
