"""新 glb の UV channel 構成 + texture の texCoord 参照を確認。"""
import struct, json, os

for fname in ['arigatokunn_wave.glb', 'arigatokunn_wave_simple.glb']:
    p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', fname)
    with open(p, 'rb') as f:
        data = f.read()
    json_len, _ = struct.unpack_from('<II', data, 12)
    gltf = json.loads(data[20:20+json_len].decode('utf-8'))

    print(f"\n========== {fname} ==========")
    # mesh の primitive 構造（attributes に TEXCOORD_n がどれだけあるか）
    for mi, mesh in enumerate(gltf.get('meshes', [])):
        print(f"\nmesh[{mi}] {mesh.get('name', '?')}: primitives={len(mesh['primitives'])}")
        for pi, prim in enumerate(mesh['primitives']):
            attrs = prim.get('attributes', {})
            tex_coords = sorted([k for k in attrs.keys() if k.startswith('TEXCOORD')])
            mat_idx = prim.get('material')
            mat_name = gltf['materials'][mat_idx].get('name', '?') if mat_idx is not None else 'none'
            print(f"  prim[{pi}] material={mat_name!r}  attribute UV channels: {tex_coords}")

    # 各 material の texture texCoord 参照
    print()
    for mi, mat in enumerate(gltf.get('materials', [])):
        name = mat.get('name', '?')
        try:
            name.encode('ascii')
        except UnicodeEncodeError:
            name = repr(name)
        print(f"  material[{mi}] {name}")
        pbr = mat.get('pbrMetallicRoughness', {})
        for prop in ('baseColorTexture', 'metallicRoughnessTexture'):
            t = pbr.get(prop)
            if t:
                print(f"    {prop}: index={t.get('index')} texCoord={t.get('texCoord', 0)}")
        nm = mat.get('normalTexture')
        if nm:
            print(f"    normalTexture: index={nm.get('index')} texCoord={nm.get('texCoord', 0)}")
