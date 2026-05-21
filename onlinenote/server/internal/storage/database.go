package storage

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
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

type DocumentVersion struct {
	ID         int64  `json:"id"`
	DocumentID string `json:"documentId"`
	Version    int    `json:"version"`
	Content    string `json:"content"`
	UserID     string `json:"userId,omitempty"`
	CreatedAt  string `json:"createdAt"`
}

type Document struct {
	ID            string `json:"id"`
	Title         string `json:"title"`
	Path          string `json:"path"`
	Version       int    `json:"version"`
	Public        bool   `json:"public"`
	DefaultAccess string `json:"defaultAccess"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
}

type DocumentPermission struct {
	DocumentID string `json:"documentId"`
	UserID     string `json:"userId"`
	Access     string `json:"access"` // read, write, admin
	CreatedAt  string `json:"createdAt"`
}

const (
	AccessRead  = "read"
	AccessWrite = "write"
	AccessAdmin = "admin"
)

const MaxVersionsToKeep = 50

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
			public BOOLEAN DEFAULT TRUE,
			default_access TEXT DEFAULT 'write',
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
		`CREATE INDEX IF NOT EXISTS idx_document_versions_created ON document_versions(document_id, created_at DESC)`,
		`CREATE TABLE IF NOT EXISTS document_permissions (
			document_id TEXT NOT NULL,
			user_id TEXT NOT NULL,
			access TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (document_id, user_id),
			FOREIGN KEY (document_id) REFERENCES documents(id)
		)`,
		`CREATE TABLE IF NOT EXISTS crdt_state (
			document_id TEXT PRIMARY KEY,
			state TEXT NOT NULL,
			vector TEXT NOT NULL,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (document_id) REFERENCES documents(id)
		)`,
	}

	for _, m := range migrations {
		if _, err := d.db.Exec(m); err != nil {
			return fmt.Errorf("exec migration: %w", err)
		}
	}

	alterMigrations := []struct {
		sql string
		col string
		tbl string
	}{
		{`ALTER TABLE documents ADD COLUMN public BOOLEAN DEFAULT TRUE`, "public", "documents"},
		{`ALTER TABLE documents ADD COLUMN default_access TEXT DEFAULT 'write'`, "default_access", "documents"},
	}

	for _, am := range alterMigrations {
		var colName string
		err := d.db.QueryRow(`SELECT name FROM pragma_table_info(?) WHERE name = ?`, am.tbl, am.col).Scan(&colName)
		if err != nil {
			if _, err := d.db.Exec(am.sql); err != nil {
				return fmt.Errorf("alter table add column %s: %w", am.col, err)
			}
		}
	}

	return nil
}

func (d *Database) GetDocumentVersions(docID string) ([]DocumentVersion, error) {
	rows, err := d.db.Query(`
		SELECT id, document_id, version, content, user_id, created_at
		FROM document_versions
		WHERE document_id = ?
		ORDER BY version DESC
	`, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var versions []DocumentVersion
	for rows.Next() {
		var v DocumentVersion
		err := rows.Scan(&v.ID, &v.DocumentID, &v.Version, &v.Content, &v.UserID, &v.CreatedAt)
		if err != nil {
			return nil, err
		}
		versions = append(versions, v)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return versions, nil
}

func (d *Database) GetDocumentVersion(docID string, version int) (*DocumentVersion, error) {
	var v DocumentVersion
	err := d.db.QueryRow(`
		SELECT id, document_id, version, content, user_id, created_at
		FROM document_versions
		WHERE document_id = ? AND version = ?
	`, docID, version).Scan(&v.ID, &v.DocumentID, &v.Version, &v.Content, &v.UserID, &v.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &v, nil
}

func (d *Database) SaveDocumentVersion(docID, content, userID string) error {
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var currentVersion int
	err = tx.QueryRow(`
		SELECT COALESCE(version, 0) FROM documents WHERE id = ?
	`, docID).Scan(&currentVersion)

	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if err == sql.ErrNoRows {
		_, err = tx.Exec(`
			INSERT INTO documents (id, title, path, version)
			VALUES (?, '', '', 0)
		`, docID)
		if err != nil {
			return err
		}
		currentVersion = 0
	}

	newVersion := currentVersion + 1
	_, err = tx.Exec(`
		INSERT INTO document_versions (document_id, version, content, user_id)
		VALUES (?, ?, ?, ?)
	`, docID, newVersion, content, userID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		UPDATE documents
		SET version = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, newVersion, docID)
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	go func() {
		if err := d.CleanupOldVersions(docID); err != nil {
			slog.Warn("cleanup old versions failed", "docId", docID, "error", err)
		}
	}()
	return nil
}

func (d *Database) CleanupOldVersions(docID string) error {
	rows, err := d.db.Query(`
		SELECT id FROM document_versions
		WHERE document_id = ?
		ORDER BY version DESC
		LIMIT ?
	`, docID, MaxVersionsToKeep)
	if err != nil {
		return err
	}
	defer rows.Close()

	var keepIDs []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return err
		}
		keepIDs = append(keepIDs, id)
	}
	if err := rows.Err(); err != nil {
		return err
	}

	if len(keepIDs) == 0 {
		return nil
	}

	placeholders := make([]byte, 0, len(keepIDs)*2)
	args := make([]interface{}, 0, len(keepIDs)+1)
	args = append(args, docID)
	for i, id := range keepIDs {
		if i > 0 {
			placeholders = append(placeholders, ',')
		}
		placeholders = append(placeholders, '?')
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		DELETE FROM document_versions
		WHERE document_id = ? AND id NOT IN (%s)
	`, string(placeholders))

	_, err = d.db.Exec(query, args...)
	return err
}

func (d *Database) RollbackToVersion(docID string, version int, userID string) (*DocumentVersion, error) {
	v, err := d.GetDocumentVersion(docID, version)
	if err != nil {
		return nil, err
	}

	err = d.SaveDocumentVersion(docID, v.Content, userID)
	if err != nil {
		return nil, err
	}

	newVersions, err := d.GetDocumentVersions(docID)
	if err != nil {
		return nil, err
	}
	if len(newVersions) == 0 {
		return nil, fmt.Errorf("failed to get new version")
	}
	return &newVersions[0], nil
}

func (d *Database) CheckAccess(docID, userID, requiredAccess string) (bool, error) {
	var public bool
	var defaultAccess string
	err := d.db.QueryRow(`
		SELECT public, COALESCE(default_access, 'write')
		FROM documents WHERE id = ?
	`, docID).Scan(&public, &defaultAccess)

	if err == sql.ErrNoRows {
		return true, nil
	}
	if err != nil {
		return false, err
	}

	if userID == "" {
		if public && accessLevel(defaultAccess) >= accessLevel(requiredAccess) {
			return true, nil
		}
		return false, nil
	}

	var access string
	err = d.db.QueryRow(`
		SELECT access FROM document_permissions
		WHERE document_id = ? AND user_id = ?
	`, docID, userID).Scan(&access)

	if err == nil {
		return accessLevel(access) >= accessLevel(requiredAccess), nil
	}

	if err != sql.ErrNoRows {
		return false, err
	}

	if public && accessLevel(defaultAccess) >= accessLevel(requiredAccess) {
		return true, nil
	}

	return false, nil
}

func accessLevel(access string) int {
	switch access {
	case AccessRead:
		return 1
	case AccessWrite:
		return 2
	case AccessAdmin:
		return 3
	default:
		return 0
	}
}

func (d *Database) SetPermission(docID, userID, access string) error {
	_, err := d.db.Exec(`
		INSERT INTO document_permissions (document_id, user_id, access)
		VALUES (?, ?, ?)
		ON CONFLICT (document_id, user_id)
		DO UPDATE SET access = excluded.access
	`, docID, userID, access)
	return err
}

func (d *Database) GetDocumentPermissions(docID string) ([]DocumentPermission, error) {
	rows, err := d.db.Query(`
		SELECT document_id, user_id, access, created_at
		FROM document_permissions
		WHERE document_id = ?
	`, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []DocumentPermission
	for rows.Next() {
		var p DocumentPermission
		err := rows.Scan(&p.DocumentID, &p.UserID, &p.Access, &p.CreatedAt)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return permissions, nil
}

func (d *Database) SaveCRDTState(docID string, state json.RawMessage, vector map[string]int64) error {
	vectorData, _ := json.Marshal(vector)
	_, err := d.db.Exec(`
		INSERT INTO crdt_state (document_id, state, vector, updated_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT (document_id)
		DO UPDATE SET state = excluded.state, vector = excluded.vector, updated_at = CURRENT_TIMESTAMP
	`, docID, string(state), string(vectorData))
	return err
}

func (d *Database) LoadCRDTState(docID string) (json.RawMessage, map[string]int64, error) {
	var stateData string
	var vectorData string
	err := d.db.QueryRow(`
		SELECT state, vector FROM crdt_state WHERE document_id = ?
	`, docID).Scan(&stateData, &vectorData)
	if err != nil {
		return nil, nil, err
	}

	var vector map[string]int64
	if err := json.Unmarshal([]byte(vectorData), &vector); err != nil {
		return nil, nil, fmt.Errorf("unmarshal crdt vector: %w", err)
	}
	return json.RawMessage(stateData), vector, nil
}

func (d *Database) DeletePermission(docID, userID string) error {
	_, err := d.db.Exec(`
		DELETE FROM document_permissions
		WHERE document_id = ? AND user_id = ?
	`, docID, userID)
	return err
}
