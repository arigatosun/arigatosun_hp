"""arigatokunn_walk_click.glb の中身確認"""
import struct, json, os

p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_walk_click.glb')
with open(p, 'rb') as f:
    data = f.read()
json_len, _ = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))

print(f"file: {os.path.basename(p)} ({len(data):,} bytes)")
print(f"\nanimations: {len(gltf.get('animations', []))}")
for anim in gltf.get('animations', []):
    max_t = 0; n_keys = 0
    for ch in anim['channels']:
        s = anim['samplers'][ch['sampler']]
        a = gltf['accessors'][s['input']]
        if 'max' in a and a['max'][0] > max_t: max_t = a['max'][0]
        if a['count'] > n_keys: n_keys = a['count']
    print(f"  - {anim.get('name')}: dur={max_t:.3f}s  channels={len(anim['channels'])}  max_keys={n_keys}")

print(f"\nmeshes: {len(gltf.get('meshes', []))}")
for m in gltf.get('meshes', []):
    try:
        name = m.get('name','?'); name.encode('ascii')
    except: name = repr(m.get('name','?'))
    print(f"  mesh '{name}' primitives={len(m.get('primitives', []))}")

print(f"\nmaterials:")
for mi, mat in enumerate(gltf.get('materials', [])):
    try:
        name = mat.get('name','?'); name.encode('ascii')
    except: name = repr(mat.get('name','?'))
    pbr = mat.get('pbrMetallicRoughness', {})
    bct = pbr.get('baseColorTexture')
    bc = pbr.get('baseColorFactor')
    print(f"  [{mi}] {name}  baseColorTexture={bct.get('index') if bct else None} texCoord={bct.get('texCoord',0) if bct else None}  factor={bc}")

print(f"\nimages: {len(gltf.get('images', []))}")
for i, img in enumerate(gltf.get('images', [])):
    bv = gltf['bufferViews'][img['bufferView']]
    print(f"  img[{i}] {img.get('name','?')}  {bv['byteLength']:,} bytes")

# bone count (joints)
print(f"\nskins: {len(gltf.get('skins', []))}")
for si, sk in enumerate(gltf.get('skins', [])):
    print(f"  skin[{si}]: joints={len(sk.get('joints', []))}")
