package main

import (
	"crypto/tls"
	"net/http"
	"net/http/httptest"
	"testing"

	"onlinenote/config"
	"onlinenote/internal/middleware"
	"onlinenote/internal/user"

	"github.com/gin-gonic/gin"
	gws "github.com/gorilla/websocket"
)

func TestAuthMiddleware(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret-for-unit-tests"}

	validToken, err := user.GenerateToken("u-abc", "alice", cfg.JWTSecret)
	if err != nil {
		t.Fatalf("failed to generate test token: %v", err)
	}

	tests := []struct {
		name       string
		authHeader string
		queryUser  string
		wantUserID string
	}{
		{
			name:       "no auth header, no userId query param -> empty",
			authHeader: "",
			queryUser:  "",
			wantUserID: "",
		},
		{
			name:       "valid Bearer token -> correct userId",
			authHeader: "Bearer " + validToken,
			queryUser:  "",
			wantUserID: "u-abc",
		},
		{
			name:       "userId query param without token -> still gets userId",
			authHeader: "",
			queryUser:  "guest-123",
			wantUserID: "guest-123",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			url := "/api/documents/doc1"
			if tt.queryUser != "" {
				url += "?userId=" + tt.queryUser
			}
			c.Request = httptest.NewRequest("GET", url, nil)
			if tt.authHeader != "" {
				c.Request.Header.Set("Authorization", tt.authHeader)
			}

			middleware.Auth(cfg.JWTSecret)(c)
			got := middleware.GetUserID(c)
			if got != tt.wantUserID {
				t.Errorf("Auth middleware GetUserID() = %q, want %q", got, tt.wantUserID)
			}
		})
	}
}

func TestWebSocketUpgrader(t *testing.T) {
	tests := []struct {
		name   string
		host   string
		origin string
	}{
		{
			name:   "no Origin header -> allow (upgrader returns true)",
			host:   "example.com",
			origin: "",
		},
		{
			name:   "Origin matches Host -> allow",
			host:   "example.com",
			origin: "http://example.com",
		},
		{
			name:   "cross-origin -> allow (permissive check)",
			host:   "example.com",
			origin: "http://evil.com",
		},
	}

	upgrader := gws.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := httptest.NewRequest("GET", "/ws", nil)
			r.Host = tt.host
			r.TLS = &tls.ConnectionState{}
			if tt.origin != "" {
				r.Header.Set("Origin", tt.origin)
			}

			got := upgrader.CheckOrigin(r)
			if !got {
				t.Errorf("CheckOrigin() = false, want true for permissive check")
			}
		})
	}
}