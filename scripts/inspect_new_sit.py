"""新 arigatokunn_sit.glb の中身確認"""
import struct, json, os

p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_sit.glb')
with open(p, 'rb') as f:
    data = f.read()
json_len, _ = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))

print(f"file: {os.path.basename(p)} ({len(data):,} bytes)")
print(f"\nanimations: {len(gltf.get('animations', []))}")
for anim in gltf.get('animations', []):
    max_t = 0
    n_keys = 0
    for ch in anim['channels']:
        s = anim['samplers'][ch['sampler']]
        a = gltf['accessors'][s['input']]
        if 'max' in a and a['max'][0] > max_t: max_t = a['max'][0]
        if a['count'] > n_keys: n_keys = a['count']
    print(f"  - {anim.get('name')}: dur={max_t:.3f}s  channels={len(anim['channels'])}  max_keys={n_keys}")

print(f"\nmaterials:")
for mi, mat in enumerate(gltf.get('materials', [])):
    try:
        name = mat.get('name', '?')
        name.encode('ascii')
    except UnicodeEncodeError:
        name = repr(mat.get('name', '?'))
    print(f"  material[{mi}] {name}")
    pbr = mat.get('pbrMetallicRoughness', {})
    if 'baseColorTexture' in pbr:
        t = pbr['baseColorTexture']
        print(f"    baseColorTexture: idx={t.get('index')} texCoord={t.get('texCoord', 0)}")
    if 'baseColorFactor' in pbr:
        print(f"    baseColorFactor: {[round(v,3) for v in pbr['baseColorFactor']]}")
    if 'metallicFactor' in pbr:
        print(f"    metallicFactor: {round(pbr['metallicFactor'],3)}")
    if 'roughnessFactor' in pbr:
        print(f"    roughnessFactor: {round(pbr['roughnessFactor'],3)}")

print(f"\nimages: {len(gltf.get('images', []))}")
for i, img in enumerate(gltf.get('images', [])):
    bv_idx = img.get('bufferView')
    sz = ''
    if bv_idx is not None:
        bv = gltf['bufferViews'][bv_idx]
        sz = f"{bv['byteLength']:,} bytes"
    print(f"  img[{i}] {img.get('name', '?')}  {sz}")
