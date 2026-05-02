package storage

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	db *sql.DB
}

func NewDatabase(dataDir string) (*Database, error) {
	dbPath := filepath.Join(dataDir, "onlinenote.db")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("create data dir: %w", err)
	}

	db, err := sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping database: %w", err)
	}

	d := &Database{db: db}
	if err := d.migrate(); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return d, nil
}

func (d *Database) DB() *sql.DB {
	return d.db
}

func (d *Database) Close() error {
	return d.db.Close()
}

func (d *Database) migrate() error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			email TEXT,
			avatar TEXT,
			color TEXT DEFAULT '',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS documents (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL DEFAULT '',
			path TEXT NOT NULL DEFAULT '',
			version INTEGER DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS document_versions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			document_id TEXT NOT NULL,
			version INTEGER NOT NULL,
			content TEXT NOT NULL,
			user_id TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (document_id) REFERENCES documents(id)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id, version)`,
	}

	for _, m := range migrations {
		if _, err := d.db.Exec(m); err != nil {
			return fmt.Errorf("exec migration: %w", err)
		}
	}

	return nil
}
