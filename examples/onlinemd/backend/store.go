package main

import (
	"context"
	"database/sql"

	_ "github.com/lib/pq"
)

type PGStore struct {
	db *sql.DB
}

func NewPGStore(dsn string) *PGStore {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		panic(err)
	}
	db.Exec(`CREATE TABLE IF NOT EXISTS documents (
		id TEXT PRIMARY KEY,
		state BYTEA,
		updated_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	return &PGStore{db: db}
}

func (s *PGStore) Save(ctx context.Context, docID string, state []byte) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO documents (id, state, updated_at) VALUES ($1,$2,NOW())
		 ON CONFLICT (id) DO UPDATE SET state=$2, updated_at=NOW()`,
		docID, state)
	return err
}

func (s *PGStore) Load(ctx context.Context, docID string) ([]byte, error) {
	var state []byte
	err := s.db.QueryRowContext(ctx,
		`SELECT state FROM documents WHERE id=$1`, docID).Scan(&state)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return state, err
}
