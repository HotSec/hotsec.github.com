# Jupyter Notebook 使用

**Jupyter Notebook** 是一个开源的 `交互式计算环境`，它允许用户创建和共享包含实时代码、方程、可视化和文本的文档。它的名字来源于它支持的三种核心编程语言：Julia、Python 和 R，这也是 "Ju-pyt-er" 的名称由来。Jupyter Notebook 编写的文件后缀为 `.ipynb`

Jupyter Notebook 的主要特点包括：

1. **交互式编程** ：用户可以在单独的单元格中编写代码并执行，`立即看到代码运行结果`，这对于数据分析、机器学习、科学计算等领域非常有用。
2. **多语言支持** ：虽然最初是为 Julia、Python 和 R 设计的，但 Jupyter 现在支持超过 40 种编程语言，通过使用相应的内核。
3. **丰富的展示功能** ：Jupyter Notebook 支持 Markdown，允许用户添加格式化文本、图像、视频、HTML、LaTeX 等丰富的媒体内容，使得文档更加生动和信息丰富。
4. **数据可视化** ：Jupyter Notebook 与众多数据可视化库（如 Matplotlib、Plotly、Bokeh 等）无缝集成，可以直接在 Notebook 中生成图表和可视化数据。
5. **易于共享** ：Notebook 文件可以通过电子邮件、云服务或 Jupyter Notebook Viewer 等方式轻松共享，他人可以查看内容和运行代码，甚至可以留下评论。
6. **扩展性** ：Jupyter 有大量的扩展插件，可以增强其功能，如交互式小部件、代码自动完成、主题更换等。
7. **科学计算工具集成** ：Jupyter Notebook 可以与许多科学计算和数据分析工具集成，如 NumPy、Pandas、SciPy 等 Python 库，使得数据处理和分析变得更加方便。

Jupyter Notebook 是数据科学家、研究人员、教育工作者和学生等广泛使用的工具，它促进了开放科学和教育的发展，使得人们可以更容易地分享和复现研究结果。

本教程使用 Jupyter Notebook 来进行代码编写和运行，方便我们进行代码的编写和调试。

`VSCODE` 目前不用安装任何插件就以直接打开 Jupyter Notebook 文件。（也可以按照下一章进行插件安装配置）

Notebook 文档由一系列的单元格组成，主要由以下两种形式。

* **代码单元格** ：在代码单元格中输入代码并按 `Shift + Enter` 可以运行该单元格中的代码，并在下方显示输出结果。
* **Markdown 单元格** ：使用 `Markdown` 语法在单元格中编写文本。可以创建标题、列表、链接、格式化文本等，并使用 `Ctrl + Enter` 来渲染当前 Markdown 单元格。

通常我们使用代码单元格来进行代码编写，并及时运行查看结果。并使用以下是用的快捷键来提升效率：

### [单元格编辑](https://datawhalechina.github.io/llm-universe/#/C1/5.%E9%98%BF%E9%87%8C%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8?id=%e5%8d%95%e5%85%83%e6%a0%bc%e7%bc%96%e8%be%91)

* `Enter`: 进入编辑模式。
* `Esc`: 退出编辑模式。

### [单元格操作](https://datawhalechina.github.io/llm-universe/#/C1/5.%E9%98%BF%E9%87%8C%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8?id=%e5%8d%95%e5%85%83%e6%a0%bc%e6%93%8d%e4%bd%9c)

* `A`: 在当前单元格上方插入一个新的单元格。
* `B`: 在当前单元格下方插入一个新的单元格。
* `D` (两次按下): 删除当前单元格。
* `Z`: 撤销删除操作。
* `C`: 复制当前单元格。
* `V`: 粘贴之前复制的单元格。
* `X`: 剪切当前单元格。
* `Y`: 将当前单元格转换为代码单元格。
* `M`: 将当前单元格转换为 Markdown 单元格。
* `Shift + M`: 切换单元格的 Markdown 渲染状态。

### [代码执行和调试](https://datawhalechina.github.io/llm-universe/#/C1/5.%E9%98%BF%E9%87%8C%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8?id=%e4%bb%a3%e7%a0%81%e6%89%a7%e8%a1%8c%e5%92%8c%e8%b0%83%e8%af%95)

* `Shift + Enter`: 运行当前单元格，并跳转到下一个单元格。
* `Ctrl + Enter`: 运行当前单元格，但不跳转到下一个单元格。
* `Alt + Enter`: 运行当前单元格，并在下方插入一个新的单元格。
* `Esc`: 进入命令模式。
* `Enter`: 进入编辑模式。
* `Ctrl + Shift + -`: 分割当前单元格为两个单元格。
* `Ctrl + Shift + P`: 打开命令面板，可以搜索和执行各种命令。

### [导航和窗口管理](https://datawhalechina.github.io/llm-universe/#/C1/5.%E9%98%BF%E9%87%8C%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8?id=%e5%af%bc%e8%88%aa%e5%92%8c%e7%aa%97%e5%8f%a3%e7%ae%a1%e7%90%86)

* `Up` / `Down` 或 `K` / `J`: 在单元格之间上下移动。
* `Home` / `End`: 跳转到 Notebook 的开始或结束。
* `Ctrl + Home` / `Ctrl + End`: 跳转到当前 Notebook 的第一个或最后一个单元格。
* `Tab`: 在 Notebook 视图中切换到下一个面板（例如，从编辑器到输出或元数据面板）。
* `Shift + Tab`: 在 Notebook 视图中切换到上一个面板。

### [其他有用的快捷键](https://datawhalechina.github.io/llm-universe/#/C1/5.%E9%98%BF%E9%87%8C%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8?id=%e5%85%b6%e4%bb%96%e6%9c%89%e7%94%a8%e7%9a%84%e5%bf%ab%e6%8d%b7%e9%94%ae)

* `H`: 显示或隐藏 Notebook 的侧边栏。
* `M`: 将当前单元格转换为 Markdown 单元格。
* `Y`: 将当前单元格转换为代码单元格。
