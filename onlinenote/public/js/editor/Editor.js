export class Editor {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.cm = null;
    this.onChange = options.onChange || (() => {});
    this.onSave = options.onSave || (() => {});
    this.onChanges = options.onChanges || (() => {});
    this.saveTimer = null;
    this.debounceTimer = null;
    this.pendingChanges = [];
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
              update.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
                this.pendingChanges.push({
                  from: fromA,
                  to: toA,
                  inserted: inserted.toString(),
                });
              });
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
      if (this.pendingChanges.length > 0) {
        const changes = this.pendingChanges.map(c => ({...c}));
        this.pendingChanges = [];
        this.onChanges(changes);
      }
    }, 300);

    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.onSave(this.getContent());
    }, 2000);
  }

  getContent() {
    return this.cm ? this.cm.state.doc.toString() : '';
  }

  applyChanges(changes) {
    if (!this.cm || !changes || changes.length === 0) return;
    const pos = this.cm.state.selection.main.head;
    let offset = 0;
    const adjusted = changes.map(c => {
      const adj = { from: c.from + offset, to: c.to + offset, insert: c.inserted };
      offset += (c.inserted ? c.inserted.length : 0) - (c.to - c.from);
      return adj;
    });
    this.cm.dispatch({
      changes: adjusted,
      selection: { anchor: Math.min(pos, this.cm.state.doc.length + offset) },
    });
  }

  setContent(content) {
    if (!this.cm) return;
    const pos = this.cm.state.selection.main.head;
    const oldLen = this.cm.state.doc.length;
    this.cm.dispatch({
      changes: { from: 0, to: oldLen, insert: content },
      selection: { anchor: Math.min(pos, content.length) },
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
    let lastHeadingLevel = 0;
    for (let i = 1; i <= doc.lines; i++) {
      const line = doc.line(i);
      const headingMatch = line.text.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        lastHeadingLevel = headingMatch[1].length;
        outline.push({
          level: lastHeadingLevel,
          text: headingMatch[2],
          line: i,
          isSummary: false,
        });
      } else {
        const summaryMatch = line.text.match(/^<summary>(.+?)<\/summary>/);
        if (summaryMatch) {
          outline.push({
            level: lastHeadingLevel + 1,
            text: summaryMatch[1],
            line: i,
            isSummary: true,
          });
        }
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
