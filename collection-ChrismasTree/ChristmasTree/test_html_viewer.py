#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试HTML查看器
"""

import sys
import os
from pathlib import Path

def test_imports():
    """测试必要的导入"""
    print("测试导入...")
    try:
        from PyQt5.QtWidgets import QApplication
        print("✓ PyQt5.QtWidgets 导入成功")
    except ImportError as e:
        print(f"✗ PyQt5.QtWidgets 导入失败: {e}")
        return False

    try:
        from PyQt5.QtWebEngineWidgets import QWebEngineView
        print("✓ PyQt5.QtWebEngineWidgets 导入成功")
    except ImportError as e:
        print(f"✗ PyQt5.QtWebEngineWidgets 导入失败: {e}")
        return False

    return True

def test_html_file():
    """测试HTML文件是否存在"""
    print("\n测试HTML文件...")
    html_file = Path(__file__).parent / "index.html"

    if html_file.exists():
        print(f"✓ index.html 文件存在: {html_file}")

        # 检查文件内容
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read(100)
            print(f"  文件开头内容: {content[:50]}...")

        # 检查视频文件
        video_file = Path(__file__).parent / "content.mp4"
        if video_file.exists():
            size_mb = video_file.stat().st_size / (1024 * 1024)
            print(f"✓ content.mp4 文件存在: {video_file}")
            print(f"  文件大小: {size_mb:.2f} MB")
        else:
            print(f"✗ content.mp4 文件不存在")
            return False
    else:
        print(f"✗ index.html 文件不存在")
        return False

    return True

def main():
    """主测试函数"""
    print("=" * 50)
    print("HTML查看器测试")
    print("=" * 50)

    # 测试导入
    if not test_imports():
        print("\n❌ 测试失败: 缺少必要的依赖")
        print("请运行: pip install PyQt5 PyQtWebEngine")
        return 1

    # 测试文件
    if not test_html_file():
        print("\n❌ 测试失败: 缺少必要的文件")
        return 1

    print("\n✅ 所有测试通过!")
    print("\n现在可以运行主程序:")
    print("  python3 html_to_exe.py")
    print("\n或者打包成EXE:")
    print("  pip install pyinstaller")
    print("  pyinstaller --onefile --windowed html_to_exe.py")

    return 0

if __name__ == "__main__":
    sys.exit(main())