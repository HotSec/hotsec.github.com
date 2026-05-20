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
	opCount int64
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

func (d *Document) GetClockForSite(siteID string) int64 {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.vector[siteID]
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

func (d *Document) LoadState(state json.RawMessage) {
	d.mu.Lock()
	defer d.mu.Unlock()

	var data struct {
		Nodes  []*Node          `json:"nodes"`
		Vector map[string]int64 `json:"vector"`
		Clock  int64            `json:"clock"`
	}
	if err := json.Unmarshal(state, &data); err != nil {
		return
	}

	d.nodes = make(map[string]*Node)
	for _, node := range data.Nodes {
		d.nodes[node.ID] = node
	}
	d.vector = data.Vector
	if d.vector == nil {
		d.vector = make(map[string]int64)
	}
	d.clock = data.Clock
	d.opLog = make([]Operation, 0)
}

func (d *Document) ResetFromContent(content string) {
	d.mu.Lock()
	defer d.mu.Unlock()

	d.nodes = make(map[string]*Node)
	d.opLog = make([]Operation, 0)
	d.vector = make(map[string]int64)
	d.clock = 0
}

// CollectGarbage removes deleted nodes whose left and right neighbors
// are also deleted, since they no longer serve any structural purpose.
// Returns the number of nodes removed.
func (d *Document) CollectGarbage() int {
	d.mu.Lock()
	defer d.mu.Unlock()

	if len(d.nodes) < 10 {
		return 0
	}

	// First pass: identify nodes with deleted neighbors
	toDelete := make([]string, 0)
	for id, node := range d.nodes {
		if !node.Deleted {
			continue
		}
		leftDeleted := node.LeftID == "" || d.isNodeDeleted(node.LeftID)
		rightDeleted := node.RightID == "" || d.isNodeDeleted(node.RightID)
		if leftDeleted && rightDeleted {
			toDelete = append(toDelete, id)
		}
	}

	// Second pass: update linked list references and remove
	for _, id := range toDelete {
		node := d.nodes[id]
		if left, ok := d.nodes[node.LeftID]; ok {
			left.RightID = node.RightID
		}
		if right, ok := d.nodes[node.RightID]; ok {
			right.LeftID = node.LeftID
		}
		delete(d.nodes, id)
	}

	return len(toDelete)
}

// isNodeDeleted checks whether a node ID corresponds to a deleted node.
func (d *Document) isNodeDeleted(id string) bool {
	node, exists := d.nodes[id]
	if !exists {
		return true // absent nodes are treated as deleted
	}
	return node.Deleted
}

// TickGarbageCollect increments the internal operation counter and runs
// garbage collection when the threshold is reached.
func (d *Document) TickGarbageCollect(threshold int64) {
	d.opCount++
	if d.opCount%threshold == 0 {
		d.CollectGarbage()
	}
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

func (s *DocumentStore) LoadFromDB(docID string, db interface {
	LoadCRDTState(docID string) (json.RawMessage, map[string]int64, error)
}) *Document {
	s.mu.Lock()
	defer s.mu.Unlock()

	if doc, exists := s.documents[docID]; exists {
		return doc
	}

	doc := NewDocument()
	state, _, err := db.LoadCRDTState(docID)
	if err == nil && len(state) > 0 {
		doc.LoadState(state)
	}
	s.documents[docID] = doc
	return doc
}

func (s *DocumentStore) GetExisting(docID string) *Document {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.documents[docID]
}
