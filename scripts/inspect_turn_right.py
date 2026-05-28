import struct, json, os

p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_turn_right.glb')
with open(p, 'rb') as f:
    data = f.read()

magic, version, total = struct.unpack_from('<III', data, 0)
json_len, _ = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))

print(f"file: {os.path.basename(p)}")
print(f"size: {len(data):,} bytes")
print(f"animations: {len(gltf.get('animations', []))}")
for anim in gltf.get('animations', []):
    print(f"  - {anim.get('name', '?')}  channels={len(anim['channels'])}")

print(f"\nmeshes: {len(gltf.get('meshes', []))}")
for m in gltf.get('meshes', []):
    print(f"  - {m.get('name', '?')}  primitives={len(m.get('primitives', []))}")

print(f"\nnodes: {len(gltf.get('nodes', []))}")
# count bones (named child nodes typically)
bone_names = set(['root', 'spine', 'head', 'hips', 'shoulder.L', 'shoulder.R',
                  'upper_arm.L', 'upper_arm.R', 'hand.L', 'hand.R', 'foot.L', 'foot.R'])
hits = [n.get('name', '?') for n in gltf.get('nodes', []) if n.get('name') in bone_names]
print(f"  identifiable bones present: {sorted(hits)}")

# Get animation duration
for anim in gltf.get('animations', []):
    max_t = 0
    for ch in anim['channels']:
        s_idx = ch['sampler']
        s = anim['samplers'][s_idx]
        a = gltf['accessors'][s['input']]
        # max value of input accessor
        if 'max' in a:
            mx = a['max'][0]
            if mx > max_t:
                max_t = mx
    print(f"  duration {anim.get('name', '?')}: {max_t:.3f}s")
