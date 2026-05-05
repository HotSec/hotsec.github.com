export class CRDTNode {
  constructor(id, siteId, clock, content, deleted, timestamp, leftId, rightId) {
    this.id = id;
    this.siteId = siteId;
    this.clock = clock;
    this.content = content;
    this.deleted = deleted || false;
    this.timestamp = timestamp || Date.now();
    this.leftId = leftId || null;
    this.rightId = rightId || null;
  }

  clone() {
    return new CRDTNode(
      this.id, this.siteId, this.clock,
      this.content, this.deleted, this.timestamp,
      this.leftId, this.rightId
    );
  }

  toJSON() {
    return {
      id: this.id,
      siteId: this.siteId,
      clock: this.clock,
      content: this.content,
      deleted: this.deleted,
      timestamp: this.timestamp,
      leftId: this.leftId,
      rightId: this.rightId,
    };
  }

  static fromJSON(obj) {
    return new CRDTNode(
      obj.id, obj.siteId, obj.clock,
      obj.content, obj.deleted, obj.timestamp,
      obj.leftId, obj.rightId
    );
  }
}

export class CRDTOperation {
  constructor(type, nodeId, siteId, clock, content, timestamp, leftId, rightId) {
    this.type = type;
    this.nodeId = nodeId;
    this.siteId = siteId;
    this.clock = clock;
    this.content = content || '';
    this.timestamp = timestamp || Date.now();
    this.leftId = leftId || null;
    this.rightId = rightId || null;
  }

  toJSON() {
    return {
      type: this.type,
      nodeId: this.nodeId,
      siteId: this.siteId,
      clock: this.clock,
      content: this.content,
      timestamp: this.timestamp,
      leftId: this.leftId,
      rightId: this.rightId,
    };
  }

  static fromJSON(obj) {
    return new CRDTOperation(
      obj.type, obj.nodeId, obj.siteId, obj.clock,
      obj.content, obj.timestamp, obj.leftId, obj.rightId
    );
  }
}

export class CRDTDocument {
  constructor(siteId) {
    this.siteId = siteId;
    this.clock = 0;
    this.nodes = new Map();
    this.vector = {};
    this.pendingOps = [];
    this.opLog = [];
    this.BOF_ID = 'BOF';
    this.EOF_ID = 'EOF';

    this.nodes.set(this.BOF_ID, new CRDTNode(this.BOF_ID, 'system', 0, '', false, 0, null, this.EOF_ID));
    this.nodes.set(this.EOF_ID, new CRDTNode(this.EOF_ID, 'system', 0, '', false, 0, this.BOF_ID, null));
  }

  generateNodeId() {
    this.clock++;
    this.vector[this.siteId] = this.clock;
    return `${this.siteId}:${this.clock}`;
  }

  compareNodeIds(a, b) {
    if (a === b) return 0;
    if (a === this.BOF_ID) return -1;
    if (b === this.BOF_ID) return 1;
    if (a === this.EOF_ID) return 1;
    if (b === this.EOF_ID) return -1;

    const [aSite, aClock] = a.split(':');
    const [bSite, bClock] = b.split(':');
    const aClockNum = parseInt(aClock, 10);
    const bClockNum = parseInt(bClock, 10);

    if (aClockNum !== bClockNum) return aClockNum - bClockNum;
    if (aSite < bSite) return -1;
    if (aSite > bSite) return 1;
    return 0;
  }

  localInsert(index, content) {
    const ops = [];
    for (let i = 0; i < content.length; i++) {
      const op = this._insertChar(index + i, content[i]);
      if (op) ops.push(op);
    }
    return ops;
  }

  _insertChar(index, char) {
    const { leftNode, rightNode } = this._findInsertPosition(index);

    const nodeId = this.generateNodeId();
    const node = new CRDTNode(
      nodeId, this.siteId, this.clock,
      char, false, Date.now(),
      leftNode.id, rightNode.id
    );

    leftNode.rightId = nodeId;
    rightNode.leftId = nodeId;
    this.nodes.set(nodeId, node);

    const op = new CRDTOperation(
      'insert', nodeId, this.siteId, this.clock,
      char, node.timestamp, leftNode.id, rightNode.id
    );
    this.opLog.push(op);
    return op;
  }

  _findInsertPosition(index) {
    if (index <= 0) {
      let rightNode = this.nodes.get(this.BOF_ID);
      while (rightNode && rightNode.id !== this.EOF_ID) {
        const nextId = rightNode.rightId;
        if (!nextId) break;
        const next = this.nodes.get(nextId);
        if (!next) break;
        rightNode = next;
        if (!rightNode.deleted && rightNode.content) break;
      }
      if (rightNode.id === this.EOF_ID || (rightNode.deleted || !rightNode.content)) {
        return { leftNode: this.nodes.get(this.BOF_ID), rightNode: this.nodes.get(this.EOF_ID) };
      }
      return { leftNode: this.nodes.get(this.BOF_ID), rightNode };
    }

    let visibleIndex = -1;
    let currentNode = this.nodes.get(this.BOF_ID);

    while (currentNode && currentNode.id !== this.EOF_ID) {
      if (!currentNode.deleted && currentNode.content) {
        visibleIndex++;
        if (visibleIndex === index - 1) {
          const rightNode = this.nodes.get(currentNode.rightId) || this.nodes.get(this.EOF_ID);
          return { leftNode: currentNode, rightNode };
        }
      }
      currentNode = this.nodes.get(currentNode.rightId);
    }

    let leftNode = this.nodes.get(this.EOF_ID);
    while (leftNode && leftNode.id !== this.BOF_ID) {
      const prevId = leftNode.leftId;
      if (!prevId) break;
      const prev = this.nodes.get(prevId);
      if (!prev) break;
      leftNode = prev;
      if (!leftNode.deleted && leftNode.content) break;
    }
    if (leftNode.id === this.BOF_ID || (leftNode.deleted || !leftNode.content)) {
      return { leftNode: this.nodes.get(this.BOF_ID), rightNode: this.nodes.get(this.EOF_ID) };
    }
    return { leftNode, rightNode: this.nodes.get(this.EOF_ID) };
  }

  localDelete(fromIndex, toIndex) {
    const ops = [];
    for (let i = fromIndex; i < toIndex; i++) {
      const op = this._deleteChar(fromIndex);
      if (op) ops.push(op);
    }
    return ops;
  }

  _deleteChar(index) {
    const node = this._findNodeAtIndex(index);
    if (!node || node.deleted) return null;

    this.clock++;
    this.vector[this.siteId] = this.clock;

    node.deleted = true;
    node.timestamp = Date.now();

    const op = new CRDTOperation(
      'delete', node.id, this.siteId, this.clock,
      '', node.timestamp, null, null
    );
    this.opLog.push(op);
    return op;
  }

  _findNodeAtIndex(index) {
    let visibleIndex = -1;
    let currentNode = this.nodes.get(this.BOF_ID);

    while (currentNode && currentNode.id !== this.EOF_ID) {
      if (!currentNode.deleted && currentNode.content) {
        visibleIndex++;
        if (visibleIndex === index) return currentNode;
      }
      currentNode = this.nodes.get(currentNode.rightId);
    }
    return null;
  }

  applyRemoteOperation(op) {
    if (op.type === 'insert') {
      this._applyRemoteInsert(op);
    } else if (op.type === 'delete') {
      this._applyRemoteDelete(op);
    }

    if (!this.vector[op.siteId] || op.clock > this.vector[op.siteId]) {
      this.vector[op.siteId] = op.clock;
    }
    if (op.clock >= this.clock) {
      this.clock = op.clock + 1;
    }
  }

  _applyRemoteInsert(op) {
    if (this.nodes.has(op.nodeId)) return;

    const node = new CRDTNode(
      op.nodeId, op.siteId, op.clock,
      op.content, false, op.timestamp,
      op.leftId, op.rightId
    );
    this.nodes.set(op.nodeId, node);

    const leftNode = this.nodes.get(op.leftId);
    const rightNode = this.nodes.get(op.rightId);

    if (leftNode && rightNode) {
      let insertAfter = leftNode;
      let current = leftNode;
      while (current && current.id !== rightNode.id && current.id !== this.EOF_ID) {
        const nextId = current.rightId;
        if (!nextId) break;
        const next = this.nodes.get(nextId);
        if (!next) break;
        if (this.compareNodeIds(op.nodeId, nextId) < 0) {
          insertAfter = current;
          break;
        }
        insertAfter = next;
        current = next;
      }

      node.leftId = insertAfter.id;
      node.rightId = insertAfter.rightId;

      const afterNext = this.nodes.get(insertAfter.rightId);
      if (afterNext) {
        afterNext.leftId = node.id;
      }
      insertAfter.rightId = node.id;
    } else if (leftNode) {
      node.leftId = leftNode.id;
      const oldRightId = leftNode.rightId;
      node.rightId = oldRightId;
      leftNode.rightId = node.id;
      if (oldRightId) {
        const oldRight = this.nodes.get(oldRightId);
        if (oldRight) oldRight.leftId = node.id;
      }
    } else if (rightNode) {
      let insertBefore = rightNode;
      let current = rightNode;
      while (current && current.id !== this.BOF_ID) {
        const prevId = current.leftId;
        if (!prevId) break;
        const prev = this.nodes.get(prevId);
        if (!prev) break;
        insertBefore = prev;
        if (prev.id === op.leftId) break;
        current = prev;
      }

      node.rightId = insertBefore.id;
      node.leftId = insertBefore.leftId;

      const beforePrev = this.nodes.get(insertBefore.leftId);
      if (beforePrev) {
        beforePrev.rightId = node.id;
      }
      insertBefore.leftId = node.id;
    } else {
      let lastNode = this.nodes.get(this.BOF_ID);
      while (lastNode && lastNode.rightId && lastNode.rightId !== this.EOF_ID) {
        const next = this.nodes.get(lastNode.rightId);
        if (!next) break;
        lastNode = next;
      }

      node.leftId = lastNode.id;
      node.rightId = lastNode.rightId;

      const afterLast = this.nodes.get(lastNode.rightId);
      if (afterLast) {
        afterLast.leftId = node.id;
      }
      lastNode.rightId = node.id;
    }
  }

  _applyRemoteDelete(op) {
    const node = this.nodes.get(op.nodeId);
    if (!node) return;
    if (node.deleted) return;
    if (op.timestamp < node.timestamp) return;

    node.deleted = true;
    node.timestamp = op.timestamp;
  }

  rebuild() {
    const chars = [];
    let currentNode = this.nodes.get(this.BOF_ID);

    while (currentNode && currentNode.id !== this.EOF_ID) {
      if (!currentNode.deleted && currentNode.content) {
        chars.push(currentNode.content);
      }
      const nextId = currentNode.rightId;
      if (!nextId || nextId === currentNode.id) break;
      currentNode = this.nodes.get(nextId);
    }

    return chars.join('');
  }

  getVisibleLength() {
    let len = 0;
    let currentNode = this.nodes.get(this.BOF_ID);
    while (currentNode && currentNode.id !== this.EOF_ID) {
      if (!currentNode.deleted && currentNode.content) len++;
      const nextId = currentNode.rightId;
      if (!nextId || nextId === currentNode.id) break;
      currentNode = this.nodes.get(nextId);
    }
    return len;
  }

  getPositionForNode(targetNodeId) {
    let pos = 0;
    let currentNode = this.nodes.get(this.BOF_ID);
    while (currentNode && currentNode.id !== this.EOF_ID) {
      if (!currentNode.deleted && currentNode.content) {
        if (currentNode.id === targetNodeId) return pos;
        pos++;
      }
      const nextId = currentNode.rightId;
      if (!nextId || nextId === currentNode.id) break;
      currentNode = this.nodes.get(nextId);
    }
    return -1;
  }

  getNodeAtPosition(pos) {
    let currentPos = 0;
    let currentNode = this.nodes.get(this.BOF_ID);
    while (currentNode && currentNode.id !== this.EOF_ID) {
      if (!currentNode.deleted && currentNode.content) {
        if (currentPos === pos) return currentNode;
        currentPos++;
      }
      const nextId = currentNode.rightId;
      if (!nextId || nextId === currentNode.id) break;
      currentNode = this.nodes.get(nextId);
    }
    return null;
  }

  initFromContent(content) {
    this.nodes.clear();
    this.nodes.set(this.BOF_ID, new CRDTNode(this.BOF_ID, 'system', 0, '', false, 0, null, this.EOF_ID));
    this.nodes.set(this.EOF_ID, new CRDTNode(this.EOF_ID, 'system', 0, '', false, 0, this.BOF_ID, null));

    let leftNode = this.nodes.get(this.BOF_ID);
    const rightNode = this.nodes.get(this.EOF_ID);

    for (let i = 0; i < content.length; i++) {
      const nodeId = this.generateNodeId();
      const node = new CRDTNode(
        nodeId, this.siteId, this.clock,
        content[i], false, Date.now(),
        leftNode.id, rightNode.id
      );
      leftNode.rightId = nodeId;
      rightNode.leftId = nodeId;
      this.nodes.set(nodeId, node);
      leftNode = node;
    }
  }

  getState() {
    const nodeList = [];
    for (const [id, node] of this.nodes) {
      if (id !== this.BOF_ID && id !== this.EOF_ID) {
        nodeList.push(node.toJSON());
      }
    }
    return {
      siteId: this.siteId,
      clock: this.clock,
      vector: { ...this.vector },
      nodes: nodeList,
    };
  }

  loadState(state) {
    this.clock = state.clock || 0;
    this.vector = state.vector || {};

    this.nodes.clear();
    this.nodes.set(this.BOF_ID, new CRDTNode(this.BOF_ID, 'system', 0, '', false, 0, null, this.EOF_ID));
    this.nodes.set(this.EOF_ID, new CRDTNode(this.EOF_ID, 'system', 0, '', false, 0, this.BOF_ID, null));

    for (const obj of state.nodes) {
      const node = CRDTNode.fromJSON(obj);
      this.nodes.set(node.id, node);
    }

    const rightOf = new Map();
    const leftChildren = new Map();

    for (const [id, node] of this.nodes) {
      if (id === this.BOF_ID || id === this.EOF_ID) continue;
      if (node.leftId) {
        if (!leftChildren.has(node.leftId)) {
          leftChildren.set(node.leftId, []);
        }
        leftChildren.get(node.leftId).push(id);
      }
      if (node.rightId) {
        rightOf.set(id, node.rightId);
      }
    }

    const buildOrder = (parentId) => {
      const children = leftChildren.get(parentId) || [];
      if (children.length === 0) return [];

      children.sort((a, b) => this.compareNodeIds(a, b));

      const result = [];
      for (const childId of children) {
        result.push(childId);
        result.push(...buildOrder(childId));
      }
      return result;
    };

    const orderedIds = buildOrder(this.BOF_ID);

    let prev = this.nodes.get(this.BOF_ID);
    for (const nodeId of orderedIds) {
      const node = this.nodes.get(nodeId);
      node.leftId = prev.id;
      prev.rightId = nodeId;
      prev = node;
    }
    prev.rightId = this.EOF_ID;
    this.nodes.get(this.EOF_ID).leftId = prev.id;
  }
}
