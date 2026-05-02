export class LivePreview {
  constructor(container) {
    this.container = container;
    this.marked = null;
    this.hljs = null;
  }

  async init() {
    if (window.marked) {
      this.marked = window.marked;
    }
    if (window.hljs) {
      this.hljs = window.hljs;
    }
    return this;
  }

  render(markdown) {
    if (!this.marked) return;
    this.container.innerHTML = this.marked.parse(markdown);
    if (this.hljs) {
      this.container.querySelectorAll('pre code').forEach((block) => {
        this.hljs.highlightElement(block);
      });
    }
  }
}
