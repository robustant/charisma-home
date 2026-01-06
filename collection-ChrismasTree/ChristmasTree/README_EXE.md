# HTML转EXE工具

这个项目将HTML页面包装成可执行的EXE文件。

## 文件说明

- `index.html` - 原始HTML文件
- `content.mp4` - HTML中引用的视频文件
- `html_to_exe.py` - 主Python脚本，使用PyQt5显示HTML
- `test_html_viewer.py` - 测试脚本，检查依赖和文件
- `build_exe.py` - 构建EXE的脚本
- `requirements.txt` - Python依赖列表
- `dist/ToRomy` - 生成的EXE文件（173MB）

## 使用方法

### 1. 直接运行Python脚本（需要Python环境）

```bash
# 安装依赖
pip install -r requirements.txt

# 运行程序
python3 html_to_exe.py
```

### 2. 运行生成的EXE文件（无需Python环境）

```bash
# 直接运行EXE
./dist/ToRomy

# 或者双击EXE文件
```

### 3. 重新构建EXE

```bash
# 运行构建脚本
python3 build_exe.py

# 或者手动使用PyInstaller
pyinstaller --onefile --windowed --name ToRomy \
  --add-data "index.html:." \
  --add-data "content.mp4:." \
  --clean html_to_exe.py
```

## 技术细节

### 使用的技术
- **PyQt5**: 用于创建GUI窗口
- **QWebEngineView**: 用于嵌入浏览器组件显示HTML
- **PyInstaller**: 用于打包Python脚本为独立的EXE文件

### EXE文件包含的内容
1. Python解释器运行时
2. PyQt5和Qt库
3. HTML文件 (`index.html`)
4. 视频文件 (`content.mp4`)

### 文件大小说明
生成的EXE文件较大（约173MB），主要原因是：
- 包含了完整的Python运行时
- 包含了Qt库（约100MB+）
- 包含了视频文件（6.18MB）

## 自定义修改

### 修改窗口标题
编辑 `html_to_exe.py` 第30行：
```python
self.setWindowTitle("To Romy")  # 修改这里的标题
```

### 修改窗口大小
编辑 `html_to_exe.py` 第31行：
```python
self.setGeometry(100, 100, 800, 600)  # (x, y, width, height)
```

### 更换HTML文件
1. 将新的HTML文件命名为 `index.html`
2. 确保HTML中引用的资源文件（如图片、视频）在当前目录
3. 重新运行 `python3 build_exe.py`

## 跨平台说明

### Linux
- 生成的EXE文件可以在Linux上直接运行
- 需要确保有执行权限：`chmod +x dist/ToRomy`

### Windows
- 在Windows上构建时，EXE文件会有 `.exe` 扩展名
- 可以使用相同的构建命令

### macOS
- 可能需要调整PyInstaller参数
- 可能需要签名才能在macOS上运行

## 故障排除

### 1. 运行EXE时提示缺少库
```bash
# 尝试在目标系统上安装必要的库
# Ubuntu/Debian
sudo apt-get install libxcb-xinerama0 libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-randr0 libxcb-render-util0 libxcb-shape0 libxcb-sync1 libxcb-xfixes0 libxcb-xkb1 libxkbcommon-x11-0

# CentOS/RHEL/Fedora
sudo yum install libxcb xcb-util xcb-util-image xcb-util-keysyms xcb-util-renderutil xcb-util-wm
```

### 2. EXE文件无法启动
- 检查文件权限：`chmod +x dist/ToRomy`
- 尝试在终端中运行查看错误信息：`./dist/ToRomy`
- 确保系统有图形界面（GUI）环境

### 3. 视频无法播放
- 确保 `content.mp4` 文件与EXE在同一目录（已打包到EXE中）
- 检查视频格式是否被Qt支持（MP4通常支持）

## 许可证

本项目代码使用MIT许可证。

## 作者

由Claude Code生成 🤖