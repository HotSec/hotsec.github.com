# Tasks

## 已完成任务（手动修改）

- [x] ~~Task 0: 修复 mybook ALL.md 知识错误~~ (已手动完成)
  - [x] ~~修正 Go 数据类型描述，补充 complex64/complex128、uint 系列等~~
  - [x] ~~修正 Go 语言 "Pythonic" 误用~~
  - [x] ~~修正章节编号冲突（7.3/7.4/7.5/7.6）~~
- [x] ~~Task 1: 将 mybook ALL.md 同步为 onlinenote ALL.md 的完整版本~~ (已手动完成)
- [x] ~~Task 2: 同步 onlinenote ALL.md 与 mybook ALL.md 保持一致~~ (已手动完成)

## 待执行任务

- [ ] Task 3: 修正 ALL.md 残留知识错误
  - [ ] SubTask 3.1: 确认 "Go 1.26 新特性" 的发布状态，标注为"已发布"或调整描述（两个 ALL.md 都需同步修改）

- [ ] Task 4: 清理重复文件
  - [ ] SubTask 4.1: 对比 security/2_安全工具与方法/nuclei.md 和 3_Nuclei.md 内容差异，合并后删除 nuclei.md（保留 3_Nuclei.md）
  - [ ] SubTask 4.2: 对比 architecture/架构设计.md 和 1_架构设计.md 内容差异，合并后删除 架构设计.md（保留 1_架构设计.md）

- [ ] Task 5: 最小化补充缺失知识点文档
  - [ ] SubTask 5.1: 对比 ALL.md 索引与 mybook 目录现有文件，列出缺失文档清单
  - [ ] SubTask 5.2: 仅为 ALL.md 中有详细描述的关键知识点创建补充文档

# Task Dependencies

- Task 3 可独立执行
- Task 4 可独立执行
- Task 5 依赖 Task 3 完成（确保 ALL.md 内容准确后再做补充）
- Task 4 和 Task 5 可并行执行
