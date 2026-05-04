# VS Code 配置备忘

## Markdown 粘贴文件配置

粘贴图片时自动保存到指定目录：

```json
"markdown.copyFiles.destination": {
  "**/*": "image/${documentBaseName}/${unixTime}.png"
}
```

## 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd+Shift+P` | 命令面板 |
| `Cmd+P` | 快速打开文件 |
| `Cmd+D` | 选中下一个相同词 |
| `Cmd+Shift+L` | 选中所有相同词 |
| `Option+↑/↓` | 移动当前行 |
| `Cmd+/` | 切换注释 |
| `Cmd+K Cmd+S` | 键盘快捷方式设置 |

## 常用插件

| 插件 | 用途 |
|------|------|
| GitHub Copilot | AI 代码补全 |
| Prettier | 代码格式化 |
| ESLint | JS/TS 代码检查 |
| Go | Go 语言支持 |
| Python | Python 语言支持 |
| Markdown Preview Mermaid | Mermaid 图表预览 |
| Remote - SSH | 远程开发 |
| Docker | Docker 支持 |

## settings.json 常用配置

```json
{
  "editor.fontSize": 14,
  "editor.tabSize": 4,
  "editor.formatOnSave": true,
  "editor.minimap.enabled": false,
  "files.autoSave": "onFocusChange",
  "terminal.integrated.fontSize": 13,
  "workbench.colorTheme": "One Dark Pro"
}
```
