# Qt 框架教程

## 1. Qt 概述

Qt 是一个跨平台的 C++ 应用程序开发框架，广泛用于开发 GUI 程序和命令行工具。

### 1.1 核心特性

| 特性 | 说明 |
|------|------|
| 跨平台 | 支持 Windows、macOS、Linux、Android、iOS |
| 信号槽机制 | 类型安全的事件通信机制 |
| 元对象系统 | 运行时类型信息和动态属性系统 |
| 丰富的模块 | GUI、网络、数据库、XML、多线程等 |
| Qt Creator | 集成开发环境 |
| QML/Qt Quick | 声明式 UI 开发 |

### 1.2 Qt 模块分类

**Qt 基础模块**：
- Qt Core：核心非 GUI 功能（事件循环、信号槽、文件 I/O）
- Qt GUI：GUI 基础组件（窗口、图像、OpenGL）
- Qt Widgets：桌面 UI 控件
- Qt Network：网络编程（TCP/UDP/HTTP）
- Qt SQL：数据库访问
- Qt Concurrent：高级并发 API
- Qt XML：XML 处理

**Qt 扩展模块**：
- Qt Quick/QML：声明式 UI
- Qt WebEngine：嵌入式浏览器
- Qt 3D：3D 图形
- Qt Bluetooth：蓝牙
- Qt Multimedia：音视频

### 1.3 安装

```bash
# macOS
brew install qt

# Ubuntu
sudo apt install qt6-base-dev qt6-tools-dev

# 使用在线安装器（推荐）
# https://www.qt.io/download
```

## 2. Qt 基础

### 2.1 第一个 Qt 程序

```cpp
#include <QApplication>
#include <QLabel>

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    QLabel label("Hello, Qt!");
    label.setAlignment(Qt::AlignCenter);
    label.resize(400, 300);
    label.show();

    return app.exec();
}
```

**CMakeLists.txt**:
```cmake
cmake_minimum_required(VERSION 3.16)
project(HelloQt)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 REQUIRED COMPONENTS Core Widgets)

add_executable(HelloQt main.cpp)
target_link_libraries(HelloQt PRIVATE Qt6::Core Qt6::Widgets)
```

### 2.2 信号与槽

信号槽是 Qt 的核心通信机制，实现对象间的松耦合通信。

```cpp
#include <QApplication>
#include <QPushButton>
#include <QLabel>
#include <QVBoxLayout>
#include <QWidget>

class Counter : public QWidget {
    Q_OBJECT

public:
    Counter(QWidget *parent = nullptr) : QWidget(parent), m_count(0) {
        auto *layout = new QVBoxLayout(this);

        m_label = new QLabel("Count: 0");
        m_label->setAlignment(Qt::AlignCenter);

        auto *button = new QPushButton("Click Me");

        layout->addWidget(m_label);
        layout->addWidget(button);

        connect(button, &QPushButton::clicked, this, &Counter::increment);
    }

private slots:
    void increment() {
        m_count++;
        m_label->setText(QString("Count: %1").arg(m_count));
    }

private:
    QLabel *m_label;
    int m_count;
};

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    Counter counter;
    counter.resize(300, 200);
    counter.show();
    return app.exec();
}
```

### 2.3 信号槽连接方式

```cpp
// 方式1：函数指针（推荐，编译时类型检查）
connect(sender, &Sender::valueChanged, receiver, &Receiver::onValueChanged);

// 方式2：Lambda 表达式
connect(button, &QPushButton::clicked, this, [this]() {
    m_label->setText("Button clicked!");
});

// 方式3：functor
connect(button, &QPushButton::clicked, std::bind(&MyClass::handleClick, this));

// 自定义信号
class MySender : public QObject {
    Q_OBJECT
signals:
    void dataReady(const QString &data);
};

// 发射信号
emit dataReady("Hello");
```

### 2.4 自定义信号槽

```cpp
class TemperatureSensor : public QObject {
    Q_OBJECT

public:
    explicit TemperatureSensor(QObject *parent = nullptr) : QObject(parent) {}

    void updateTemperature(double temp) {
        if (qAbs(m_temperature - temp) > 0.1) {
            m_temperature = temp;
            emit temperatureChanged(temp);

            if (temp > 30.0) {
                emit highTemperatureWarning(temp);
            }
        }
    }

signals:
    void temperatureChanged(double temperature);
    void highTemperatureWarning(double temperature);

private:
    double m_temperature = 0.0;
};

class TemperatureDisplay : public QWidget {
    Q_OBJECT

public:
    explicit TemperatureDisplay(QWidget *parent = nullptr) : QWidget(parent) {
        m_label = new QLabel("Temperature: --");
        m_label->setAlignment(Qt::AlignCenter);
        auto *layout = new QVBoxLayout(this);
        layout->addWidget(m_label);
    }

public slots:
    void onTemperatureChanged(double temp) {
        m_label->setText(QString("Temperature: %1°C").arg(temp, 0, 'f', 1));
    }

    void onHighTemperatureWarning(double temp) {
        m_label->setStyleSheet("color: red; font-weight: bold;");
        m_label->setText(QString("WARNING: %1°C").arg(temp, 0, 'f', 1));
    }

private:
    QLabel *m_label;
};

// 连接
TemperatureSensor sensor;
TemperatureDisplay display;
connect(&sensor, &TemperatureSensor::temperatureChanged,
        &display, &TemperatureDisplay::onTemperatureChanged);
connect(&sensor, &TemperatureSensor::highTemperatureWarning,
        &display, &TemperatureDisplay::onHighTemperatureWarning);
```

## 3. 常用控件

### 3.1 基础控件

```cpp
#include <QApplication>
#include <QWidget>
#include <QPushButton>
#include <QLabel>
#include <QLineEdit>
#include <QCheckBox>
#include <QRadioButton>
#include <QComboBox>
#include <QSpinBox>
#include <QSlider>
#include <QVBoxLayout>
#include <QGroupBox>
#include <QFormLayout>

class WidgetDemo : public QWidget {
    Q_OBJECT

public:
    WidgetDemo(QWidget *parent = nullptr) : QWidget(parent) {
        auto *mainLayout = new QVBoxLayout(this);

        auto *label = new QLabel("这是一个标签");
        label->setStyleSheet("font-size: 16px; color: #333;");

        auto *lineEdit = new QLineEdit;
        lineEdit->setPlaceholderText("请输入文本...");

        auto *button = new QPushButton("点击我");
        connect(button, &QPushButton::clicked, this, [this, lineEdit]() {
            QMessageBox::information(this, "提示", "你输入了: " + lineEdit->text());
        });

        auto *checkbox = new QCheckBox("同意条款");
        auto *radio1 = new QRadioButton("选项 A");
        auto *radio2 = new QRadioButton("选项 B");

        auto *comboBox = new QComboBox;
        comboBox->addItems({"Python", "C++", "Go", "Rust"});

        auto *spinBox = new QSpinBox;
        spinBox->setRange(0, 100);
        spinBox->setValue(50);

        auto *slider = new QSlider(Qt::Horizontal);
        slider->setRange(0, 100);
        connect(slider, &QSlider::valueChanged, spinBox, &QSpinBox::setValue);
        connect(spinBox, QOverload<int>::of(&QSpinBox::valueChanged),
                slider, &QSlider::setValue);

        mainLayout->addWidget(label);
        mainLayout->addWidget(lineEdit);
        mainLayout->addWidget(button);
        mainLayout->addWidget(checkbox);
        mainLayout->addWidget(radio1);
        mainLayout->addWidget(radio2);
        mainLayout->addWidget(comboBox);
        mainLayout->addWidget(spinBox);
        mainLayout->addWidget(slider);
    }
};
```

### 3.2 布局管理

```cpp
// 水平布局
auto *hLayout = new QHBoxLayout;
hLayout->addWidget(button1);
hLayout->addWidget(button2);
hLayout->addStretch();

// 垂直布局
auto *vLayout = new QVBoxLayout;
vLayout->addWidget(label1);
vLayout->addWidget(label2);
vLayout->addStretch();

// 网格布局
auto *gridLayout = new QGridLayout;
gridLayout->addWidget(new QLabel("用户名:"), 0, 0);
gridLayout->addWidget(new QLineEdit, 0, 1);
gridLayout->addWidget(new QLabel("密码:"), 1, 0);
gridLayout->addWidget(new QLineEdit, 1, 1);

// 表单布局
auto *formLayout = new QFormLayout;
formLayout->addRow("姓名:", new QLineEdit);
formLayout->addRow("年龄:", new QSpinBox);
formLayout->addRow("邮箱:", new QLineEdit);

// 嵌套布局
auto *mainLayout = new QVBoxLayout;
auto *topLayout = new QHBoxLayout;
topLayout->addWidget(new QLabel("Top Left"));
topLayout->addWidget(new QLabel("Top Right"));
mainLayout->addLayout(topLayout);
mainLayout->addWidget(new QLabel("Bottom"));

// 设置间距和边距
layout->setSpacing(10);
layout->setContentsMargins(20, 20, 20, 20);
```

### 3.3 列表和表格

```cpp
// QListWidget
auto *listWidget = new QListWidget;
listWidget->addItem("Item 1");
listWidget->addItem("Item 2");
listWidget->addItem("Item 3");

QListWidgetItem *item = new QListWidgetItem("Custom Item");
item->setIcon(QIcon::fromTheme("document-new"));
item->setToolTip("这是一个自定义项");
listWidget->addItem(item);

connect(listWidget, &QListWidget::itemClicked,
        [](QListWidgetItem *item) {
    qDebug() << "Clicked:" << item->text();
});

// QTableWidget
auto *tableWidget = new QTableWidget(5, 3);
tableWidget->setHorizontalHeaderLabels({"姓名", "年龄", "城市"});

tableWidget->setItem(0, 0, new QTableWidgetItem("张三"));
tableWidget->setItem(0, 1, new QTableWidgetItem("25"));
tableWidget->setItem(0, 2, new QTableWidgetItem("北京"));

tableWidget->setAlternatingRowColors(true);
tableWidget->setSelectionBehavior(QAbstractItemView::SelectRows);
tableWidget->setEditTriggers(QAbstractItemView::DoubleClicked);

// QTreeWidget
auto *treeWidget = new QTreeWidget;
treeWidget->setHeaderLabels({"名称", "类型", "大小"});

QTreeWidgetItem *root = new QTreeWidgetItem(treeWidget, {"项目根目录", "文件夹", "-"});
QTreeWidgetItem *file1 = new QTreeWidgetItem(root, {"main.cpp", "C++", "2KB"});
QTreeWidgetItem *file2 = new QTreeWidgetItem(root, {"CMakeLists.txt", "CMake", "1KB"});
QTreeWidgetItem *subDir = new QTreeWidgetItem(root, {"src", "文件夹", "-"});
QTreeWidgetItem *file3 = new QTreeWidgetItem(subDir, {"widget.cpp", "C++", "5KB"});

treeWidget->expandAll();
```

## 4. 主窗口框架

### 4.1 QMainWindow

```cpp
#include <QMainWindow>
#include <QMenuBar>
#include <QToolBar>
#include <QStatusBar>
#include <QDockWidget>
#include <QTextEdit>
#include <QFileDialog>
#include <QMessageBox>

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr) : QMainWindow(parent) {
        setWindowTitle("Qt 主窗口示例");
        resize(800, 600);

        setupMenuBar();
        setupToolBar();
        setupStatusBar();
        setupCentralWidget();
        setupDockWidgets();
    }

private:
    void setupMenuBar() {
        auto *fileMenu = menuBar()->addMenu("文件(&F)");

        auto *newAction = fileMenu->addAction("新建(&N)");
        newAction->setShortcut(QKeySequence::New);
        connect(newAction, &QAction::triggered, this, &MainWindow::newFile);

        auto *openAction = fileMenu->addAction("打开(&O)");
        openAction->setShortcut(QKeySequence::Open);
        connect(openAction, &QAction::triggered, this, &MainWindow::openFile);

        fileMenu->addSeparator();

        auto *saveAction = fileMenu->addAction("保存(&S)");
        saveAction->setShortcut(QKeySequence::Save);
        connect(saveAction, &QAction::triggered, this, &MainWindow::saveFile);

        fileMenu->addSeparator();

        auto *exitAction = fileMenu->addAction("退出(&Q)");
        exitAction->setShortcut(QKeySequence::Quit);
        connect(exitAction, &QAction::triggered, this, &QWidget::close);

        auto *editMenu = menuBar()->addMenu("编辑(&E)");
        editMenu->addAction("撤销(&U)", this, [this]() {
            m_textEdit->undo();
        }, QKeySequence::Undo);

        editMenu->addAction("重做(&R)", this, [this]() {
            m_textEdit->redo();
        }, QKeySequence::Redo);

        auto *helpMenu = menuBar()->addMenu("帮助(&H)");
        helpMenu->addAction("关于(&A)", this, &MainWindow::about);
    }

    void setupToolBar() {
        auto *toolbar = addToolBar("主工具栏");
        toolbar->setIconSize(QSize(24, 24));

        toolbar->addAction(QIcon::fromTheme("document-new"), "新建", this, &MainWindow::newFile);
        toolbar->addAction(QIcon::fromTheme("document-open"), "打开", this, &MainWindow::openFile);
        toolbar->addAction(QIcon::fromTheme("document-save"), "保存", this, &MainWindow::saveFile);
        toolbar->addSeparator();
        toolbar->addAction(QIcon::fromTheme("edit-undo"), "撤销", this, [this]() {
            m_textEdit->undo();
        });
    }

    void setupStatusBar() {
        statusBar()->showMessage("就绪");
    }

    void setupCentralWidget() {
        m_textEdit = new QTextEdit;
        setCentralWidget(m_textEdit);

        connect(m_textEdit, &QTextEdit::textChanged, this, [this]() {
            statusBar()->showMessage("文档已修改");
        });
    }

    void setupDockWidgets() {
        auto *dock = new QDockWidget("文件浏览器", this);
        dock->setAllowedAreas(Qt::LeftDockWidgetArea | Qt::RightDockWidgetArea);

        auto *treeWidget = new QTreeWidget(dock);
        treeWidget->setHeaderLabels({"文件"});
        dock->setWidget(treeWidget);

        addDockWidget(Qt::LeftDockWidgetArea, dock);
    }

private slots:
    void newFile() {
        if (m_textEdit->document()->isModified()) {
            auto ret = QMessageBox::question(this, "新建文件",
                "当前文档已修改，是否保存？",
                QMessageBox::Save | QMessageBox::Discard | QMessageBox::Cancel);
            if (ret == QMessageBox::Cancel) return;
            if (ret == QMessageBox::Save) saveFile();
        }
        m_textEdit->clear();
        statusBar()->showMessage("新文件已创建");
    }

    void openFile() {
        QString fileName = QFileDialog::getOpenFileName(this,
            "打开文件", "", "文本文件 (*.txt *.cpp *.h);;所有文件 (*)");
        if (!fileName.isEmpty()) {
            QFile file(fileName);
            if (file.open(QIODevice::ReadOnly | QIODevice::Text)) {
                m_textEdit->setText(file.readAll());
                statusBar()->showMessage("已打开: " + fileName);
            }
        }
    }

    void saveFile() {
        QString fileName = QFileDialog::getSaveFileName(this,
            "保存文件", "", "文本文件 (*.txt);;所有文件 (*)");
        if (!fileName.isEmpty()) {
            QFile file(fileName);
            if (file.open(QIODevice::WriteOnly | QIODevice::Text)) {
                file.write(m_textEdit->toPlainText().toUtf8());
                statusBar()->showMessage("已保存: " + fileName);
            }
        }
    }

    void about() {
        QMessageBox::about(this, "关于", "Qt 主窗口示例 v1.0");
    }

private:
    QTextEdit *m_textEdit;
};
```

## 5. 事件系统

### 5.1 事件处理

```cpp
class CustomWidget : public QWidget {
    Q_OBJECT

protected:
    void mousePressEvent(QMouseEvent *event) override {
        if (event->button() == Qt::LeftButton) {
            qDebug() << "Left click at:" << event->pos();
        } else if (event->button() == Qt::RightButton) {
            qDebug() << "Right click at:" << event->pos();
        }
    }

    void mouseMoveEvent(QMouseEvent *event) override {
        qDebug() << "Mouse move:" << event->pos();
    }

    void mouseReleaseEvent(QMouseEvent *event) override {
        qDebug() << "Mouse release:" << event->pos();
    }

    void keyPressEvent(QKeyEvent *event) override {
        switch (event->key()) {
        case Qt::Key_Escape:
            close();
            break;
        case Qt::Key_Space:
            qDebug() << "Space pressed";
            break;
        default:
            QWidget::keyPressEvent(event);
        }
    }

    void wheelEvent(QWheelEvent *event) override {
        qDebug() << "Scroll:" << event->angleDelta();
    }

    void resizeEvent(QResizeEvent *event) override {
        qDebug() << "Resized to:" << event->size();
    }

    void paintEvent(QPaintEvent *event) override {
        QPainter painter(this);
        painter.setRenderHint(QPainter::Antialiasing);

        painter.fillRect(rect(), Qt::white);
        painter.setPen(QPen(Qt::blue, 2));
        painter.drawEllipse(50, 50, 200, 200);
    }

    void dragEnterEvent(QDragEnterEvent *event) override {
        if (event->mimeData()->hasUrls()) {
            event->acceptProposedAction();
        }
    }

    void dropEvent(QDropEvent *event) override {
        for (const auto &url : event->mimeData()->urls()) {
            qDebug() << "Dropped file:" << url.toLocalFile();
        }
    }
};
```

### 5.2 事件过滤器

```cpp
class EventFilterDemo : public QWidget {
    Q_OBJECT

public:
    EventFilterDemo(QWidget *parent = nullptr) : QWidget(parent) {
        auto *lineEdit = new QLineEdit(this);
        lineEdit->installEventFilter(this);
    }

protected:
    bool eventFilter(QObject *watched, QEvent *event) override {
        if (event->type() == QEvent::KeyPress) {
            auto *keyEvent = static_cast<QKeyEvent *>(event);
            if (keyEvent->key() == Qt::Key_Return) {
                qDebug() << "Enter pressed in line edit";
                return true;
            }
        }
        return QWidget::eventFilter(watched, event);
    }
};
```

### 5.3 自定义事件

```cpp
class CustomEvent : public QEvent {
public:
    static const QEvent::Type CustomEventType =
        static_cast<QEvent::Type>(QEvent::User + 1);

    CustomEvent(const QString &message)
        : QEvent(CustomEventType), m_message(message) {}

    QString message() const { return m_message; }

private:
    QString m_message;
};

class CustomWidget : public QWidget {
    Q_OBJECT

protected:
    void customEvent(QEvent *event) override {
        if (event->type() == CustomEvent::CustomEventType) {
            auto *customEvent = static_cast<CustomEvent *>(event);
            qDebug() << "Custom event:" << customEvent->message();
        }
    }
};

// 发送自定义事件
QCoreApplication::postEvent(widget, new CustomEvent("Hello from custom event"));
```

## 6. 绘图系统

### 6.1 QPainter 基础

```cpp
class PaintWidget : public QWidget {
    Q_OBJECT

protected:
    void paintEvent(QPaintEvent *) override {
        QPainter painter(this);
        painter.setRenderHint(QPainter::Antialiasing);

        painter.fillRect(rect(), QColor("#f0f0f0"));

        painter.setPen(QPen(Qt::darkBlue, 3));
        painter.setBrush(QBrush(Qt::blue, Qt::DiagCrossPattern));
        painter.drawRect(20, 20, 200, 150);

        painter.setBrush(Qt::green);
        painter.drawEllipse(250, 20, 150, 150);

        painter.setPen(QPen(Qt::red, 2, Qt::DashLine));
        painter.drawLine(20, 200, 400, 200);

        QFont font("Arial", 24, QFont::Bold);
        painter.setFont(font);
        painter.setPen(Qt::black);
        painter.drawText(20, 260, "Hello, QPainter!");

        QLinearGradient gradient(20, 280, 400, 380);
        gradient.setColorAt(0, Qt::red);
        gradient.setColorAt(0.5, Qt::yellow);
        gradient.setColorAt(1, Qt::green);
        painter.setBrush(gradient);
        painter.setPen(Qt::NoPen);
        painter.drawRoundedRect(20, 280, 380, 100, 10, 10);
    }
};
```

### 6.2 双缓冲绘图

```cpp
class DoubleBufferWidget : public QWidget {
    Q_OBJECT

public:
    DoubleBufferWidget(QWidget *parent = nullptr) : QWidget(parent) {
        m_pixmap = QPixmap(size());
        m_pixmap.fill(Qt::white);
    }

protected:
    void paintEvent(QPaintEvent *) override {
        QPainter painter(this);
        painter.drawPixmap(0, 0, m_pixmap);
    }

    void mousePressEvent(QMouseEvent *event) override {
        m_lastPoint = event->pos();
    }

    void mouseMoveEvent(QMouseEvent *event) override {
        if (event->buttons() & Qt::LeftButton) {
            QPainter painter(&m_pixmap);
            painter.setPen(QPen(Qt::black, 2));
            painter.drawLine(m_lastPoint, event->pos());
            m_lastPoint = event->pos();
            update();
        }
    }

    void resizeEvent(QResizeEvent *event) override {
        QPixmap newPixmap(event->size());
        newPixmap.fill(Qt::white);
        QPainter painter(&newPixmap);
        painter.drawPixmap(0, 0, m_pixmap);
        m_pixmap = newPixmap;
    }

private:
    QPixmap m_pixmap;
    QPoint m_lastPoint;
};
```

## 7. 多线程

### 7.1 QThread 基本用法

```cpp
class Worker : public QObject {
    Q_OBJECT

public:
    explicit Worker(int taskId) : m_taskId(taskId) {}

public slots:
    void doWork() {
        for (int i = 0; i <= 100; i++) {
            QThread::msleep(50);
            emit progressChanged(i);

            if (QThread::currentThread()->isInterruptionRequested()) {
                emit finished(false);
                return;
            }
        }
        emit finished(true);
    }

signals:
    void progressChanged(int percent);
    void finished(bool success);

private:
    int m_taskId;
};

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr) : QMainWindow(parent) {
        auto *button = new QPushButton("Start Task");
        m_progressBar = new QProgressBar;

        auto *layout = new QVBoxLayout;
        layout->addWidget(button);
        layout->addWidget(m_progressBar);

        auto *central = new QWidget;
        central->setLayout(layout);
        setCentralWidget(central);

        connect(button, &QPushButton::clicked, this, &MainWindow::startTask);
    }

private slots:
    void startTask() {
        auto *worker = new Worker(1);
        auto *thread = new QThread;

        worker->moveToThread(thread);

        connect(thread, &QThread::started, worker, &Worker::doWork);
        connect(worker, &Worker::progressChanged, this, [this](int value) {
            m_progressBar->setValue(value);
        });
        connect(worker, &Worker::finished, this, [](bool success) {
            qDebug() << "Task finished:" << (success ? "success" : "cancelled");
        });
        connect(worker, &Worker::finished, thread, &QThread::quit);
        connect(thread, &QThread::finished, worker, &QObject::deleteLater);
        connect(thread, &QThread::finished, thread, &QObject::deleteLater);

        thread->start();
    }

private:
    QProgressBar *m_progressBar;
};
```

### 7.2 Qt Concurrent

```cpp
#include <QtConcurrent>
#include <QFutureWatcher>

void concurrentDemo() {
    QList<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

    QFuture<int> future = QtConcurrent::mapped(numbers, [](int n) -> int {
        QThread::msleep(100);
        return n * n;
    });

    future.waitForFinished();

    for (int result : future.results()) {
        qDebug() << result;
    }
}

// 使用 QFutureWatcher 监控异步任务
class AsyncProcessor : public QObject {
    Q_OBJECT

public:
    void startProcessing() {
        auto *watcher = new QFutureWatcher<int>(this);

        connect(watcher, &QFutureWatcher<int>::finished, this, [this, watcher]() {
            qDebug() << "All results:" << watcher->results();
            watcher->deleteLater();
        });

        connect(watcher, &QFutureWatcher<int>::resultReadyAt, this,
                [](int index) {
            qDebug() << "Result" << index << "ready";
        });

        QList<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        QFuture<int> future = QtConcurrent::mapped(data, [](int n) {
            return n * n;
        });

        watcher->setFuture(future);
    }
};
```

### 7.3 线程安全：QMutex 和 QReadWriteLock

```cpp
class ThreadSafeCounter {
public:
    void increment() {
        QMutexLocker locker(&m_mutex);
        m_value++;
    }

    int value() const {
        QMutexLocker locker(&m_mutex);
        return m_value;
    }

private:
    mutable QMutex m_mutex;
    int m_value = 0;
};

class ThreadSafeCache {
public:
    QVariant get(const QString &key) const {
        QReadLocker locker(&m_lock);
        return m_cache.value(key);
    }

    void set(const QString &key, const QVariant &value) {
        QWriteLocker locker(&m_lock);
        m_cache[key] = value;
    }

    bool contains(const QString &key) const {
        QReadLocker locker(&m_lock);
        return m_cache.contains(key);
    }

private:
    mutable QReadWriteLock m_lock;
    QMap<QString, QVariant> m_cache;
};
```

## 8. 文件与数据

### 8.1 文件读写

```cpp
void fileOperations() {
    // 文本文件读写
    {
        QFile file("data.txt");
        if (file.open(QIODevice::WriteOnly | QIODevice::Text)) {
            QTextStream out(&file);
            out << "Hello, Qt File I/O!" << Qt::endl;
            out << "Second line" << Qt::endl;
        }
    }

    {
        QFile file("data.txt");
        if (file.open(QIODevice::ReadOnly | QIODevice::Text)) {
            QTextStream in(&file);
            while (!in.atEnd()) {
                QString line = in.readLine();
                qDebug() << line;
            }
        }
    }

    // 二进制文件
    {
        QFile file("data.bin");
        if (file.open(QIODevice::WriteOnly)) {
            QDataStream out(&file);
            out << QString("Hello");
            out << 42;
            out << 3.14;
            out << QList<int>{1, 2, 3, 4, 5};
        }
    }

    {
        QFile file("data.bin");
        if (file.open(QIODevice::ReadOnly)) {
            QDataStream in(&file);
            QString str;
            int num;
            double pi;
            QList<int> list;
            in >> str >> num >> pi >> list;
        }
    }
}
```

### 8.2 JSON 处理

```cpp
void jsonOperations() {
    QJsonObject config;
    config["appName"] = "MyApp";
    config["version"] = "1.0.0";
    config["debug"] = true;

    QJsonObject database;
    database["host"] = "localhost";
    database["port"] = 3306;
    config["database"] = database;

    QJsonArray features;
    features.append("feature1");
    features.append("feature2");
    config["features"] = features;

    QJsonDocument doc(config);
    QByteArray jsonData = doc.toJson(QJsonDocument::Indented);

    QFile file("config.json");
    if (file.open(QIODevice::WriteOnly)) {
        file.write(jsonData);
    }

    // 读取 JSON
    if (file.open(QIODevice::ReadOnly)) {
        QJsonDocument readDoc = QJsonDocument::fromJson(file.readAll());
        QJsonObject obj = readDoc.object();
        QString appName = obj["appName"].toString();
        int port = obj["database"].toObject()["port"].toInt();
    }
}
```

### 8.3 数据库操作

```cpp
#include <QSqlDatabase>
#include <QSqlQuery>
#include <QSqlError>

void databaseOperations() {
    QSqlDatabase db = QSqlDatabase::addDatabase("QSQLITE");
    db.setDatabaseName("mydb.sqlite");

    if (!db.open()) {
        qDebug() << "Database error:" << db.lastError().text();
        return;
    }

    QSqlQuery query;
    query.exec("CREATE TABLE IF NOT EXISTS users ("
               "id INTEGER PRIMARY KEY AUTOINCREMENT, "
               "name TEXT NOT NULL, "
               "email TEXT UNIQUE, "
               "age INTEGER)");

    query.prepare("INSERT INTO users (name, email, age) VALUES (?, ?, ?)");
    query.addBindValue("张三");
    query.addBindValue("zhangsan@example.com");
    query.addBindValue(25);
    if (!query.exec()) {
        qDebug() << "Insert error:" << query.lastError().text();
    }

    query.prepare("SELECT * FROM users WHERE age > ?");
    query.addBindValue(20);
    if (query.exec()) {
        while (query.next()) {
            int id = query.value(0).toInt();
            QString name = query.value(1).toString();
            QString email = query.value(2).toString();
            int age = query.value(3).toInt();
            qDebug() << id << name << email << age;
        }
    }

    query.prepare("UPDATE users SET age = ? WHERE name = ?");
    query.addBindValue(26);
    query.addBindValue("张三");
    query.exec();

    query.prepare("DELETE FROM users WHERE id = ?");
    query.addBindValue(1);
    query.exec();
}
```

## 9. 网络编程

### 9.1 HTTP 请求

```cpp
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>

class HttpClient : public QObject {
    Q_OBJECT

public:
    HttpClient(QObject *parent = nullptr) : QObject(parent) {
        m_manager = new QNetworkAccessManager(this);
    }

    void get(const QUrl &url) {
        QNetworkRequest request(url);
        QNetworkReply *reply = m_manager->get(request);

        connect(reply, &QNetworkReply::finished, this, [reply]() {
            if (reply->error() == QNetworkReply::NoError) {
                QByteArray data = reply->readAll();
                qDebug() << "Response:" << data;
            } else {
                qDebug() << "Error:" << reply->errorString();
            }
            reply->deleteLater();
        });
    }

    void post(const QUrl &url, const QJsonObject &json) {
        QNetworkRequest request(url);
        request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

        QJsonDocument doc(json);
        QNetworkReply *reply = m_manager->post(request, doc.toJson());

        connect(reply, &QNetworkReply::finished, this, [reply]() {
            if (reply->error() == QNetworkReply::NoError) {
                qDebug() << "POST response:" << reply->readAll();
            } else {
                qDebug() << "POST error:" << reply->errorString();
            }
            reply->deleteLater();
        });
    }

    void downloadFile(const QUrl &url, const QString &savePath) {
        QNetworkRequest request(url);
        QNetworkReply *reply = m_manager->get(request);

        QFile *file = new QFile(savePath);
        file->open(QIODevice::WriteOnly);

        connect(reply, &QNetworkReply::readyRead, this, [reply, file]() {
            file->write(reply->readAll());
        });

        connect(reply, &QNetworkReply::downloadProgress,
                [](qint64 received, qint64 total) {
            qDebug() << "Progress:" << received << "/" << total;
        });

        connect(reply, &QNetworkReply::finished, this, [reply, file]() {
            file->close();
            file->deleteLater();
            reply->deleteLater();
            qDebug() << "Download completed";
        });
    }

private:
    QNetworkAccessManager *m_manager;
};
```

### 9.2 TCP 服务器

```cpp
class TcpServer : public QObject {
    Q_OBJECT

public:
    TcpServer(QObject *parent = nullptr) : QObject(parent) {
        m_server = new QTcpServer(this);

        connect(m_server, &QTcpServer::newConnection, this, [this]() {
            QTcpSocket *client = m_server->nextPendingConnection();
            qDebug() << "New connection from:" << client->peerAddress();

            connect(client, &QTcpSocket::readyRead, this, [client]() {
                QByteArray data = client->readAll();
                qDebug() << "Received:" << data;
                client->write("Echo: " + data);
            });

            connect(client, &QTcpSocket::disconnected, client, &QTcpSocket::deleteLater);
        });

        if (m_server->listen(QHostAddress::Any, 8080)) {
            qDebug() << "Server started on port 8080";
        }
    }

private:
    QTcpServer *m_server;
};
```

## 10. QML/Qt Quick

### 10.1 基本 QML

```qml
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ApplicationWindow {
    id: root
    width: 640
    height: 480
    visible: true
    title: "QML Demo"

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20

        Label {
            text: "QML 示例"
            font.pixelSize: 24
            font.bold: true
            Layout.alignment: Qt.AlignHCenter
        }

        RowLayout {
            Layout.fillWidth: true

            TextField {
                id: inputField
                Layout.fillWidth: true
                placeholderText: "请输入文本..."
            }

            Button {
                text: "添加"
                onClicked: {
                    if (inputField.text !== "") {
                        listModel.append({"itemText": inputField.text})
                        inputField.text = ""
                    }
                }
            }
        }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true

            model: ListModel {
                id: listModel
            }

            delegate: ItemDelegate {
                width: ListView.view.width
                text: itemText
                onClicked: ListView.view.model.remove(index)
            }
        }
    }
}
```

### 10.2 QML 与 C++ 交互

```cpp
// C++ 端
class DataModel : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString userName READ userName WRITE setUserName NOTIFY userNameChanged)
    Q_PROPERTY(int count READ count NOTIFY countChanged)

public:
    QString userName() const { return m_userName; }
    void setUserName(const QString &name) {
        if (m_userName != name) {
            m_userName = name;
            emit userNameChanged();
        }
    }

    int count() const { return m_count; }

    Q_INVOKABLE void increment() {
        m_count++;
        emit countChanged();
    }

signals:
    void userNameChanged();
    void countChanged();

private:
    QString m_userName;
    int m_count = 0;
};

// 注册到 QML
qmlRegisterSingletonType<DataModel>("MyApp", 1, 0, "DataModel",
    [](QQmlEngine *, QJSEngine *) -> QObject * {
        return new DataModel;
    });
```

```qml
// QML 端
import QtQuick
import QtQuick.Controls
import MyApp 1.0

ApplicationWindow {
    visible: true
    width: 400
    height: 300

    Column {
        anchors.centerIn: parent
        spacing: 10

        Text {
            text: "User: " + DataModel.userName
            font.pixelSize: 20
        }

        Text {
            text: "Count: " + DataModel.count
            font.pixelSize: 20
        }

        Button {
            text: "Increment"
            onClicked: DataModel.increment()
        }
    }
}
```

## 11. 样式与主题

### 11.1 QSS 样式表

```cpp
void applyStyleSheet(QApplication &app) {
    app.setStyleSheet(R"(
        QMainWindow {
            background-color: #f5f5f5;
        }

        QPushButton {
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 14px;
        }

        QPushButton:hover {
            background-color: #45a049;
        }

        QPushButton:pressed {
            background-color: #3d8b40;
        }

        QLineEdit {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 6px;
            font-size: 14px;
        }

        QLineEdit:focus {
            border-color: #4CAF50;
        }

        QTableWidget {
            gridline-color: #ddd;
            selection-background-color: #4CAF50;
            selection-color: white;
        }

        QTableWidget::item {
            padding: 4px;
        }

        QHeaderView::section {
            background-color: #f0f0f0;
            padding: 6px;
            border: 1px solid #ddd;
            font-weight: bold;
        }

        QScrollBar:vertical {
            width: 10px;
        }

        QScrollBar::handle:vertical {
            background: #ccc;
            border-radius: 5px;
        }
    )");
}
```

## 12. 国际化

```cpp
// 在代码中使用 tr() 标记可翻译文本
label->setText(tr("Hello, World!"));
button->setText(tr("Click Me"));

// 提取翻译文本
// lupdate project.pro -ts app_zh.ts
// 使用 Qt Linguist 编辑 .ts 文件
// lrelease app_zh.ts

// 加载翻译
void loadTranslation(QApplication &app, const QString &locale) {
    QTranslator translator;
    QString fileName = QString("app_%1").arg(locale);
    if (translator.load(fileName, ":/translations")) {
        app.installTranslator(&translator);
    }
}
```

## 13. 面试题

### 1. 信号槽的底层实现？

Qt 信号槽基于元对象系统（MOC）实现：
- MOC（Meta-Object Compiler）在编译前处理 `Q_OBJECT` 宏，生成包含信号分发代码的附加 C++ 文件
- 信号函数体由 MOC 自动生成，调用 `QMetaObject::activate()`
- 连接信息存储在 `QObjectPrivate::Connection` 链表中
- 槽函数通过函数指针或 `QMetaObject::invokeMethod()` 调用

### 2. Qt 事件循环机制？

```
QApplication::exec()
  → QEventLoop::exec()
    → processEvents()
      → 事件队列处理
        → sendEvent()（同步）/ postEvent()（异步）
          → event() → specific event handlers
```

### 3. QThread 的正确用法？

- Worker-Object 模式（推荐）：创建 Worker 对象，`moveToThread()` 移到新线程
- 继承 QThread 重写 `run()`：适用于简单场景
- QtConcurrent：适用于并行计算任务
- 避免在主线程执行耗时操作，使用信号槽跨线程通信

### 4. QWidget、QDialog、QMainWindow 的区别？

| 类 | 用途 | 特点 |
|----|------|------|
| QWidget | 基础窗口类 | 所有 UI 类的基类 |
| QDialog | 对话框 | 模态/非模态，有 exec()/show() |
| QMainWindow | 主窗口 | 内置菜单栏、工具栏、状态栏、中央控件 |

### 5. MOC 的作用？

MOC 处理 `Q_OBJECT` 宏，生成：
- `qt_metacast()`：类型转换
- `qt_metacall()`：元方法调用
- `staticMetaObject`：静态元对象
- 信号函数体
- 属性系统代码
