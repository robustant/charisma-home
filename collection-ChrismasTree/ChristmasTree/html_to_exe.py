#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将HTML页面包装成可执行EXE文件
使用PyQt5的QWebEngineView嵌入浏览器组件
"""

import sys
import os
from pathlib import Path
from PyQt5.QtCore import QUrl, Qt
from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt5.QtWebEngineWidgets import QWebEngineView

class HTMLViewer(QMainWindow):
    """HTML文件查看器"""

    def __init__(self, html_file_path):
        super().__init__()

        self.html_file_path = Path(html_file_path).absolute()
        self.setWindowTitle("To Romy")
        self.setGeometry(100, 100, 800, 600)

        # 创建中央部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # 创建布局
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)

        # 创建Web视图
        self.web_view = QWebEngineView()
        layout.addWidget(self.web_view)

        # 加载HTML文件
        self.load_html()

    def load_html(self):
        """加载HTML文件"""
        if self.html_file_path.exists():
            try:
                # 读取HTML内容
                with open(self.html_file_path, 'r', encoding='utf-8') as f:
                    html_content = f.read()

                # 使用data URI加载HTML，避免文件路径问题
                self.web_view.setHtml(html_content, QUrl.fromLocalFile(str(self.html_file_path.parent)))
                print(f"已加载HTML文件: {self.html_file_path}")
            except Exception as e:
                print(f"加载HTML文件时出错: {e}")
                self.web_view.setHtml(f"""
                    <html>
                    <body style="margin: 0; padding: 20px; font-family: Arial;">
                        <h1>加载错误</h1>
                        <p>无法加载HTML文件: {str(e)}</p>
                        <p>请确保index.html和content.mp4文件存在。</p>
                    </body>
                    </html>
                """)
        else:
            print(f"错误: 找不到文件 {self.html_file_path}")
            self.web_view.setHtml("""
                <html>
                <body style="margin: 0; padding: 20px; font-family: Arial;">
                    <h1>文件未找到</h1>
                    <p>请确保index.html文件存在。</p>
                </body>
                </html>
            """)

def main():
    """主函数"""
    # 检查PyQt5是否安装
    try:
        from PyQt5.QtWidgets import QApplication
    except ImportError:
        print("错误: 需要安装PyQt5")
        print("请运行: pip install PyQt5 PyQtWebEngine")
        return 1

    # 获取HTML文件路径
    script_dir = Path(__file__).parent.absolute()
    html_file = script_dir / "index.html"

    if not html_file.exists():
        print(f"错误: 找不到index.html文件")
        print(f"请确保在 {script_dir} 目录中存在index.html文件")
        return 1

    # 创建应用
    app = QApplication(sys.argv)
    app.setApplicationName("HTML Viewer")

    # 创建主窗口
    window = HTMLViewer(str(html_file))
    window.show()

    # 运行应用
    return app.exec_()

if __name__ == "__main__":
    sys.exit(main())