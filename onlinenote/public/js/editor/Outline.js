export class Outline {
  constructor(container, editor) {
    this.container = container;
    this.editor = editor;
    this.items = [];
  }

  update() {
    this.items = this.editor.getOutline();
    this.render();
  }

  render() {
    if (this.items.length === 0) {
      this.container.innerHTML = '<div class="outline-empty">无标题</div>';
      return;
    }

    this.container.innerHTML = this.items.map((item) => {
      const indent = (item.level - 1) * 16;
      const levelLabel = item.isSummary ? 'S' : `H${item.level}`;
      const levelClass = item.isSummary ? 'outline-level outline-level-summary' : 'outline-level';
      return `<div class="outline-item" data-line="${item.line}" style="padding-left: ${indent + 8}px">
        <span class="${levelClass}">${levelLabel}</span>
        <span class="outline-text">${item.text}</span>
      </div>`;
    }).join('');

    this.container.querySelectorAll('.outline-item').forEach((el) => {
      el.addEventListener('click', () => {
        const line = parseInt(el.dataset.line);
        this.editor.scrollToLine(line);
        this.editor.focus();
      });
    });
  }
}
