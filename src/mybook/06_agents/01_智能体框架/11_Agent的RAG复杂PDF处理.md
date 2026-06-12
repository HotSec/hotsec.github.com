# Agent 的 RAG 如何处理复杂 PDF

## 一、复杂 PDF 的挑战

### 1.1 为什么普通 PDF 解析器不够用

| 挑战 | 说明 |
|------|------|
| **多栏布局** | 双栏/三栏论文，文字提取顺序错乱 |
| **表格提取** | 有线/无线表格，跨页表格，合并单元格 |
| **公式识别** | LaTeX 数学公式，化学结构式 |
| **图文混排** | 图片中的文字、流程图、架构图 |
| **扫描件 OCR** | 文字不可选、低分辨率、倾斜矫正 |
| **页眉页脚** | 干扰正文内容，需要自动去除 |
| **图表标题** | 图片/表格编号与标题的对应关系 |

### 1.2 传统 PyMuPDF / pdfplumber 的问题

```python
# PyMuPDF 提取多栏论文的结果（错乱示例）
import fitz
doc = fitz.open("paper.pdf")
text = doc[0].get_text()  
# 输出：栏1第一句 + 栏2第一句 + 栏1第二句 ... （完全交错）
```

---

## 二、主流复杂 PDF 解析工具对比

### 2.1 工具全景

| 工具 | 开发者 | 类型 | 开源 | 核心特点 |
|------|--------|------|------|----------|
| **MinerU** | OpenDataLab | 开源+API | ✓ | VLM + Pipeline 双模式，综合最强 |
| **LlamaParse** | LlamaIndex | 云 API | ✗ | LlamaIndex 生态，Markdown 输出 |
| **Docling** | IBM | 开源 | ✓ | 深度学习布局分析，DocTags 格式 |
| **Unstructured** | Unstructured.io | 开源+API | ✓ | 多格式通用，生态丰富 |
| **Marker** | VikParuchuri | 开源 | ✓ | 专注 PDF→Markdown，速度快 |
| **PyMuPDF4LLM** | PyMuPDF | 开源 | ✓ | 传统工具 LLM 适配版 |

### 2.2 OmniDocBench 基准测试

OmniDocBench 是当前最全面的文档解析评测基准，覆盖 9 类文档、多种语言。

| 工具 | 综合准确率 | 文本 | 表格 | 公式 | 阅读顺序 |
|------|-----------|------|------|------|----------|
| **MinerU (vlm)** | **~90.7%** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| MinerU (pipeline) | ~84% | ★★★★ | ★★★★ | ★★★★ | ★★★★ |
| LlamaParse | ~76% | ★★★★ | ★★★ | ★★★ | ★★★ |
| Docling | ~72% | ★★★★ | ★★★★ | ★★★ | ★★★★ |
| Marker | ~74% | ★★★★ | ★★★ | ★★ | ★★★ |
| Unstructured | ~68% | ★★★ | ★★★ | ★★ | ★★ |

> **关键结论**：MinerU 的 VLM 模式以 ~90.7% 综合准确率显著领先，pipeline 模式也达到 ~84%。

---

## 三、MinerU — 当前最佳方案

### 3.1 双模式架构

```
MinerU
├── Pipeline 模式（快速）
│   ├── PDF 分类（文字型/扫描型）
│   ├── 布局分析（DocLayoutYOLO 模型）
│   ├── 阅读顺序排序
│   ├── 公式检测与识别
│   └── 表格识别
│
└── VLM 模式（高精度）
    └── 1.2B VLM 模型端到端解析
        ├── 自然理解页面结构
        ├── 幻觉率低
        └── 多语言支持好
```

### 3.2 安装与使用

```bash
# 安装
pip install magic-pdf

# 下载模型（首次自动下载）
# Pipeline 模式使用 DocLayoutYOLO + MFTableDet + UniMERNet 等
```

```python
# Pipeline 模式
from magic_pdf.pipe.UNIPipe import UNIPipe
from magic_pdf.rw.DiskReaderWriter import DiskReaderWriter

# 解析 PDF
pipe = UNIPipe(pdf_bytes, jso_useful_key={}, image_writer=DiskReaderWriter("./output"))
pipe.pipe_classify()      # 分类
pipe.pipe_analyze()       # 布局分析
pipe.pipe_parse()         # 解析
content = pipe.pipe_mk_markdown("./output/images")  # 生成 Markdown
```

```python
# VLM 模式（需要 API Token）
import requests

url = "https://mineru.net/api/v1/parse"
headers = {"Authorization": "Bearer YOUR_TOKEN"}
files = {"file": open("paper.pdf", "rb")}

resp = requests.post(url, headers=headers, files=files)
markdown_content = resp.json()["content"]
```

### 3.3 输出格式

```markdown
<!-- MinerU 输出示例 -->
# 论文标题

## Abstract
这是摘要内容，保持正确的阅读顺序。

![](images/fig1.jpg)  
*图1：系统架构*

| 方法 | 准确率 | F1 |
|------|--------|-----|
| BERT | 92.3% | 0.91 |
| Ours | **95.1%** | **0.94** |

$$
\mathcal{L} = -\frac{1}{N}\sum_{i=1}^{N} y_i \log(\hat{y}_i)
$$
```

---

## 四、LlamaParse — LlamaIndex 生态

### 4.1 特点

- 云服务，无需本地 GPU
- 原生 LlamaIndex 集成
- 支持多模态（图片+文字）
- 支持多种输出格式（Markdown/JSON/Text）

### 4.2 使用

```python
from llama_parse import LlamaParse
from llama_index.core import VectorStoreIndex

parser = LlamaParse(
    api_key="llx-xxx",
    result_type="markdown",  # 输出 Markdown
    parsing_instruction="Extract all tables and formulas precisely",
    premium_mode=True,       # 高精度模式（复杂文档）
)

documents = await parser.aload_data("paper.pdf")

# 直接送入 LlamaIndex
index = VectorStoreIndex.from_documents(documents)
```

```python
# 带解析指令的高级用法
parser = LlamaParse(
    parsing_instruction="""
    This is a scientific paper with two-column layout.
    - Read each column separately, left column first.
    - Extract all tables with headers.
    - Convert all formulas to LaTeX.
    - Ignore page headers and footers.
    """
)
```

---

## 五、Docling — IBM 开源方案

### 5.1 特点

- IBM 开源，Apache 2.0
- DocTags 格式保留语义结构
- 深度学习布局分析模型
- 表格识别（TableFormer）

### 5.2 使用

```python
from docling.document_converter import DocumentConverter

converter = DocumentConverter()
result = converter.convert("paper.pdf")

# 导出 Markdown
markdown = result.document.export_to_markdown()

# 导出 JSON（保留结构信息）
json_output = result.document.export_to_dict()

# 遍历文档结构
for item in result.document.iterate_items():
    if item.label == "table":
        print(item.export_to_dataframe())  # 表格→DataFrame
    elif item.label == "equation":
        print(item.text)  # LaTeX 公式
```

### 5.3 DocTags 格式

Docling 独有的 DocTags 格式保留了完整的文档语义标注：

```xml
<document>
  <title>论文标题</title>
  <section><h1>Introduction</h1>
    <p>段落内容...</p>
    <table>
      <caption>表格标题</caption>
      ...
    </table>
  </section>
</document>
```

---

## 六、Marker — 快速 PDF→Markdown

### 6.1 特点

- 纯本地运行
- 速度快（比 Nougat 快 10x）
- 支持多语言
- 专注学术论文

### 6.2 使用

```bash
# 命令行
marker_single paper.pdf output_dir --batch_multiplier 2

# 批量处理
marker /path/to/pdfs /output/dir --workers 4
```

```python
from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict

converter = PdfConverter(
    artifact_dict=create_model_dict(),
)
rendered = converter("paper.pdf")
markdown_text = rendered.markdown
```

---

## 七、多栏布局处理专题

### 7.1 问题本质

PDF 内部文字是按**视觉位置**而非**逻辑顺序**存储的。多栏文档中：

```
物理顺序（PDF内部）:  栏1行1 → 栏2行1 → 栏1行2 → 栏2行2
正确逻辑顺序:        栏1行1→行2→行3... → 栏2行1→行2→行3...
```

### 7.2 解决方案

| 方案 | 原理 | 代表工具 |
|------|------|----------|
| **布局分析模型** | CNN/Transformer 检测文本块边界框 | DocLayoutYOLO, LayoutLMv3 |
| **启发式排序** | 按 x/y 坐标排序，识别栏边界 | PyMuPDF + 自定义逻辑 |
| **VLM 理解** | 视觉模型自然理解阅读顺序 | MinerU VLM, GPT-4V |
| **列识别算法** | 投影直方图分割列区域 | pdfplumber |

### 7.3 启发式排序示例

```python
import fitz

def extract_two_column(doc):
    """启发式双栏提取"""
    page = doc[0]
    blocks = page.get_text("blocks")
    
    mid_x = page.rect.width / 2  # 页面中线
    
    left_col = sorted(
        [b for b in blocks if b[0] < mid_x],
        key=lambda b: b[1]  # 按 y 排序
    )
    right_col = sorted(
        [b for b in blocks if b[0] >= mid_x],
        key=lambda b: b[1]
    )
    
    return left_col, right_col
```

---

## 八、表格提取专题

### 8.1 表格类型与难点

| 类型 | 特征 | 难点 |
|------|------|------|
| **有线表格** | 有完整边框 | 简单 |
| **无线表格** | 只有对齐文本 | 需语义理解 |
| **合并单元格** | 跨行/跨列 | 结构恢复 |
| **跨页表格** | 一页未完 | 拼接与表头继承 |
| **嵌套表格** | 表格内含表格 | 层级解析 |

### 8.2 工具推荐

```python
# 方案1：pdfplumber（有线表格效果好）
import pdfplumber

with pdfplumber.open("report.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()  # 自动检测有线表格
        for table in tables:
            for row in table:
                print(row)

# 方案2：Camelot（表格分析专用）
import camelot

tables = camelot.read_pdf("report.pdf", pages="1-10", flavor="lattice")
for table in tables:
    print(table.df)  # pandas DataFrame

# 方案3：Table Transformer（深度学习检测）
from transformers import pipeline

detector = pipeline("object-detection", model="microsoft/table-transformer-detection")
```

---

## 九、公式识别专题

### 9.1 方案对比

| 方案 | 方法 | 准确率 | 速度 |
|------|------|--------|------|
| **UniMERNet** | 专用公式识别网络 | 高 | 中 |
| **Pix2Tex** | ViT + Transformer | 高 | 慢 |
| **MathPix API** | 商业云服务 | 最高 | 快 |
| **LaTeX-OCR** | 开源，微调 TrOCR | 中 | 中 |

### 9.2 Pix2Tex 使用

```python
from pix2tex.cli import LatexOCR

model = LatexOCR()
latex = model("formula_image.png")
# 输出: \\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}
```

---

## 十、扫描件 PDF 处理

### 10.1 处理流程

```
扫描PDF → OCR识别 → 布局分析 → 内容提取
   │           │
   ▼           ▼
 文字不可选    PaddleOCR / Tesseract / SuryaOCR
```

### 10.2 SuryaOCR（推荐）

```python
from surya.ocr import run_ocr
from surya.model.detection import segformer
from surya.model.recognition.model import load_model

# 高精度多语言 OCR
predictions = run_ocr(
    ["scanned.pdf"],
    langs=["zh", "en"],  # 中英混合
    det_model=det_model,
    rec_model=rec_model,
)
```

---

## 十一、Agent RAG 集成完整方案

### 11.1 推荐架构

```
复杂PDF → [预处理层] → [分块策略] → [向量存储] → Agent检索
              │
              ├─ MinerU/Docling 解析
              ├─ 表格→独立块
              ├─ 公式→LaTeX文本
              └─ 图片→多模态Embedding
              │
              ▼
       [智能 Chunking]
       - 按 section 分块
       - 表格独立索引
       - 保留公式上下文
```

### 11.2 多模态 RAG 示例

```python
from langchain.text_splitter import MarkdownHeaderTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

# 1. 先用 MinerU 解析为 Markdown
markdown_content = parse_with_mineru("paper.pdf")

# 2. 按标题层级智能分块
headers_to_split_on = [
    ("#", "H1"),
    ("##", "H2"),
    ("###", "H3"),
]
splitter = MarkdownHeaderTextSplitter(headers_to_split_on)
chunks = splitter.split_text(markdown_content)

# 3. 表格单独处理
table_chunks = extract_tables_as_chunks(markdown_content)

# 4. 构建多向量索引
vector_store = Chroma(embedding_function=OpenAIEmbeddings())
vector_store.add_documents(chunks + table_chunks)

# 5. Agent 检索
retriever = vector_store.as_retriever(search_kwargs={"k": 5})
```

### 11.3 增强检索策略

```python
# 混合检索：向量 + BM25
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

bm25_retriever = BM25Retriever.from_documents(chunks)
vector_retriever = vector_store.as_retriever()

ensemble = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.4, 0.6]  # BM25权重40%，向量60%
)

# 针对公式/表格的精确匹配更依赖 BM25
```

### 11.4 Agent 工具封装

```python
from langchain.tools import tool

@tool
def search_pdf(query: str) -> str:
    """
    在已解析的学术论文中搜索内容。
    适用于：查找公式、表格数据、实验结果。
    """
    # 1. 向量检索
    docs = ensemble.invoke(query)
    
    # 2. 如果是表格/公式查询，增加精确匹配
    if any(kw in query.lower() for kw in ["table", "公式", "equation"]):
        docs += bm25_retriever.invoke(query)
    
    return "\n\n---\n\n".join(d.text for d in docs[:5])
```

---

## 十二、最佳实践总结

### 12.1 工具选型决策

```
你的PDF是什么类型？
├── 学术论文（双栏+公式+表格）
│   └── 首选 MinerU VLM 模式
├── 扫描件/老旧文档
│   └── SuryaOCR + MinerU Pipeline
├── 财报/合同（表格多）
│   └── MinerU + Camelot 组合
├── 简单单栏文档
│   └── PyMuPDF4LLM 或 Marker
└── 需要云服务集成
    └── LlamaParse
```

### 12.2 分块策略

| 文档类型 | 分块策略 | 块大小 |
|----------|----------|--------|
| 学术论文 | 按 section 标题分块 | 500-1000 tokens |
| 表格 | 每个表格独立成块 | 保持完整性 |
| 公式 | 公式+前后各一句 | 100-200 tokens |
| 代码 | 按函数/类分块 | 灵活 |

### 12.3 常见陷阱

1. **解析后直接全文 embedding** → 表格内容被截断，检索不到
2. **忽略公式语义** → 用户搜 `E=mc^2` 匹配不到 `$E=mc^2$`
3. **分块打乱阅读顺序** → 上下文断裂，LLM 理解困难
4. **页面头尾未去除** → 污染索引，检索噪音大
5. **图片未 OCR** → 架构图中的文字信息丢失

### 12.4 生产级 Pipeline

```python
import hashlib
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import numpy as np
from langchain.retrievers import EnsembleRetriever
from langchain.text_splitter import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore

logger = logging.getLogger(__name__)


# ── 数据模型 ──────────────────────────────────────────────

@dataclass
class ChunkMeta:
    """每个块的元数据"""
    source: str           # 源PDF路径
    page: int             # 页码
    chunk_type: str       # text / table / formula / figure
    section: str = ""     # 所属章节标题
    chunk_index: int = 0  # 块序号
    parent_id: str = ""   # 父块ID（用于小→大检索）


@dataclass
class IngestStats:
    """摄入统计"""
    total_pages: int = 0
    text_chunks: int = 0
    table_chunks: int = 0
    formula_chunks: int = 0
    figure_chunks: int = 0
    errors: list[str] = field(default_factory=list)


# ── 解析器适配层 ──────────────────────────────────────────

class PDFParser:
    """
    统一解析接口，内部可切换 MinerU / Docling / LlamaParse。
    返回结构化字典：{"markdown": str, "tables": list[dict], "figures": list[dict]}
    """

    def __init__(self, backend: str = "mineru", api_token: Optional[str] = None):
        self.backend = backend
        self.api_token = api_token

    def parse(self, pdf_path: str) -> dict:
        if self.backend == "mineru":
            return self._parse_mineru(pdf_path)
        elif self.backend == "docling":
            return self._parse_docling(pdf_path)
        elif self.backend == "llamaparse":
            return self._parse_llamaparse(pdf_path)
        else:
            raise ValueError(f"Unknown backend: {self.backend}")

    def _parse_mineru(self, pdf_path: str) -> dict:
        from magic_pdf.pipe.UNIPipe import UNIPipe
        from magic_pdf.rw.DiskReaderWriter import DiskReaderWriter

        pdf_bytes = Path(pdf_path).read_bytes()
        output_dir = Path(pdf_path).stem + "_output"
        image_writer = DiskReaderWriter(str(output_dir))

        pipe = UNIPipe(pdf_bytes, jso_useful_key={}, image_writer=image_writer)
        pipe.pipe_classify()
        pipe.pipe_analyze()
        pipe.pipe_parse()
        md_content = pipe.pipe_mk_markdown(str(output_dir / "images"))

        return {
            "markdown": md_content,
            "tables": self._extract_tables_from_md(md_content),
            "figures": self._extract_figures_from_md(md_content),
        }

    def _parse_docling(self, pdf_path: str) -> dict:
        from docling.document_converter import DocumentConverter

        converter = DocumentConverter()
        result = converter.convert(pdf_path)
        md = result.document.export_to_markdown()

        return {
            "markdown": md,
            "tables": self._extract_tables_from_md(md),
            "figures": self._extract_figures_from_md(md),
        }

    def _parse_llamaparse(self, pdf_path: str) -> dict:
        import asyncio
        from llama_parse import LlamaParse

        async def _run():
            parser = LlamaParse(api_key=self.api_token, result_type="markdown")
            docs = await parser.aload_data(pdf_path)
            return docs[0].text if docs else ""

        md = asyncio.run(_run())
        return {
            "markdown": md,
            "tables": self._extract_tables_from_md(md),
            "figures": self._extract_figures_from_md(md),
        }

    @staticmethod
    def _extract_tables_from_md(md: str) -> list[dict]:
        """从 Markdown 中提取表格块，返回 [{content, page_estimate}]"""
        tables = []
        pattern = r"(\|.+\|[\s\S]*?\n)(?=\n\n|\Z)"
        for i, m in enumerate(re.finditer(pattern, md)):
            tables.append({"content": m.group(0).strip(), "index": i})
        return tables

    @staticmethod
    def _extract_figures_from_md(md: str) -> list[dict]:
        """提取图片引用，后续可用多模态模型生成 caption"""
        figures = []
        for i, m in enumerate(re.finditer(r"!\[(.*?)\]\((.+?)\)", md)):
            figures.append({"alt": m.group(1), "path": m.group(2), "index": i})
        return figures


# ── 清理器 ────────────────────────────────────────────────

class MarkdownCleaner:
    """去除页眉页脚、多余空行、PDF 乱码"""

    HEADER_FOOTER_PATTERNS = [
        r"^\d{1,4}\s*$",                  # 纯页码
        r"^[A-Z][a-z]+ \d{1,2},? \d{4}$", # "January 1, 2024"
        r"^第[一二三四五六七八九十\d]+页$",
    ]

    @classmethod
    def clean(cls, md: str) -> str:
        lines = md.split("\n")
        cleaned = []
        prev_empty = False

        for line in lines:
            stripped = line.strip()
            # 跳过页眉页脚
            if any(re.match(p, stripped) for p in cls.HEADER_FOOTER_PATTERNS):
                continue
            # 合并连续空行
            if not stripped:
                if not prev_empty:
                    cleaned.append("")
                prev_empty = True
            else:
                cleaned.append(line)
                prev_empty = False

        return "\n".join(cleaned).strip()


# ── 智能分块器 ────────────────────────────────────────────

class SmartChunker:
    """按内容类型分离并分块，保留父子关系用于小→大检索"""

    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        # 按标题层级分块（正文）
        self.header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[("#", "h1"), ("##", "h2"), ("###", "h3")],
            strip_headers=False,
        )
        # 语义分块（兜底，处理无标题的长段落）
        self.semantic_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "。", " ", ""],
        )

    def chunk(
        self,
        parsed: dict,
        source: str,
        page_offset: int = 0,
    ) -> tuple[list[Document], list[Document], list[Document], list[Document]]:
        """
        返回 (text_docs, table_docs, formula_docs, figure_docs)
        每个 Document.metadata 包含 ChunkMeta 信息
        """
        md = parsed["markdown"]
        text_docs = self._chunk_text(md, source, page_offset)
        table_docs = self._chunk_tables(parsed.get("tables", []), source)
        formula_docs = self._chunk_formulas(md, source)
        figure_docs = self._chunk_figures(parsed.get("figures", []), source)
        return text_docs, table_docs, formula_docs, figure_docs

    def _chunk_text(self, md: str, source: str, page_offset: int) -> list[Document]:
        # 先用标题分块，剩余长段落用语义分块
        header_docs = self.header_splitter.split_text(md)
        final_docs = []
        for doc in header_docs:
            if len(doc.page_content) > 2000:
                sub_chunks = self.semantic_splitter.split_text(doc.page_content)
                for sc in sub_chunks:
                    final_docs.append(Document(
                        page_content=sc,
                        metadata={**doc.metadata, "chunk_type": "text"},
                    ))
            else:
                final_docs.append(Document(
                    page_content=doc.page_content,
                    metadata={**doc.metadata, "chunk_type": "text"},
                ))

        for i, doc in enumerate(final_docs):
            doc.metadata.update({
                "source": source,
                "chunk_index": i,
                "chunk_type": "text",
                "parent_id": self._make_parent_id(doc),
            })
        return final_docs

    def _chunk_tables(self, tables: list[dict], source: str) -> list[Document]:
        docs = []
        for i, t in enumerate(tables):
            docs.append(Document(
                page_content=f"[TABLE {i}]\n{t['content']}",
                metadata={
                    "source": source,
                    "chunk_index": i,
                    "chunk_type": "table",
                },
            ))
        return docs

    def _chunk_formulas(self, md: str, source: str) -> list[Document]:
        """提取公式块，每个公式附带前后各一句上下文"""
        formula_pattern = r"(\$\$[\s\S]*?\$\$|\$[^\$]+\$)"
        matches = list(re.finditer(formula_pattern, md))

        docs = []
        for i, m in enumerate(matches):
            start = max(0, m.start() - 200)
            end = min(len(md), m.end() + 200)
            context = md[start:end].replace("\n", " ").strip()
            docs.append(Document(
                page_content=context,
                metadata={
                    "source": source,
                    "chunk_index": i,
                    "chunk_type": "formula",
                    "formula": m.group(0),
                },
            ))
        return docs

    def _chunk_figures(self, figures: list[dict], source: str) -> list[Document]:
        """图片块：以 alt 文本作为可检索内容，后续可接入多模态 embedding"""
        docs = []
        for i, f in enumerate(figures):
            docs.append(Document(
                page_content=f"[FIGURE] {f['alt']} (path: {f['path']})",
                metadata={
                    "source": source,
                    "chunk_index": i,
                    "chunk_type": "figure",
                    "image_path": f["path"],
                },
            ))
        return docs

    @staticmethod
    def _make_parent_id(doc: Document) -> str:
        h = hashlib.md5()
        h.update(doc.page_content.encode())
        return h.hexdigest()[:12]


# ── 向量存储（多集合） ────────────────────────────────────

class MultiCollectionStore:
    """Qdrant 多集合管理：text / tables / formulas / figures"""

    def __init__(self, embedder: OpenAIEmbeddings, persist_dir: str = "./qdrant_data"):
        self.embedder = embedder
        self.collections = {
            "text": QdrantVectorStore.from_existing_collection,
            "tables": QdrantVectorStore.from_existing_collection,
            "formulas": QdrantVectorStore.from_existing_collection,
            "figures": QdrantVectorStore.from_existing_collection,
        }
        self._bm25 = {}       # BM25 索引（内存），按 collection 存储
        self._all_docs = {}   # 所有文档引用，用于重建 BM25

    def add(self, docs: list[Document], collection: str) -> None:
        if not docs:
            return
        # 向量索引
        store = QdrantVectorStore.from_documents(
            docs, self.embedder,
            collection_name=collection,
            path="./qdrant_data",
        )
        # 更新 BM25 索引
        existing = self._all_docs.get(collection, [])
        existing.extend(docs)
        self._all_docs[collection] = existing
        self._bm25[collection] = BM25Retriever.from_documents(existing)

    def hybrid_search(self, query: str, collection: str, k: int = 5) -> list[Document]:
        """向量 + BM25 混合检索"""
        vector_store = QdrantVectorStore.from_existing_collection(
            self.embedder, collection_name=collection, path="./qdrant_data",
        )
        vector_retriever = vector_store.as_retriever(search_kwargs={"k": k})
        bm25_retriever = self._bm25.get(collection)

        if not bm25_retriever:
            return vector_retriever.invoke(query)

        ensemble = EnsembleRetriever(
            retrievers=[bm25_retriever, vector_retriever],
            weights=[0.3, 0.7],
        )
        return ensemble.invoke(query)

    def search_across_collections(self, query: str, k: int = 5) -> list[Document]:
        """跨集合检索 + 类型自适应权重"""
        results = []
        # 根据查询类型调整各集合的检索数量
        if any(kw in query.lower() for kw in ["table", "表格", "表"]):
            coll_ks = {"tables": k, "text": k // 2, "formulas": k // 2}
        elif any(kw in query.lower() for kw in ["公式", "equation", "latex"]):
            coll_ks = {"formulas": k, "text": k // 2, "tables": k // 2}
        else:
            coll_ks = {"text": k, "tables": k // 2, "formulas": k // 2}

        for coll, ck in coll_ks.items():
            if ck > 0:
                try:
                    results.extend(self.hybrid_search(query, coll, ck))
                except Exception:
                    logger.warning(f"Collection '{coll}' not found, skipping")

        return results


# ── 重排序器 ──────────────────────────────────────────────

class Reranker:
    """轻量 Cross-Encoder 重排序，可使用 BGE-Reranker 或 Cohere"""

    def __init__(self, model_name: str = "BAAI/bge-reranker-base"):
        from FlagEmbedding import FlagReranker
        self.model = FlagReranker(model_name, use_fp16=True)

    def rerank(self, query: str, docs: list[Document], top_k: int = 5) -> list[Document]:
        if not docs:
            return []
        pairs = [[query, d.page_content] for d in docs]
        scores = self.model.compute_score(pairs)
        # 按分数降序排列
        ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
        return [d for d, _ in ranked[:top_k]]


# ── 主 Pipeline ───────────────────────────────────────────

class PDFRAGPipeline:
    """
    生产级复杂 PDF RAG Pipeline。

    使用示例:
        pipeline = PDFRAGPipeline(parser_backend="mineru")
        stats = pipeline.ingest("paper.pdf")
        results = pipeline.search("Transformer 的注意力公式是什么？")
    """

    def __init__(
        self,
        parser_backend: str = "mineru",
        parser_token: Optional[str] = None,
        embedder_model: str = "text-embedding-3-small",
        reranker_model: str = "BAAI/bge-reranker-base",
        chunk_size: int = 800,
        chunk_overlap: int = 150,
    ):
        self.parser = PDFParser(backend=parser_backend, api_token=parser_token)
        self.cleaner = MarkdownCleaner()
        self.chunker = SmartChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        self.embedder = OpenAIEmbeddings(model=embedder_model)
        self.store = MultiCollectionStore(self.embedder)
        self.reranker = Reranker(model_name=reranker_model)

        # 已摄入文件的哈希缓存，避免重复解析
        self._ingested: dict[str, str] = {}

    # ── 摄入 ──────────────────────────────────────────────

    def ingest(self, pdf_path: str) -> IngestStats:
        """摄入单个 PDF，返回统计信息"""
        stats = IngestStats()
        source = Path(pdf_path).name

        # 检查文件哈希，跳过已摄入
        file_hash = self._hash_file(pdf_path)
        if source in self._ingested and self._ingested[source] == file_hash:
            logger.info(f"Skipping {source} (unchanged)")
            return stats

        try:
            # 1. 解析
            parsed = self.parser.parse(pdf_path)
            # 2. 清理
            parsed["markdown"] = self.cleaner.clean(parsed["markdown"])
            # 3. 分块
            text_docs, table_docs, formula_docs, figure_docs = self.chunker.chunk(
                parsed, source
            )
            # 4. 分别索引
            self.store.add(text_docs, "text")
            self.store.add(table_docs, "tables")
            self.store.add(formula_docs, "formulas")
            self.store.add(figure_docs, "figures")

            # 记录统计
            stats.text_chunks = len(text_docs)
            stats.table_chunks = len(table_docs)
            stats.formula_chunks = len(formula_docs)
            stats.figure_chunks = len(figure_docs)

            self._ingested[source] = file_hash
            logger.info(
                f"Ingested {source}: {stats.text_chunks} text, "
                f"{stats.table_chunks} tables, {stats.formula_chunks} formulas, "
                f"{stats.figure_chunks} figures"
            )
        except Exception as e:
            stats.errors.append(str(e))
            logger.error(f"Failed to ingest {source}: {e}")

        return stats

    def ingest_batch(self, pdf_paths: list[str]) -> dict[str, IngestStats]:
        """批量摄入"""
        all_stats = {}
        for path in pdf_paths:
            all_stats[path] = self.ingest(path)
        return all_stats

    # ── 检索 ──────────────────────────────────────────────

    def search(self, query: str, top_k: int = 5) -> list[Document]:
        """检索 + 重排序，返回最终结果"""
        # 跨集合混合检索
        candidates = self.store.search_across_collections(query, k=top_k * 3)
        # 重排序
        if len(candidates) <= top_k:
            return candidates
        return self.reranker.rerank(query, candidates, top_k)

    def search_with_parents(self, query: str, top_k: int = 5) -> list[Document]:
        """
        小→大检索：先用小块检索，再返回父块（更大上下文）。
        适用于需要完整段落的场景。
        """
        hits = self.search(query, top_k)
        parent_ids = set()
        parent_docs = []
        for doc in hits:
            pid = doc.metadata.get("parent_id")
            if pid and pid not in parent_ids:
                parent_ids.add(pid)
                # 从 text 集合中检索父块
                parent_docs.append(Document(
                    page_content=doc.metadata.get("section", "") + "\n" + doc.page_content,
                    metadata=doc.metadata,
                ))
        return parent_docs if parent_docs else hits

    # ── 工具方法 ──────────────────────────────────────────

    def get_stats(self) -> dict:
        """获取当前索引统计"""
        return {
            "ingested_files": len(self._ingested),
            "total_chunks": sum(len(docs) for docs in self.store._all_docs.values()),
        }

    def clear(self) -> None:
        """清空所有索引"""
        import shutil
        shutil.rmtree("./qdrant_data", ignore_errors=True)
        self._ingested.clear()
        self.store._bm25.clear()
        self.store._all_docs.clear()

    @staticmethod
    def _hash_file(path: str) -> str:
        h = hashlib.md5()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
```

---

## 十三、参考资源

- [MinerU GitHub](https://github.com/opendatalab/MinerU)
- [Docling GitHub](https://github.com/DS4SD/docling)
- [OmniDocBench](https://github.com/opendatalab/OmniDocBench)
- [LlamaParse 文档](https://docs.llamaindex.ai/en/stable/llama_cloud/llama_parse/)
- [Marker GitHub](https://github.com/VikParuchuri/marker)
- [SuryaOCR GitHub](https://github.com/VikParuchuri/surya)