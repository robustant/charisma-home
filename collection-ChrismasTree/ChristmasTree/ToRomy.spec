# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['/home/jiadong/git/tree/html_to_exe.py'],
    pathex=[],
    binaries=[],
    datas=[('/home/jiadong/git/tree/index.html', '.'), ('/home/jiadong/git/tree/content.mp4', '.')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='ToRomy',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
