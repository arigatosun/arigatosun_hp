import struct, json, os

p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_sit_clay.glb')
with open(p, 'rb') as f:
    data = f.read()
json_len, _ = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))

print(f"file: {os.path.basename(p)}")
print(f"size: {len(data):,} bytes")
print(f"animations: {len(gltf.get('animations', []))}")
for anim in gltf.get('animations', []):
    max_t = 0
    for ch in anim['channels']:
        s = anim['samplers'][ch['sampler']]
        a = gltf['accessors'][s['input']]
        if 'max' in a and a['max'][0] > max_t:
            max_t = a['max'][0]
    print(f"  - {anim.get('name', '?')}  channels={len(anim['channels'])}  duration={max_t:.3f}s")
