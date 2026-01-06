# 快速开始 - HTML转EXE

## 目标
将 `index.html` 和 `content.mp4` 打包成一个可以在Windows上直接双击运行的EXE文件。

## 已完成的文件

### 核心文件（必需）
1. `index.html` - 修复了JavaScript错误的HTML文件
2. `content.mp4` - 视频文件（6.18MB）

### 构建脚本
3. `build_windows.bat` - **Windows构建脚本**（双击运行）
4. `html_to_exe.py` - Python主程序（已优化）
5. `requirements.txt` - Python依赖列表

### 测试和文档
6. `test_fixed_html.py` - 测试脚本
7. `test_html_viewer.py` - 原始测试脚本
8. `build_exe.py` - Linux构建脚本
9. `README_EXE.md` - 详细使用说明
10. `WINDOWS_GUIDE.md` - Windows专用指南
11. `QUICK_START.md` - 本快速指南

## 在Windows上构建EXE的步骤

### 最简单的方法（推荐）
1. **复制文件**到Windows电脑：
   - `index.html`
   - `content.mp4`
   - `build_windows.bat`

2. **双击** `build_windows.bat`
   - 脚本会自动安装Python（如果需要）
   - 安装必要的软件包
   - 构建EXE文件

3. **运行EXE**：
   - 在生成的 `dist` 文件夹中
   - 双击 `ToRomy.exe`

### 手动方法
如果自动脚本有问题：
1. 手动安装Python 3.8+（从python.org）
2. 打开命令提示符，运行：
   ```cmd
   pip install PyQt5 PyQtWebEngine pyinstaller
   ```
3. 运行构建命令：
   ```cmd
   pyinstaller --onefile --windowed --name ToRomy --add-data "index.html;." --add-data "content.mp4;." --clean html_to_exe.py
   ```

## EXE文件特点

### 优点
- ✅ **独立运行**：不需要安装Python或其他软件
- ✅ **双击即用**：在Windows上直接双击运行
- ✅ **包含所有资源**：HTML和视频都打包在EXE中
- ✅ **跨Windows版本**：Win7/8/10/11都能运行
- ✅ **无控制台窗口**：纯图形界面

### 注意事项
- ⚠ **文件较大**：约150-200MB（包含Python和Qt运行时）
- ⚠ **首次运行慢**：第一次启动需要解压资源
- ⚠ **杀毒软件**：可能会误报，需要允许运行

## 验证构建

在Windows上构建前，可以在Linux/Mac上测试：
```bash
# 测试HTML和视频文件
python3 test_fixed_html.py

# 测试Python程序（需要PyQt5）
python3 html_to_exe.py
```

## 故障排除

### 常见问题
1. **.bat文件不运行**：右键 → "以管理员身份运行"
2. **Python安装失败**：从官网下载，安装时勾选"Add to PATH"
3. **pip安装慢**：使用国内镜像 `-i https://pypi.tuna.tsinghua.edu.cn/simple`
4. **EXE无法运行**：右键 → "以管理员身份运行"，或关闭杀毒软件

### 错误信息
- **"FFmpegDemuxer: no supported streams"**：视频编码问题，但程序仍能运行
- **"$ is not defined"**：已修复，不再出现此错误

## 最终结果

成功构建后，你将得到：
- `ToRomy.exe` - 可执行文件（在 `dist` 文件夹中）
- 可以在任何Windows电脑上运行
- 不需要额外安装任何软件

## 下一步
1. 将 `index.html`、`content.mp4`、`build_windows.bat` 复制到Windows电脑
2. 双击 `build_windows.bat`
3. 等待10-30分钟（取决于网速和电脑性能）
4. 享受你的独立EXE程序！

---

**提示**：如果遇到问题，请参考 `WINDOWS_GUIDE.md` 获取详细解决方案。