# Memos VSCode 插件开发记录

## 0. 开发计划

- [ ] 搭建插件基础模板
- [ ] 实现 Memos API 调用
- [ ] 实现笔记列表展示
- [ ] 实现笔记详情展示
- [ ] 实现笔记编辑功能
- [ ] 实现笔记删除功能
- [ ] 实现笔记搜索功能
- [ ] 实现笔记标签功能
- [ ] 实现笔记分类功能
- [ ] 备份/导入
- [ ] TODO暂时、是否完成

## 1. 插件开发环境搭建


```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.17.0".
nvm current # Should print "v22.17.0".

# Download and install pnpm:
corepack enable pnpm

# Verify pnpm version:
pnpm -v
```
