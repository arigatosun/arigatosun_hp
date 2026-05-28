import struct, json, os

for fname in ['arigatokunn_wave_simple.glb', 'arigatokunn_wave_felt.glb']:
    p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', fname)
    with open(p, 'rb') as f:
        data = f.read()
    json_len, _ = struct.unpack_from('<II', data, 12)
    gltf = json.loads(data[20:20+json_len].decode('utf-8'))

    print(f"\n=== {fname} ({len(data):,} bytes) ===")
    print(f"animations: {len(gltf.get('animations', []))}")
    for anim in gltf.get('animations', []):
        max_t = 0
        for ch in anim['channels']:
            s = anim['samplers'][ch['sampler']]
            a = gltf['accessors'][s['input']]
            if 'max' in a and a['max'][0] > max_t:
                max_t = a['max'][0]
        print(f"  - {anim.get('name', '?')}  channels={len(anim['channels'])}  duration={max_t:.3f}s")
    print(f"meshes: {len(gltf.get('meshes', []))}")
    print(f"materials: {len(gltf.get('materials', []))}")
    for m in gltf.get('materials', []):
        print(f"  - {m.get('name', '?')}")
    print(f"textures: {len(gltf.get('textures', []))}")
    print(f"images: {len(gltf.get('images', []))}")
    for i, img in enumerate(gltf.get('images', [])):
        bv_idx = img.get('bufferView')
        if bv_idx is not None:
            bv = gltf['bufferViews'][bv_idx]
            print(f"  - img[{i}] name={img.get('name', '?')} mime={img.get('mimeType', '?')} size={bv['byteLength']:,} bytes")
