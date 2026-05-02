export class Toolbar {
  constructor(container, editor) {
    this.container = container;
    this.editor = editor;
    this.buttons = [];
  }

  render() {
    const groups = [
      [
        { icon: 'H1', title: '标题1', action: () => this.editor.insertLine('# ') },
        { icon: 'H2', title: '标题2', action: () => this.editor.insertLine('## ') },
        { icon: 'H3', title: '标题3', action: () => this.editor.insertLine('### ') },
      ],
      [
        { icon: 'B', title: '加粗 (Ctrl+B)', action: () => this.editor.wrapSelection('**') },
        { icon: 'I', title: '斜体 (Ctrl+I)', action: () => this.editor.wrapSelection('*') },
        { icon: 'S', title: '删除线', action: () => this.editor.wrapSelection('~~') },
        { icon: '<>', title: '行内代码', action: () => this.editor.wrapSelection('`') },
      ],
      [
        { icon: '•', title: '无序列表', action: () => this.editor.insertLine('- ') },
        { icon: '1.', title: '有序列表', action: () => this.editor.insertLine('1. ') },
        { icon: '☐', title: '任务列表', action: () => this.editor.insertLine('- [ ] ') },
        { icon: '>', title: '引用', action: () => this.editor.insertLine('> ') },
      ],
      [
        { icon: '—', title: '分隔线', action: () => this.editor.insertAtCursor('\n---\n') },
        { icon: '🔗', title: '链接 (Ctrl+K)', action: () => this.insertLink() },
        { icon: '🖼', title: '图片', action: () => this.insertImage() },
        { icon: '</>', title: '代码块', action: () => this.insertCodeBlock() },
        { icon: '📊', title: '表格', action: () => this.insertTable() },
      ],
    ];

    this.container.innerHTML = '';
    groups.forEach((group, gi) => {
      group.forEach((btn) => {
        const el = document.createElement('button');
        el.className = 'editor-toolbar-btn';
        el.title = btn.title;
        el.textContent = btn.icon;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          btn.action();
        });
        this.container.appendChild(el);
      });
      if (gi < groups.length - 1) {
        const sep = document.createElement('div');
        sep.className = 'editor-toolbar-sep';
        this.container.appendChild(sep);
      }
    });
  }

  insertLink() {
    const { from, to } = this.editor.cm.state.selection.main;
    const selected = this.editor.cm.state.sliceDoc(from, to);
    const text = selected || '链接文本';
    this.editor.cm.dispatch({
      changes: { from, to, insert: `[${text}](url)` },
    });
    this.editor.focus();
  }

  insertImage() {
    this.editor.insertAtCursor('![图片描述](url)');
  }

  insertCodeBlock() {
    this.editor.insertAtCursor('\n```language\ncode\n```\n');
  }

  insertTable() {
    const table = '\n| 列1 | 列2 | 列3 |\n|------|------|------|\n| 内容 | 内容 | 内容 |\n';
    this.editor.insertAtCursor(table);
  }
}
