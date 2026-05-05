package crdt

import (
	"testing"
)

func TestDocumentApplyInsertOperation(t *testing.T) {
	doc := NewDocument()

	op := Operation{
		Type:      "insert",
		NodeID:    "site1:1",
		SiteID:    "site1",
		Clock:     1,
		Content:   "H",
		Timestamp: 1000,
		LeftID:    "BOF",
		RightID:   "EOF",
	}

	doc.ApplyOperation(op)

	if len(doc.nodes) != 1 {
		t.Errorf("Expected 1 node, got %d", len(doc.nodes))
	}

	node, exists := doc.nodes["site1:1"]
	if !exists {
		t.Fatal("Node site1:1 should exist")
	}
	if node.Content != "H" {
		t.Errorf("Expected content 'H', got '%s'", node.Content)
	}
	if node.Deleted {
		t.Error("Node should not be deleted")
	}
}

func TestDocumentApplyDeleteOperation(t *testing.T) {
	doc := NewDocument()

	insertOp := Operation{
		Type:      "insert",
		NodeID:    "site1:1",
		SiteID:    "site1",
		Clock:     1,
		Content:   "H",
		Timestamp: 1000,
		LeftID:    "BOF",
		RightID:   "EOF",
	}
	doc.ApplyOperation(insertOp)

	deleteOp := Operation{
		Type:      "delete",
		NodeID:    "site1:1",
		SiteID:    "site1",
		Clock:     2,
		Timestamp: 2000,
	}
	doc.ApplyOperation(deleteOp)

	node := doc.nodes["site1:1"]
	if !node.Deleted {
		t.Error("Node should be deleted after delete operation")
	}
}

func TestDocumentGetOperationsSince(t *testing.T) {
	doc := NewDocument()

	op1 := Operation{
		Type:    "insert",
		NodeID:  "site1:1",
		SiteID:  "site1",
		Clock:   1,
		Content: "A",
		LeftID:  "BOF",
		RightID: "EOF",
	}
	op2 := Operation{
		Type:    "insert",
		NodeID:  "site2:1",
		SiteID:  "site2",
		Clock:   1,
		Content: "B",
		LeftID:  "site1:1",
		RightID: "EOF",
	}
	op3 := Operation{
		Type:    "insert",
		NodeID:  "site1:2",
		SiteID:  "site1",
		Clock:   2,
		Content: "C",
		LeftID:  "site2:1",
		RightID: "EOF",
	}

	doc.ApplyOperation(op1)
	doc.ApplyOperation(op2)
	doc.ApplyOperation(op3)

	vector := map[string]int64{"site1": 1}
	ops := doc.GetOperationsSince(vector)

	if len(ops) != 2 {
		t.Errorf("Expected 2 operations since vector, got %d", len(ops))
	}
}

func TestDocumentStore(t *testing.T) {
	store := NewDocumentStore()

	doc := store.Get("doc1")
	if doc == nil {
		t.Fatal("Document should not be nil")
	}

	doc2 := store.Get("doc1")
	if doc != doc2 {
		t.Error("Same document should be returned for same ID")
	}

	doc3 := store.Get("doc2")
	if doc == doc3 {
		t.Error("Different documents should be returned for different IDs")
	}
}

func TestDocumentVectorClock(t *testing.T) {
	doc := NewDocument()

	op1 := Operation{
		Type:    "insert",
		NodeID:  "site1:1",
		SiteID:  "site1",
		Clock:   1,
		Content: "A",
		LeftID:  "BOF",
		RightID: "EOF",
	}
	doc.ApplyOperation(op1)

	vector := doc.GetVector()
	if vector["site1"] != 1 {
		t.Errorf("Expected site1 clock 1, got %d", vector["site1"])
	}

	op2 := Operation{
		Type:    "insert",
		NodeID:  "site2:3",
		SiteID:  "site2",
		Clock:   3,
		Content: "B",
		LeftID:  "site1:1",
		RightID: "EOF",
	}
	doc.ApplyOperation(op2)

	vector = doc.GetVector()
	if vector["site2"] != 3 {
		t.Errorf("Expected site2 clock 3, got %d", vector["site2"])
	}

	if doc.clock != 4 {
		t.Errorf("Expected doc clock 4, got %d", doc.clock)
	}
}

func TestDocumentIdempotentInsert(t *testing.T) {
	doc := NewDocument()

	op := Operation{
		Type:    "insert",
		NodeID:  "site1:1",
		SiteID:  "site1",
		Clock:   1,
		Content: "A",
		LeftID:  "BOF",
		RightID: "EOF",
	}

	doc.ApplyOperation(op)
	doc.ApplyOperation(op)

	if len(doc.nodes) != 1 {
		t.Errorf("Duplicate insert should be idempotent, got %d nodes", len(doc.nodes))
	}
}

func TestDocumentLWWDelete(t *testing.T) {
	doc := NewDocument()

	insertOp := Operation{
		Type:      "insert",
		NodeID:    "site1:1",
		SiteID:    "site1",
		Clock:     1,
		Content:   "A",
		Timestamp: 1000,
		LeftID:    "BOF",
		RightID:   "EOF",
	}
	doc.ApplyOperation(insertOp)

	oldDeleteOp := Operation{
		Type:      "delete",
		NodeID:    "site1:1",
		SiteID:    "site2",
		Clock:     1,
		Timestamp: 500,
	}
	doc.ApplyOperation(oldDeleteOp)

	node := doc.nodes["site1:1"]
	if node.Deleted {
		t.Error("Old delete should not override newer insert")
	}

	newDeleteOp := Operation{
		Type:      "delete",
		NodeID:    "site1:1",
		SiteID:    "site2",
		Clock:     2,
		Timestamp: 2000,
	}
	doc.ApplyOperation(newDeleteOp)

	node = doc.nodes["site1:1"]
	if !node.Deleted {
		t.Error("New delete should override older insert")
	}
}
