package analytics

type AnalyticsOverview struct {
	TotalViews     int64   `json:"total_views"`
	UniqueVisitors int64   `json:"unique_visitors"`
	AvgDuration    float64 `json:"avg_duration"`
	BounceRate     float64 `json:"bounce_rate"`
	TotalSessions  int64   `json:"total_sessions"`
	AvgPagesPerSession float64 `json:"avg_pages_per_session"`
}

type ComparisonData struct {
	Current  RealtimeMetrics   `json:"current"`
	Previous RealtimeMetrics   `json:"previous"`
	Changes  map[string]float64 `json:"changes"`
}

type RealtimeMetrics struct {
	TotalViews     int64   `json:"total_views"`
	UniqueVisitors int64   `json:"unique_visitors"`
	AvgDuration    float64 `json:"avg_duration"`
	BounceRate     float64 `json:"bounce_rate"`
	TotalSessions  int64   `json:"total_sessions"`
}

type DailyStats struct {
	Date           string  `json:"date"`
	Views          int64   `json:"views"`
	UniqueVisitors int64   `json:"unique_visitors"`
	AvgDuration    float64 `json:"avg_duration"`
	BounceRate     float64 `json:"bounce_rate"`
}
