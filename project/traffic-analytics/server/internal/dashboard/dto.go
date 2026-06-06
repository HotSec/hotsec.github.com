package dashboard

import "time"

type RealtimeMetrics struct {
	TotalViews          int64   `json:"total_views"`
	UniqueVisitors      int64   `json:"unique_visitors"`
	AvgDuration         float64 `json:"avg_duration"`
	BounceRate          float64 `json:"bounce_rate"`
	ViewsChangePercent  float64 `json:"views_change_percent"`
	VisitorsChangePercent float64 `json:"visitors_change_percent"`
}

type TimeSeriesPoint struct {
	Timestamp time.Time `json:"timestamp"`
	Value     float64   `json:"value"`
}

type TopPage struct {
	URL            string  `json:"url"`
	Views          int64   `json:"views"`
	UniqueVisitors int64   `json:"unique_visitors"`
	AvgDuration    float64 `json:"avg_duration"`
}

type TrafficSource struct {
	Source     string  `json:"source"`
	Views      int64   `json:"views"`
	Percentage float64 `json:"percentage"`
}

type GeoData struct {
	Country    string  `json:"country"`
	Views      int64   `json:"views"`
	Percentage float64 `json:"percentage"`
}

type DeviceStats struct {
	DeviceType string `json:"device_type"`
	Browser    string `json:"browser"`
	OS         string `json:"os"`
	Views      int64  `json:"views"`
}
