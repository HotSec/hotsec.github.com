import { CRDTDocument, CRDTOperation } from '../crdt/CRDTDocument.js';

export class CollaborationManager {
  constructor(options = {}) {
    this.ws = null;
    this.docId = options.docId || 'all-md';
    this.userId = options.userId || this.generateId();
    this.userName = options.userName || 'Anonymous';
    this.color = options.color || '';
    this.onRemoteEdit = options.onRemoteEdit || (() => {});
    this.onRemoteCursor = options.onRemoteCursor || (() => {});
    this.onUserJoin = options.onUserJoin || (() => {});
    this.onUserLeave = options.onUserLeave || (() => {});
    this.onUserList = options.onUserList || (() => {});
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;

    this.crdt = new CRDTDocument(this.userId);
    this.crdtEnabled = options.crdtEnabled || false;
    this.onCRDTUpdate = options.onCRDTUpdate || (() => {});
    this.onCRDTChanges = options.onCRDTChanges || (() => {});
    this.pendingCRDTOps = [];
    this.syncTimer = null;
    this.syncInterval = 200;
    this.lastEditVersion = 0;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  initCRDT(content) {
    if (!this.crdtEnabled) return;
    this.crdt.initFromContent(content);
  }

  connect(url) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const params = new URLSearchParams({
      userId: this.userId,
      userName: this.userName,
      docId: this.docId,
      color: this.color,
    });

    this.ws = new WebSocket(`${url}?${params}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      console.log('Collaboration: connected');
      if (this.crdtEnabled) {
        this.requestCRDTSync();
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.handleMessage(msg);
      } catch (e) {
        console.error('Collaboration: parse error', e);
      }
    };

    this.ws.onclose = () => {
      console.log('Collaboration: disconnected');
      this.attemptReconnect(url);
    };

    this.ws.onerror = (err) => {
      console.error('Collaboration: error', err);
    };
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'user-joined':
        this.onUserJoin(msg);
        break;
      case 'user-left':
        this.onUserLeave(msg);
        break;
      case 'user-list':
        this.onUserList(msg.users || []);
        break;
      case 'edit':
        if (msg.userId !== this.userId) {
          const data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
          const editVersion = data.version || 0;
          // Version check: only apply if this is the next expected version
          if (editVersion > 0 && editVersion !== this.lastEditVersion + 1) {
            console.warn('Collaboration: edit version mismatch, skipping',
              'expected', this.lastEditVersion + 1, 'got', editVersion);
            return;
          }
          this.lastEditVersion = editVersion;
          this.onRemoteEdit(msg);
        }
        break;
      case 'cursor':
        if (msg.userId !== this.userId) {
          this.onRemoteCursor(msg);
        }
        break;
      case 'document-saved':
        console.log('Document saved on server');
        break;
      case 'crdt-op':
        if (msg.userId !== this.userId) {
          this.handleRemoteCRDTOp(msg);
        }
        break;
    }
  }

  handleLocalChanges(changes) {
    if (!this.crdtEnabled) {
      this.sendChanges(changes);
      return;
    }

    let offset = 0;
    for (const change of changes) {
      const from = change.from + offset;
      const to = change.to + offset;
      const inserted = change.inserted;

      if (from !== to) {
        const deleteOps = this.crdt.localDelete(from, to);
        this.pendingCRDTOps.push(...deleteOps);
        offset -= (to - from);
      }

      if (inserted && inserted.length > 0) {
        const insertOps = this.crdt.localInsert(from, inserted);
        this.pendingCRDTOps.push(...insertOps);
        offset += inserted.length;
      }
    }

    this.scheduleCRDTSync();
  }

  scheduleCRDTSync() {
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.flushCRDTOps();
    }, this.syncInterval);
  }

  flushCRDTOps() {
    if (this.pendingCRDTOps.length === 0) return;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const ops = this.pendingCRDTOps.map(op => op.toJSON());
    this.pendingCRDTOps = [];

    this.send({
      type: 'crdt-op',
      docId: this.docId,
      userId: this.userId,
      data: { operations: ops },
    });
  }

  handleRemoteCRDTOp(msg) {
    if (!this.crdtEnabled) return;

    try {
      const data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
      const ops = data.operations || [];

      const changes = [];
      for (const opData of ops) {
        const op = CRDTOperation.fromJSON(opData);
        const change = this.crdt.applyRemoteOpAsChange(op);
        if (change) {
          changes.push(change);
        }
      }

      if (changes.length > 0) {
        this.onCRDTChanges(changes);
      }
    } catch (e) {
      console.error('CRDT: failed to handle remote op', e);
    }
  }

  requestCRDTSync() {
    if (!this.crdtEnabled) return;

    // Flush pending ops first so they are included in the sync request
    const ops = this.pendingCRDTOps.map(op => op.toJSON());
    this.pendingCRDTOps = [];

    fetch(`/api/documents/${encodeURIComponent(this.docId)}/crdt/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operations: ops,
        vector: this.crdt.vector,
      }),
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.operations && data.operations.length > 0) {
        const changes = [];
        for (const opData of data.operations) {
          const op = CRDTOperation.fromJSON(opData);
          const change = this.crdt.applyRemoteOpAsChange(op);
          if (change) {
            changes.push(change);
          }
        }
        if (changes.length > 0) {
          this.onCRDTChanges(changes);
        }
      }
    })
    .catch(e => {
      console.error('CRDT: sync request failed', e);
    });
  }

  sendEdit(operation) {
    this.send({
      type: 'edit',
      docId: this.docId,
      data: operation,
    });
  }

  sendChanges(changes) {
    this.send({
      type: 'edit',
      docId: this.docId,
      data: { changes },
    });
  }

  sendCursor(position) {
    this.send({
      type: 'cursor',
      docId: this.docId,
      data: position,
    });
  }

  send(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  attemptReconnect(url) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Collaboration: max reconnect attempts reached');
      return;
    }
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    console.log(`Collaboration: reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(url), delay);
  }

  disconnect() {
    clearTimeout(this.syncTimer);
    this.flushCRDTOps();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
