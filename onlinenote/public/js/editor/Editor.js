export class Editor {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.cm = null;
    this.onChange = options.onChange || (() => {});
    this.onSave = options.onSave || (() => {});
    this.saveTimer = null;
    this.debounceTimer = null;
  }

  async init() {
    const [
      { EditorView, keymap },
      { markdown, markdownLanguage },
      { languages },
      { defaultKeymap, history, historyKeymap, indentWithTab },
      { basicSetup },
      { EditorState },
    ] = await Promise.all([
      import('https://esm.sh/@codemirror/view@6'),
      import('https://esm.sh/@codemirror/lang-markdown@6'),
      import('https://esm.sh/@codemirror/language-data@6'),
      import('https://esm.sh/@codemirror/commands@6'),
      import('https://esm.sh/codemirror@6'),
      import('https://esm.sh/@codemirror/state@6'),
    ]);

    this.EditorView = EditorView;
    this.EditorState = EditorState;

    const customTheme = EditorView.theme({
      '&': {
        fontSize: '14px',
        height: '100%',
      },
      '.cm-content': {
        fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
        lineHeight: '1.6',
        padding: '16px 0',
      },
      '.cm-gutters': {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-dim)',
        border: 'none',
        borderRight: '1px solid var(--border)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'var(--highlight-bg)',
        color: 'var(--text)',
      },
      '.cm-activeLine': {
        backgroundColor: 'var(--highlight-bg)',
      },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
        backgroundColor: 'var(--accent) !important',
        opacity: '0.25',
      },
      '.cm-cursor': {
        borderLeftColor: 'var(--accent)',
        borderLeftWidth: '2px',
      },
      '.cm-matchingBracket': {
        backgroundColor: 'var(--highlight-bg)',
        outline: '1px solid var(--accent)',
      },
      '.cm-searchMatch': {
        backgroundColor: 'var(--h4-color)',
        opacity: '0.3',
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: 'var(--h4-color)',
        opacity: '0.6',
      },
      '.cm-foldGutter': {
        cursor: 'pointer',
      },
      '.cm-tooltip': {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
      },
      '.cm-tooltip-autocomplete > ul > li': {
        padding: '4px 8px',
      },
      '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        backgroundColor: 'var(--highlight-bg)',
        color: 'var(--accent)',
      },
    });

    const saveKeymap = keymap.of([
      {
        key: 'Mod-s',
        run: () => {
          this.onSave(this.getContent());
          return true;
        },
      },
    ]);

    this.cm = new EditorView({
      state: EditorState.create({
        doc: this.options.content || '',
        extensions: [
          basicSetup,
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          saveKeymap,
          customTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.scheduleChange();
            }
            if (update.selectionSet) {
              if (this.options.onCursorChange) {
                const pos = update.state.selection.main.head;
                const line = update.state.doc.lineAt(pos);
                this.options.onCursorChange({
                  line: line.number,
                  column: pos - line.from + 1,
                  position: pos,
                });
              }
            }
          }),
          EditorView.lineWrapping,
        ],
      }),
      parent: this.container,
    });

    return this;
  }

  scheduleChange() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.onChange(this.getContent());
    }, 300);

    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.onSave(this.getContent());
    }, 2000);
  }

  getContent() {
    return this.cm ? this.cm.state.doc.toString() : '';
  }

  setContent(content) {
    if (!this.cm) return;
    this.cm.dispatch({
      changes: {
        from: 0,
        to: this.cm.state.doc.length,
        insert: content,
      },
    });
  }

  insertAtCursor(text) {
    if (!this.cm) return;
    const { from } = this.cm.state.selection.main;
    this.cm.dispatch({
      changes: { from, insert: text },
    });
    this.cm.focus();
  }

  wrapSelection(before, after) {
    if (!this.cm) return;
    const { from, to } = this.cm.state.selection.main;
    const selected = this.cm.state.sliceDoc(from, to);
    this.cm.dispatch({
      changes: { from, to, insert: before + selected + (after || before) },
    });
    this.cm.focus();
  }

  insertLine(prefix) {
    if (!this.cm) return;
    const pos = this.cm.state.selection.main.head;
    const line = this.cm.state.doc.lineAt(pos);
    this.cm.dispatch({
      changes: {
        from: line.from,
        insert: prefix,
      },
    });
    this.cm.focus();
  }

  getCursorLine() {
    if (!this.cm) return 1;
    const pos = this.cm.state.selection.main.head;
    return this.cm.state.doc.lineAt(pos).number;
  }

  scrollToLine(lineNum) {
    if (!this.cm) return;
    const line = this.cm.state.doc.line(Math.min(lineNum, this.cm.state.doc.lines));
    this.cm.dispatch({
      effects: this.EditorView.scrollIntoView(line.from, { y: 'center' }),
    });
  }

  getOutline() {
    if (!this.cm) return [];
    const doc = this.cm.state.doc;
    const outline = [];
    for (let i = 1; i <= doc.lines; i++) {
      const line = doc.line(i);
      const match = line.text.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        outline.push({
          level: match[1].length,
          text: match[2],
          line: i,
        });
      }
    }
    return outline;
  }

  focus() {
    if (this.cm) this.cm.focus();
  }

  destroy() {
    clearTimeout(this.debounceTimer);
    clearTimeout(this.saveTimer);
    if (this.cm) {
      this.cm.destroy();
      this.cm = null;
    }
  }
}
