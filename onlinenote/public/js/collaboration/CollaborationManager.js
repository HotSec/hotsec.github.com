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
  }

  generateId() {
    return Math.random().toString(36).substring(2, 10);
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
    }
  }

  sendEdit(operation) {
    this.send({
      type: 'edit',
      docId: this.docId,
      data: operation,
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
