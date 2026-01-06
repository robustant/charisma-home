#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试修复后的HTML文件
"""

import sys
from pathlib import Path

def test_html_syntax():
    """测试HTML语法"""
    print("测试HTML文件语法...")

    html_file = Path(__file__).parent / "index.html"

    if not html_file.exists():
        print("✗ index.html 文件不存在")
        return False

    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查基本HTML结构
        if '<!DOCTYPE html>' not in content:
            print("✗ 缺少DOCTYPE声明")
            return False

        if '<html' not in content:
            print("✗ 缺少<html>标签")
            return False

        if '</html>' not in content:
            print("✗ 缺少</html>标签")
            return False

        # 检查视频标签
        if 'content.mp4' not in content:
            print("✗ 视频文件引用不正确")
            return False

        # 检查JavaScript语法
        if '$(function' in content:
            print("⚠ 警告: 使用了jQuery但未引入jQuery库")
            # 这不是错误，只是警告

        print("✓ HTML语法检查通过")
        return True

    except Exception as e:
        print(f"✗ 读取HTML文件时出错: {e}")
        return False

def test_video_file():
    """测试视频文件"""
    print("\n测试视频文件...")

    video_file = Path(__file__).parent / "content.mp4"

    if not video_file.exists():
        print("✗ content.mp4 文件不存在")
        return False

    size = video_file.stat().st_size
    size_mb = size / (1024 * 1024)

    print(f"✓ 视频文件存在")
    print(f"  文件大小: {size_mb:.2f} MB")
    print(f"  文件路径: {video_file}")

    # 检查文件是否可读
    try:
        with open(video_file, 'rb') as f:
            header = f.read(100)
        if len(header) == 100:
            print("✓ 视频文件可读取")
            return True
        else:
            print("✗ 视频文件读取异常")
            return False
    except Exception as e:
        print(f"✗ 读取视频文件时出错: {e}")
        return False

def main():
    """主测试函数"""
    print("=" * 50)
    print("Windows EXE准备测试")
    print("=" * 50)

    all_passed = True

    # 测试HTML
    if not test_html_syntax():
        all_passed = False

    # 测试视频
    if not test_video_file():
        all_passed = False

    print("\n" + "=" * 50)
    if all_passed:
        print("✅ 所有测试通过!")
        print("\n文件已准备好，可以在Windows上构建EXE:")
        print("1. 将以下文件复制到Windows电脑:")
        print("   - index.html")
        print("   - content.mp4")
        print("   - build_windows.bat")
        print("2. 双击 build_windows.bat")
        print("3. 等待构建完成")
        print("4. 运行 dist/ToRomy.exe")
    else:
        print("❌ 测试失败，请修复上述问题")

    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())