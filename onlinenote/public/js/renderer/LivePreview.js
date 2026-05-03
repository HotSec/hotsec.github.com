export class LivePreview {
  constructor(container) {
    this.container = container;
    this.marked = null;
    this.hljs = null;
    this.baseSrcPath = '';
  }

  setBaseSrcPath(srcPath) {
    this.baseSrcPath = srcPath || '';
  }

  async init() {
    if (window.marked) {
      this.marked = window.marked;
      this.marked.setOptions({
        breaks: true,
        gfm: true,
      });
    }
    if (window.hljs) {
      this.hljs = window.hljs;
    }
    return this;
  }

  resolveMdLink(href) {
    if (!this.baseSrcPath) return href;
    if (href.startsWith('/')) return href;
    var baseDir = this.baseSrcPath.substring(0, this.baseSrcPath.lastIndexOf('/'));
    var resolved = baseDir + '/' + href;
    var parts = resolved.split('/');
    var stack = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === '..') {
        if (stack.length > 0) stack.pop();
      } else if (parts[i] !== '.' && parts[i] !== '') {
        stack.push(parts[i]);
      }
    }
    return './' + stack.join('/');
  }

  render(markdown) {
    if (!this.marked) return;
    const html = this.marked.parse(markdown);
    this.container.innerHTML = html;
    this.container.querySelectorAll('details').forEach((el) => {
      el.style.cssText = 'margin:8px 0;border:1px solid var(--border);border-radius:6px;padding:0;background:var(--bg-tertiary);';
      const summary = el.querySelector('summary');
      if (summary) {
        summary.style.cssText = 'padding:8px 12px;cursor:pointer;font-weight:600;color:var(--accent);border-bottom:1px solid var(--border);list-style:none;display:flex;align-items:center;gap:6px;';
        summary.insertAdjacentHTML('afterbegin', '<span style="font-size:10px">▶</span>');
        summary.addEventListener('click', () => {
          const arrow = summary.querySelector('span');
          if (arrow) arrow.textContent = el.open ? '▶' : '▼';
        });
      }
    });
    this.container.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href && href.match(/\.md$/i)) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const resolvedHref = this.resolveMdLink(href);
          const docId = resolvedHref.replace(/^\.\//, '').replace(/\.md$/, '').replace(/\//g, '--');
          window.open(`editor.html?doc=${encodeURIComponent(docId)}&src=${encodeURIComponent(resolvedHref)}`, '_blank');
        });
      }
    });
    if (this.hljs) {
      this.container.querySelectorAll('pre code').forEach((block) => {
        this.hljs.highlightElement(block);
      });
    }
  }
}
