export class SyncScroll {
  constructor(editor, preview) {
    this.editor = editor;
    this.preview = preview;
    this.editorScrolling = false;
    this.previewScrolling = false;
    this.headingMap = [];
  }

  buildHeadingMap() {
    const outline = this.editor.getOutline();
    const previewEl = this.preview.container;
    const headings = previewEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
    this.headingMap = [];

    for (let i = 0; i < outline.length && i < headings.length; i++) {
      this.headingMap.push({
        editorLine: outline[i].line,
        previewEl: headings[i],
      });
    }
  }

  findEditorScrollTarget(editorTopLine) {
    if (this.headingMap.length === 0) return null;
    let prev = this.headingMap[0];
    for (let i = 0; i < this.headingMap.length; i++) {
      if (this.headingMap[i].editorLine > editorTopLine) {
        return prev;
      }
      prev = this.headingMap[i];
    }
    return prev;
  }

  findPreviewScrollTarget(previewScrollTop) {
    if (this.headingMap.length === 0) return null;
    let prev = this.headingMap[0];
    for (let i = 0; i < this.headingMap.length; i++) {
      const rect = this.headingMap[i].previewEl.getBoundingClientRect();
      const containerRect = this.preview.container.getBoundingClientRect();
      const relTop = rect.top - containerRect.top + this.preview.container.scrollTop;
      if (relTop > previewScrollTop + 20) {
        return prev;
      }
      prev = this.headingMap[i];
    }
    return prev;
  }

  init() {
    if (!this.editor.cm) return;

    const editorEl = this.editor.cm.scrollDOM;
    const previewEl = this.preview.container;

    editorEl.addEventListener('scroll', () => {
      if (this.previewScrolling) return;
      this.editorScrolling = true;

      if (this.headingMap.length > 0) {
        const lineAtTop = Math.floor(editorEl.scrollTop / (editorEl.scrollHeight / this.editor.cm.state.doc.lines)) + 1;
        const target = this.findEditorScrollTarget(lineAtTop);
        if (target && target.previewEl) {
          const containerRect = previewEl.getBoundingClientRect();
          const targetRect = target.previewEl.getBoundingClientRect();
          previewEl.scrollTop += targetRect.top - containerRect.top - 10;
        }
      } else {
        const ratio = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
        previewEl.scrollTop = ratio * (previewEl.scrollHeight - previewEl.clientHeight);
      }

      clearTimeout(this._editorTimer);
      this._editorTimer = setTimeout(() => { this.editorScrolling = false; }, 100);
    });

    previewEl.addEventListener('scroll', () => {
      if (this.editorScrolling) return;
      this.previewScrolling = true;

      if (this.headingMap.length > 0) {
        const target = this.findPreviewScrollTarget(previewEl.scrollTop);
        if (target && target.editorLine) {
          const line = this.editor.cm.state.doc.line(Math.min(target.editorLine, this.editor.cm.state.doc.lines));
          this.editor.cm.dispatch({
            effects: this.editor.EditorView.scrollIntoView(line.from, { y: 'start' }),
          });
        }
      } else {
        const ratio = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight || 1);
        editorEl.scrollTop = ratio * (editorEl.scrollHeight - editorEl.clientHeight);
      }

      clearTimeout(this._previewTimer);
      this._previewTimer = setTimeout(() => { this.previewScrolling = false; }, 100);
    });
  }

  update() {
    this.buildHeadingMap();
  }

  destroy() {
    clearTimeout(this._editorTimer);
    clearTimeout(this._previewTimer);
  }
}
