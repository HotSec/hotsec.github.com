package main

import (
	"crypto/tls"
	"net/http/httptest"
	"testing"

	"onlinenote/config"
	"onlinenote/internal/user"

	"github.com/gin-gonic/gin"
)

// TestGetUserIdFromRequest verifies BUG-1 fix: authentication bypass via query param.
// The fix ensures that only the Authorization header (Bearer token) can authenticate,
// and a userId query parameter cannot bypass token validation.
func TestGetUserIdFromRequest(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret-for-unit-tests"}
	srv := &Server{Config: cfg}

	// generate a valid token for test user "u-abc"
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
			name:       "invalid token AND userId query param -> still empty (no bypass)",
			authHeader: "Bearer invalid.token.here",
			queryUser:  "hacker",
			wantUserID: "",
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

			got := srv.getUserIdFromRequest(c)
			if got != tt.wantUserID {
				t.Errorf("getUserIdFromRequest() = %q, want %q", got, tt.wantUserID)
			}
		})
	}
}

// TestCheckOrigin verifies BUG-2 fix: WebSocket Origin validation to prevent CSRF.
// The CheckOrigin function must properly validate the Origin header against the Host,
// and additionally reject plain-http origins when the connection is over TLS (wss).
func TestCheckOrigin(t *testing.T) {
	tests := []struct {
		name   string
		host   string
		origin string
		tls    bool // whether the request is over TLS (wss)
		want   bool
	}{
		{
			name:   "no Origin header -> allow",
			host:   "example.com",
			origin: "",
			tls:    false,
			want:   true,
		},
		{
			name:   "Origin matches Host (http) -> allow",
			host:   "example.com",
			origin: "http://example.com",
			tls:    false,
			want:   true,
		},
		{
			name:   "Origin does NOT match Host -> deny",
			host:   "example.com",
			origin: "http://evil.com",
			tls:    false,
			want:   false,
		},
		{
			name:   "Origin matches https://Host -> allow",
			host:   "example.com",
			origin: "https://example.com",
			tls:    false,
			want:   true,
		},
		{
			name:   "http Origin on wss (TLS) connection -> deny",
			host:   "example.com",
			origin: "http://example.com",
			tls:    true,
			want:   false,
		},
		{
			name:   "https Origin on wss (TLS) connection -> allow",
			host:   "example.com",
			origin: "https://example.com",
			tls:    true,
			want:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := httptest.NewRequest("GET", "/ws", nil)
			r.Host = tt.host
			if tt.origin != "" {
				r.Header.Set("Origin", tt.origin)
			}
			if tt.tls {
				r.TLS = &tls.ConnectionState{}
			}

			got := upgrader.CheckOrigin(r)
			if got != tt.want {
				t.Errorf("CheckOrigin() = %v, want %v", got, tt.want)
			}
		})
	}
}
