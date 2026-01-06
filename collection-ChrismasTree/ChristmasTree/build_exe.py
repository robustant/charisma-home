#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建EXE文件的脚本
"""

import sys
import os
import subprocess
import shutil
from pathlib import Path

def check_dependencies():
    """检查必要的依赖"""
    print("检查依赖...")

    # 检查PyInstaller
    try:
        import PyInstaller
        print("✓ PyInstaller 已安装")
    except ImportError:
        print("✗ PyInstaller 未安装")
        print("请运行: pip install pyinstaller")
        return False

    # 检查PyQt5
    try:
        import PyQt5
        print("✓ PyQt5 已安装")
    except ImportError:
        print("✗ PyQt5 未安装")
        print("请运行: pip install PyQt5 PyQtWebEngine")
        return False

    # 检查PyQtWebEngine
    try:
        import PyQt5.QtWebEngineWidgets
        print("✓ PyQtWebEngine 已安装")
    except ImportError:
        print("✗ PyQtWebEngine 未安装")
        print("请运行: pip install PyQtWebEngine")
        return False

    return True

def check_files():
    """检查必要的文件"""
    print("\n检查文件...")

    script_dir = Path(__file__).parent.absolute()

    # 检查主脚本
    main_script = script_dir / "html_to_exe.py"
    if main_script.exists():
        print(f"✓ 主脚本存在: {main_script}")
    else:
        print(f"✗ 主脚本不存在: {main_script}")
        return False

    # 检查HTML文件
    html_file = script_dir / "index.html"
    if html_file.exists():
        print(f"✓ HTML文件存在: {html_file}")
    else:
        print(f"✗ HTML文件不存在: {html_file}")
        return False

    # 检查视频文件
    video_file = script_dir / "content.mp4"
    if video_file.exists():
        size_mb = video_file.stat().st_size / (1024 * 1024)
        print(f"✓ 视频文件存在: {video_file}")
        print(f"  文件大小: {size_mb:.2f} MB")
    else:
        print(f"✗ 视频文件不存在: {video_file}")
        return False

    return True

def build_exe():
    """构建EXE文件"""
    print("\n开始构建EXE文件...")

    script_dir = Path(__file__).parent.absolute()
    main_script = script_dir / "html_to_exe.py"

    # 创建dist目录
    dist_dir = script_dir / "dist"
    build_dir = script_dir / "build"

    # 清理旧的构建文件
    if dist_dir.exists():
        print(f"清理旧的dist目录: {dist_dir}")
        shutil.rmtree(dist_dir)

    if build_dir.exists():
        print(f"清理旧的build目录: {build_dir}")
        shutil.rmtree(build_dir)

    # PyInstaller命令
    # --onefile: 打包成单个EXE文件
    # --windowed: 不显示控制台窗口
    # --name: 输出文件名
    # --add-data: 添加数据文件（HTML和视频）
    cmd = [
        "pyinstaller",
        "--onefile",
        "--windowed",
        "--name", "ToRomy",
        "--add-data", f"{script_dir / 'index.html'}:.",
        "--add-data", f"{script_dir / 'content.mp4'}:.",
        "--clean",
        str(main_script)
    ]

    print(f"执行命令: {' '.join(cmd)}")

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✓ PyInstaller 执行成功")

        # 显示输出
        if result.stdout:
            print("\nPyInstaller输出:")
            print(result.stdout[:500] + "..." if len(result.stdout) > 500 else result.stdout)

    except subprocess.CalledProcessError as e:
        print(f"✗ PyInstaller 执行失败")
        print(f"错误代码: {e.returncode}")
        print(f"标准输出: {e.stdout}")
        print(f"标准错误: {e.stderr}")
        return False

    return True

def verify_exe():
    """验证生成的EXE文件"""
    print("\n验证EXE文件...")

    script_dir = Path(__file__).parent.absolute()
    exe_file = script_dir / "dist" / "ToRomy"

    if not exe_file.exists():
        # 在Windows上可能是.exe扩展名
        exe_file = script_dir / "dist" / "ToRomy.exe"

    if exe_file.exists():
        size_mb = exe_file.stat().st_size / (1024 * 1024)
        print(f"✓ EXE文件生成成功: {exe_file}")
        print(f"  文件大小: {size_mb:.2f} MB")

        # 检查文件权限
        if os.access(exe_file, os.X_OK):
            print(f"  文件可执行")
        else:
            print(f"  注意: 文件可能没有执行权限")

        return True
    else:
        print(f"✗ EXE文件未找到")
        print(f"  预期位置: {exe_file}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("EXE构建工具")
    print("=" * 60)

    # 检查依赖
    if not check_dependencies():
        print("\n❌ 构建失败: 缺少必要的依赖")
        return 1

    # 检查文件
    if not check_files():
        print("\n❌ 构建失败: 缺少必要的文件")
        return 1

    # 构建EXE
    if not build_exe():
        print("\n❌ 构建失败: PyInstaller执行错误")
        return 1

    # 验证EXE
    if not verify_exe():
        print("\n❌ 构建失败: EXE文件未生成")
        return 1

    print("\n" + "=" * 60)
    print("✅ 构建成功!")
    print("=" * 60)

    script_dir = Path(__file__).parent.absolute()
    exe_path = script_dir / "dist" / "ToRomy"

    if not exe_path.exists():
        exe_path = script_dir / "dist" / "ToRomy.exe"

    print(f"\n生成的EXE文件: {exe_path}")
    print(f"\n使用方法:")
    print(f"1. 直接运行: {exe_path}")
    print(f"2. 或者双击EXE文件")
    print(f"\n注意:")
    print(f"- EXE文件包含了HTML和视频文件")
    print(f"- 可以在没有Python环境的电脑上运行")
    print(f"- 文件大小可能较大（包含Python运行时和Qt库）")

    return 0

if __name__ == "__main__":
    sys.exit(main())