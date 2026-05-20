package document

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type Document struct {
	ID          string
	Title       string
	Content     string
	Path        string
	Version     int
	CRDTEnabled bool
}

type Manager struct {
	docs    map[string]*Document
	dataDir string
	mu      sync.RWMutex
}

func NewManager(dataDir string, staticDir string) *Manager {
	docDir := filepath.Join(dataDir, "documents")
	os.MkdirAll(docDir, 0755)

	m := &Manager{
		docs:    make(map[string]*Document),
		dataDir: dataDir,
	}

	m.seedFromStatic(staticDir)

	return m
}

func (m *Manager) seedFromStatic(staticDir string) {
	allMdPath := filepath.Join(staticDir, "ALL.md")
	content, err := os.ReadFile(allMdPath)
	if err != nil {
		return
	}

	doc, err := m.Load("all-md")
	if err != nil {
		return
	}

	if doc.Content == "" {
		if err := m.Save("all-md", string(content)); err != nil {
			slog.Warn("failed to seed all-md document", "error", err)
		}
	}
}

func (m *Manager) Load(docID string) (*Document, error) {
	m.mu.RLock()
	if doc, exists := m.docs[docID]; exists {
		m.mu.RUnlock()
		return doc, nil
	}
	m.mu.RUnlock()

	m.mu.Lock()
	defer m.mu.Unlock()

	path := filepath.Join(m.dataDir, "documents", docID+".md")
	content, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return &Document{
				ID:          docID,
				Content:     "",
				Path:        path,
				Version:     0,
				CRDTEnabled: true,
			}, nil
		}
		return nil, fmt.Errorf("read file %s: %w", path, err)
	}

	doc := &Document{
		ID:      docID,
		Content: string(content),
		Path:    path,
		Version: 1,
	}
	m.docs[docID] = doc
	return doc, nil
}

func (m *Manager) Save(docID string, content string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	doc, exists := m.docs[docID]
	if !exists {
		path := filepath.Join(m.dataDir, "documents", docID+".md")
		doc = &Document{
			ID:      docID,
			Content: content,
			Path:    path,
			Version: 1,
		}
		m.docs[docID] = doc
	}

	if err := os.MkdirAll(filepath.Dir(doc.Path), 0755); err != nil {
		return fmt.Errorf("create dir: %w", err)
	}

	if err := os.WriteFile(doc.Path, []byte(content), 0644); err != nil {
		return fmt.Errorf("write file: %w", err)
	}

	doc.Content = content
	doc.Version++
	return nil
}

func (m *Manager) SaveVersion(docID string, content string, userID string) error {
	backupDir := filepath.Join(m.dataDir, "backups", docID)
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return fmt.Errorf("create backup dir: %w", err)
	}

	timestamp := time.Now().Format("20060102-150405")
	backupPath := filepath.Join(backupDir, fmt.Sprintf("v%d-%s.md", getLatestVersion(backupDir)+1, timestamp))
	if err := os.WriteFile(backupPath, []byte(content), 0644); err != nil {
		return fmt.Errorf("write backup: %w", err)
	}

	return m.Save(docID, content)
}

func getLatestVersion(backupDir string) int {
	entries, err := os.ReadDir(backupDir)
	if err != nil {
		return 0
	}
	maxV := 0
	for _, e := range entries {
		var v int
		fmt.Sscanf(e.Name(), "v%d-", &v)
		if v > maxV {
			maxV = v
		}
	}
	return maxV
}

func (m *Manager) ListVersions(docID string) ([]string, error) {
	backupDir := filepath.Join(m.dataDir, "backups", docID)
	entries, err := os.ReadDir(backupDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var versions []string
	for _, e := range entries {
		if !e.IsDir() {
			versions = append(versions, e.Name())
		}
	}
	return versions, nil
}

func (m *Manager) GetContent(docID string) (string, error) {
	doc, err := m.Load(docID)
	if err != nil {
		return "", err
	}
	return doc.Content, nil
}
