package crdt

import (
	"encoding/json"
	"sync"
)

type Node struct {
	ID        string `json:"id"`
	SiteID    string `json:"siteId"`
	Clock     int64  `json:"clock"`
	Content   string `json:"content"`
	Deleted   bool   `json:"deleted"`
	Timestamp int64  `json:"timestamp"`
	LeftID    string `json:"leftId"`
	RightID   string `json:"rightId"`
}

type Operation struct {
	Type      string `json:"type"`
	NodeID    string `json:"nodeId"`
	SiteID    string `json:"siteId"`
	Clock     int64  `json:"clock"`
	Content   string `json:"content"`
	Timestamp int64  `json:"timestamp"`
	LeftID    string `json:"leftId"`
	RightID   string `json:"rightId"`
}

type Document struct {
	mu     sync.RWMutex
	nodes  map[string]*Node
	opLog  []Operation
	vector map[string]int64
	clock  int64
}

func NewDocument() *Document {
	return &Document{
		nodes:  make(map[string]*Node),
		opLog:  make([]Operation, 0),
		vector: make(map[string]int64),
		clock:  0,
	}
}

func (d *Document) ApplyOperation(op Operation) {
	d.mu.Lock()
	defer d.mu.Unlock()

	if op.Type == "insert" {
		if _, exists := d.nodes[op.NodeID]; exists {
			return
		}
		node := &Node{
			ID:        op.NodeID,
			SiteID:    op.SiteID,
			Clock:     op.Clock,
			Content:   op.Content,
			Deleted:   false,
			Timestamp: op.Timestamp,
			LeftID:    op.LeftID,
			RightID:   op.RightID,
		}
		d.nodes[op.NodeID] = node
	} else if op.Type == "delete" {
		node, exists := d.nodes[op.NodeID]
		if !exists || node.Deleted {
			return
		}
		if op.Timestamp >= node.Timestamp {
			node.Deleted = true
			node.Timestamp = op.Timestamp
		}
	}

	if d.vector[op.SiteID] < op.Clock {
		d.vector[op.SiteID] = op.Clock
	}
	if op.Clock >= d.clock {
		d.clock = op.Clock + 1
	}

	d.opLog = append(d.opLog, op)
}

func (d *Document) GetOperationsSince(vector map[string]int64) []Operation {
	d.mu.RLock()
	defer d.mu.RUnlock()

	var result []Operation
	for _, op := range d.opLog {
		if v, ok := vector[op.SiteID]; !ok || op.Clock > v {
			result = append(result, op)
		}
	}
	return result
}

func (d *Document) GetState() json.RawMessage {
	d.mu.RLock()
	defer d.mu.RUnlock()

	nodes := make([]*Node, 0, len(d.nodes))
	for _, node := range d.nodes {
		nodes = append(nodes, node)
	}

	state := struct {
		Nodes  []*Node          `json:"nodes"`
		Vector map[string]int64 `json:"vector"`
		Clock  int64            `json:"clock"`
	}{
		Nodes:  nodes,
		Vector: d.vector,
		Clock:  d.clock,
	}

	data, _ := json.Marshal(state)
	return data
}

func (d *Document) GetVector() map[string]int64 {
	d.mu.RLock()
	defer d.mu.RUnlock()

	result := make(map[string]int64)
	for k, v := range d.vector {
		result[k] = v
	}
	return result
}

func (d *Document) ResetFromContent(content string) {
	d.mu.Lock()
	defer d.mu.Unlock()

	d.nodes = make(map[string]*Node)
	d.opLog = make([]Operation, 0)
	d.clock = 0
}

type DocumentStore struct {
	mu        sync.RWMutex
	documents map[string]*Document
}

func NewDocumentStore() *DocumentStore {
	return &DocumentStore{
		documents: make(map[string]*Document),
	}
}

func (s *DocumentStore) Get(docID string) *Document {
	s.mu.Lock()
	defer s.mu.Unlock()

	if doc, exists := s.documents[docID]; exists {
		return doc
	}

	doc := NewDocument()
	s.documents[docID] = doc
	return doc
}

func (s *DocumentStore) GetExisting(docID string) *Document {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.documents[docID]
}
