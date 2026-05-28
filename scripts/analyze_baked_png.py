"""Bake で作った PNG を直接読んで、黒/暗い領域がどのくらいあるか分析する。
PNG ライブラリなしで CRC + zlib 解凍だけで実装。
"""
import struct
import zlib
import os
import sys

def parse_png(path):
    with open(path, 'rb') as f:
        data = f.read()
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError(f"Not PNG: {path}")
    pos = 8
    width = height = bit_depth = color_type = None
    idat = bytearray()
    while pos < len(data):
        length = struct.unpack_from('>I', data, pos)[0]
        ctype = data[pos+4:pos+8]
        chunk_data = data[pos+8:pos+8+length]
        if ctype == b'IHDR':
            width, height, bit_depth, color_type = struct.unpack('>IIBB', chunk_data[:10])
        elif ctype == b'IDAT':
            idat.extend(chunk_data)
        elif ctype == b'IEND':
            break
        pos += 12 + length
    raw = zlib.decompress(bytes(idat))
    # Reconstruct image (filter type per scanline)
    bpp_map = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}  # 6=RGBA, 2=RGB
    channels = bpp_map[color_type]
    bpp = channels * (bit_depth // 8)
    stride = width * bpp
    img = bytearray(stride * height)
    prev = bytearray(stride)
    src = 0
    dst = 0
    for y in range(height):
        ftype = raw[src]
        src += 1
        scan = bytearray(raw[src:src+stride])
        src += stride
        if ftype == 0:
            pass
        elif ftype == 1:  # Sub
            for i in range(bpp, stride):
                scan[i] = (scan[i] + scan[i-bpp]) & 0xff
        elif ftype == 2:  # Up
            for i in range(stride):
                scan[i] = (scan[i] + prev[i]) & 0xff
        elif ftype == 3:  # Average
            for i in range(stride):
                a = scan[i-bpp] if i >= bpp else 0
                b = prev[i]
                scan[i] = (scan[i] + (a + b) // 2) & 0xff
        elif ftype == 4:  # Paeth
            for i in range(stride):
                a = scan[i-bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i-bpp] if i >= bpp else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pred = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                scan[i] = (scan[i] + pred) & 0xff
        img[dst:dst+stride] = scan
        dst += stride
        prev = scan
    return width, height, channels, img

def histogram(name, path):
    if not os.path.exists(path):
        print(f"  {name}: NOT FOUND")
        return
    w, h, ch, img = parse_png(path)
    total = w * h
    # Sample brightness (R+G+B average) histogram
    bins = [0] * 8  # 0-31, 32-63, ..., 224-255
    black_pixels = 0  # all RGB < 16
    near_black = 0    # all RGB < 32
    nonblack_red = 0  # R > 100, G < 50, B < 50 (red-ish)
    for i in range(0, len(img), ch):
        r, g, b = img[i], img[i+1], img[i+2] if ch >= 3 else img[i]
        if ch == 1:
            r = g = b = img[i]
        if r < 16 and g < 16 and b < 16:
            black_pixels += 1
        if r < 32 and g < 32 and b < 32:
            near_black += 1
        if r > 100 and g < 60 and b < 60:
            nonblack_red += 1
        brightness = (r + g + b) // 3
        bins[min(7, brightness // 32)] += 1
    print(f"\n  {name} ({w}x{h}, {ch}ch)")
    print(f"    completely black (RGB<16): {black_pixels:,} ({100*black_pixels/total:.1f}%)")
    print(f"    near black (RGB<32):       {near_black:,} ({100*near_black/total:.1f}%)")
    print(f"    saturated red:             {nonblack_red:,} ({100*nonblack_red/total:.1f}%)")
    print(f"    brightness bins (0..255):")
    for i, c in enumerate(bins):
        bar_len = int(80 * c / total)
        print(f"      {i*32:>3}-{i*32+31:>3}: {'#' * bar_len}  {c:,}")

DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'Desktop', 'blender', 'baked_textures')
for fname in [
    'Clay_rough_BaseColor.png',
    'Clay_rough_Roughness.png',
    'Clay_rough_Normal.png',
    'Felt_kvadrat_0227_BaseColor.png',
    'Felt_kvadrat_0227_Roughness.png',
    'Felt_kvadrat_0227_Normal.png',
]:
    histogram(fname, os.path.join(DIR, fname))
