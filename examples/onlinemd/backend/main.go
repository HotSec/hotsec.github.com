package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
)

func main() {
	rdb := redis.NewClient(&redis.Options{
		Addr: getEnv("REDIS_URL", "localhost:6379"),
	})
	store := NewPGStore(getEnv("DATABASE_URL", "postgres://postgres:secret@localhost/docs?sslmode=disable"))
	hub := NewHub(rdb, store)
	go hub.Run()

	http.HandleFunc("/ws", authMiddleware(func(w http.ResponseWriter, r *http.Request) {
		docID := r.URL.Query().Get("doc")
		if docID == "" {
			http.Error(w, "missing doc", http.StatusBadRequest)
			return
		}
		user := r.Context().Value("user").(string)
		ServeWS(hub, w, r, docID, user)
	}))

	log.Println("listening :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	secret := []byte(getEnv("JWT_SECRET", "dev-secret"))
	return func(w http.ResponseWriter, r *http.Request) {
		tokenStr := r.URL.Query().Get("token")
		if tokenStr == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		t, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) { return secret, nil })
		if err != nil || !t.Valid {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		claims, ok := t.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		sub, ok := claims["sub"].(string)
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), "user", sub)
		next(w, r.WithContext(ctx))
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
