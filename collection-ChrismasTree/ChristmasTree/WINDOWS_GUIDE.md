# Windows版EXE生成指南

## 方法一：使用预构建的脚本（推荐）

### 步骤1：准备文件
将以下文件复制到Windows电脑的同一个文件夹中：
- `index.html` (HTML文件)
- `content.mp4` (视频文件)
- `build_windows.bat` (构建脚本)

### 步骤2：运行构建脚本
1. 双击 `build_windows.bat` 文件
2. 如果出现安全警告，选择"更多信息" → "仍要运行"
3. 脚本会自动：
   - 检查Python是否安装
   - 安装必要的Python包（PyQt5, PyQtWebEngine, PyInstaller）
   - 构建EXE文件

### 步骤3：运行EXE
构建完成后，在 `dist` 文件夹中会生成 `ToRomy.exe` 文件，双击即可运行。

## 方法二：手动构建

### 步骤1：安装Python
1. 访问 https://python.org
2. 下载Python 3.8+ 安装包
3. 安装时**务必勾选** "Add Python to PATH"

### 步骤2：安装必要软件包
打开命令提示符（CMD）或PowerShell，运行：
```cmd
pip install PyQt5 PyQtWebEngine pyinstaller
```

### 步骤3：构建EXE
在文件所在目录打开命令提示符，运行：
```cmd
pyinstaller --onefile --windowed --name ToRomy --add-data "index.html;." --add-data "content.mp4;." --clean html_to_exe.py
```

### 步骤4：运行EXE
在 `dist` 文件夹中找到 `ToRomy.exe`，双击运行。

## 方法三：直接使用已生成的EXE

如果你已经有了 `ToRomy.exe` 文件：
1. 将 `ToRomy.exe` 复制到任何Windows电脑
2. 双击即可运行
3. **不需要安装Python或其他软件**

## 常见问题解决

### 1. 双击.bat文件没有反应
- 右键点击 `build_windows.bat` → "以管理员身份运行"
- 或者打开命令提示符，切换到文件目录，输入 `build_windows.bat`

### 2. Python安装失败
- 确保从官网 https://python.org 下载
- 安装时勾选"Add Python to PATH"
- 重启电脑后重试

### 3. pip安装包失败
```cmd
# 使用国内镜像源
pip install PyQt5 PyQtWebEngine pyinstaller -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 4. EXE文件无法运行
- 确保Windows系统是64位（大多数现代电脑都是）
- 尝试右键 → "以管理员身份运行"
- 检查杀毒软件是否阻止了程序运行

### 5. 视频无法播放
- 确保 `content.mp4` 文件与EXE在同一目录
- 视频格式应为常见的MP4格式（H.264编码）

## 文件说明

### 必需文件
- `index.html` - 网页文件
- `content.mp4` - 视频文件（6.18MB）

### 生成的文件
- `ToRomy.exe` - 可执行文件（约150-200MB）
- `dist/` - 输出目录
- `build/` - 临时构建目录（可删除）

### 脚本文件
- `build_windows.bat` - Windows构建脚本
- `html_to_exe.py` - Python主程序
- `requirements.txt` - Python依赖列表

## 技术细节

### EXE文件特点
1. **独立运行**：不需要安装Python或任何其他软件
2. **包含所有资源**：HTML、视频都打包在EXE中
3. **跨Windows版本**：Windows 7/8/10/11 都能运行
4. **无控制台窗口**：纯图形界面程序

### 文件大小
- 原始文件：HTML(1KB) + 视频(6.18MB) = 约6.2MB
- EXE文件：约150-200MB（包含Python运行时和Qt库）

### 安全说明
- 程序不会修改系统文件
- 不会连接网络
- 所有代码开源可审查

## 自定义修改

### 修改窗口标题
编辑 `html_to_exe.py`，找到：
```python
self.setWindowTitle("To Romy")
```
修改引号内的文字。

### 修改窗口大小
编辑 `html_to_exe.py`，找到：
```python
self.setGeometry(100, 100, 800, 600)
```
四个数字分别表示：窗口左上角X坐标、Y坐标、宽度、高度。

### 更换内容
1. 替换 `index.html` 文件
2. 替换 `content.mp4` 文件（保持同名）
3. 重新运行构建脚本

## 联系方式

如有问题，请检查：
1. 所有必需文件是否齐全
2. Python是否正确安装
3. 网络连接是否正常

构建成功后，`ToRomy.exe` 可以在任何Windows电脑上直接双击运行！