# Git 高级

## 分支策略

### Git Flow

- main：生产代码
- develop：开发集成分支
- feature/*：功能分支
- release/*：发布准备分支
- hotfix/*：紧急修复分支

### GitHub Flow

- main 始终可部署
- 功能分支 → PR → Code Review → 合并 main
- 简单，适合持续部署

### Trunk-Based Development

- 只有一条主干（trunk/main）
- 短生命周期功能分支（<1天）
- Feature Flag 控制未完成功能
- 适合高频发布团队

## 交互式 Rebase

```bash
git rebase -i HEAD~3
```

操作：
- pick：保留提交
- squash：合并到上一个提交
- reword：修改提交信息
- edit：暂停修改提交
- fixup：合并且丢弃提交信息
- drop：丢弃提交

## cherry-pick / revert / reflog / bisect

### cherry-pick

```bash
git cherry-pick <commit-hash>
```

将指定提交应用到当前分支。

### revert

```bash
git revert <commit-hash>
```

创建新提交来撤销指定提交（安全，不修改历史）。

### reflog

```bash
git reflog
git reset --hard HEAD@{n}
```

记录所有 HEAD 移动历史，可用于恢复误删提交。

### bisect

```bash
git bisect start
git bisect bad
git bisect good <commit>
```

二分查找引入 bug 的提交。

## 子模块与子树

### submodule

```bash
git submodule add <repo> <path>
git submodule update --init --recursive
```

- 独立仓库引用，指向特定 commit
- `.gitmodules` 文件记录映射

### subtree

```bash
git subtree add --prefix=<path> <repo> main --squash
git subtree pull --prefix=<path> <repo> main --squash
```

- 将子项目历史合并到主仓库
- 不需要 `.gitmodules`，克隆更简单

## Git LFS

```bash
git lfs install
git lfs track "*.psd"
git lfs track "*.zip"
```

- 大文件存储在 LFS 服务器
- 仓库中仅保留指针文件
- `.gitattributes` 记录追踪规则

## Hook 机制

### 客户端 Hook

- `pre-commit`：提交前检查（lint/格式化）
- `commit-msg`：校验提交信息格式
- `pre-push`：推送前运行测试

### 服务端 Hook

- `pre-receive`：接收推送前检查
- `post-receive`：推送后触发（CI/部署）

### 工具

- Husky：简化 Git Hook 配置
- lint-staged：仅对暂存文件运行 lint

## .gitignore / .gitattributes / sparse-checkout

### .gitignore

```
node_modules/
*.log
dist/
.env
```

### .gitattributes

```
*.sh text eol=lf
*.bat text eol=crlf
*.png binary
```

### sparse-checkout

```bash
git sparse-checkout init --cone
git sparse-checkout set src/app docs
```

仅检出部分目录，节省空间和时间。

## 冲突解决策略

- 优先使用 rebase 保持线性历史
- 冲突标记：`<<<<<<<` / `=======` / `>>>>>>>`
- 工具：`git mergetool` / VS Code / IntelliJ
- 策略：`git merge -X ours/theirs` 自动选择一方
- 最佳实践：小步提交、频繁合并、Code Review
