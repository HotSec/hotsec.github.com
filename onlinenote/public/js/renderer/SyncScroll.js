export class SyncScroll {
  constructor(editor, preview) {
    this.editor = editor;
    this.preview = preview;
    this.editorScrolling = false;
    this.previewScrolling = false;
  }

  init() {
    if (!this.editor.cm) return;

    const editorEl = this.editor.cm.scrollDOM;
    const previewEl = this.preview.container;

    editorEl.addEventListener('scroll', () => {
      if (this.previewScrolling) return;
      this.editorScrolling = true;
      const ratio = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
      previewEl.scrollTop = ratio * (previewEl.scrollHeight - previewEl.clientHeight);
      clearTimeout(this._editorTimer);
      this._editorTimer = setTimeout(() => { this.editorScrolling = false; }, 100);
    });

    previewEl.addEventListener('scroll', () => {
      if (this.editorScrolling) return;
      this.previewScrolling = true;
      const ratio = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight || 1);
      editorEl.scrollTop = ratio * (editorEl.scrollHeight - editorEl.clientHeight);
      clearTimeout(this._previewTimer);
      this._previewTimer = setTimeout(() => { this.previewScrolling = false; }, 100);
    });
  }

  destroy() {
    clearTimeout(this._editorTimer);
    clearTimeout(this._previewTimer);
  }
}
