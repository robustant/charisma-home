@echo off
REM Windows批处理脚本 - 构建EXE文件
REM 在Windows上运行此脚本

echo ========================================
echo HTML转EXE - Windows构建工具
echo ========================================

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Python未安装或不在PATH中
    echo 请从 https://python.org 下载并安装Python
    pause
    exit /b 1
)

echo ✓ Python已安装

REM 检查必要的文件
if not exist "index.html" (
    echo 错误: 找不到index.html文件
    pause
    exit /b 1
)

if not exist "content.mp4" (
    echo 错误: 找不到content.mp4文件
    pause
    exit /b 1
)

echo ✓ 必要的文件都存在

REM 安装依赖
echo.
echo 安装Python依赖...
pip install PyQt5 PyQtWebEngine pyinstaller

if errorlevel 1 (
    echo 错误: 依赖安装失败
    echo 请检查网络连接或手动安装:
    echo pip install PyQt5 PyQtWebEngine pyinstaller
    pause
    exit /b 1
)

echo ✓ 依赖安装成功

REM 创建Python脚本（如果不存在）
if not exist "html_to_exe.py" (
    echo.
    echo 创建Python脚本...
    (
echo #!/usr/bin/env python3
echo # -*- coding: utf-8 -*-
echo """
echo 将HTML页面包装成可执行EXE文件
echo 使用PyQt5的QWebEngineView嵌入浏览器组件
echo """
echo
echo import sys
echo import os
echo from pathlib import Path
echo from PyQt5.QtCore import QUrl, Qt
echo from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
echo from PyQt5.QtWebEngineWidgets import QWebEngineView
echo
echo class HTMLViewer(QMainWindow):
echo     """HTML文件查看器"""
echo
echo     def __init__(self, html_file_path):
echo         super().__init__()
echo
echo         self.html_file_path = Path(html_file_path).absolute()
echo         self.setWindowTitle("To Romy")
echo         self.setGeometry(100, 100, 800, 600)
echo
echo         # 创建中央部件
echo         central_widget = QWidget()
echo         self.setCentralWidget(central_widget)
echo
echo         # 创建布局
echo         layout = QVBoxLayout(central_widget)
echo         layout.setContentsMargins(0, 0, 0, 0)
echo
echo         # 创建Web视图
echo         self.web_view = QWebEngineView()
echo         layout.addWidget(self.web_view)
echo
echo         # 加载HTML文件
echo         self.load_html()
echo
echo     def load_html(self):
echo         """加载HTML文件"""
echo         if self.html_file_path.exists():
echo             # 使用file://协议加载本地文件
echo             file_url = QUrl.fromLocalFile(str(self.html_file_path))
echo             self.web_view.load(file_url)
echo             print(f"已加载HTML文件: {self.html_file_path}")
echo         else:
echo             print(f"错误: 找不到文件 {self.html_file_path}")
echo             self.web_view.setHtml("^<h1^>文件未找到^</h1^>^<p^>请确保HTML文件存在。^</p^>")
echo
echo def main():
echo     """主函数"""
echo     # 检查PyQt5是否安装
echo     try:
echo         from PyQt5.QtWidgets import QApplication
echo     except ImportError:
echo         print("错误: 需要安装PyQt5")
echo         print("请运行: pip install PyQt5 PyQtWebEngine")
echo         return 1
echo
echo     # 获取HTML文件路径
echo     script_dir = Path(__file__).parent.absolute()
echo     html_file = script_dir / "index.html"
echo
echo     if not html_file.exists():
echo         print(f"错误: 找不到index.html文件")
echo         print(f"请确保在 {script_dir} 目录中存在index.html文件")
echo         return 1
echo
echo     # 创建应用
echo     app = QApplication(sys.argv)
echo     app.setApplicationName("HTML Viewer")
echo
echo     # 创建主窗口
echo     window = HTMLViewer(str(html_file))
echo     window.show()
echo
echo     # 运行应用
echo     return app.exec_()
echo
echo if __name__ == "__main__":
echo     sys.exit(main())
    ) > html_to_exe.py
    echo ✓ Python脚本创建成功
)

REM 构建EXE
echo.
echo 开始构建EXE文件...
echo 这可能需要几分钟时间...

pyinstaller --onefile --windowed --name ToRomy --add-data "index.html;." --add-data "content.mp4;." --clean html_to_exe.py

if errorlevel 1 (
    echo 错误: EXE构建失败
    pause
    exit /b 1
)

echo.
echo ✓ EXE文件构建成功!

REM 显示结果
echo.
echo ========================================
echo 构建完成!
echo ========================================
echo.
echo 生成的EXE文件: dist\ToRomy.exe
echo.
echo 使用方法:
echo 1. 双击 dist\ToRomy.exe 运行
echo 2. 或者右键选择"以管理员身份运行"
echo.
echo 注意:
echo - EXE文件包含了HTML和视频文件
echo - 可以在没有Python环境的电脑上运行
echo - 文件大小可能较大（约150-200MB）
echo.
pause