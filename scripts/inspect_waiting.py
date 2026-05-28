import struct, json, os, math

p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_unified.glb')
with open(p, 'rb') as f:
    data = f.read()

magic, version, total = struct.unpack_from('<III', data, 0)
assert magic == 0x46546C67
json_len, json_type = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))

off = 20 + json_len
bin_len, bin_type = struct.unpack_from('<II', data, off)
bin_data = data[off+8:off+8+bin_len]

buffer_views = gltf['bufferViews']
accessors = gltf['accessors']

def read_accessor(idx):
    a = accessors[idx]
    bv = buffer_views[a['bufferView']]
    o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = a['count']
    t = a['type']
    components = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[t]
    size = components * 4
    out = []
    for i in range(n):
        vals = struct.unpack_from('<' + 'f' * components, bin_data, o + i * size)
        out.append(vals if components > 1 else vals[0])
    return out

nodes = gltf.get('nodes', [])

# Inspect each animation's per-channel range (excluding root) to find which bones actually move
for anim in gltf.get('animations', []):
    name = anim.get('name', '')
    if name not in ('WaitingPose', 'Idle', 'ArmatureAction.002'):
        continue
    print(f"\n========= {name} =========")
    # group by node name
    moves = []
    keyframe_counts = set()
    for ch in anim['channels']:
        s = anim['samplers'][ch['sampler']]
        inputs = read_accessor(s['input'])
        outputs = read_accessor(s['output'])
        node = nodes[ch['target']['node']]
        nname = node.get('name', '?')
        path = ch['target']['path']
        keyframe_counts.add(len(inputs))
        # measure range of motion
        if path == 'translation' or path == 'scale':
            if len(outputs) < 2:
                continue
            xs = [v[0] for v in outputs]
            ys = [v[1] for v in outputs]
            zs = [v[2] for v in outputs]
            ranges = (max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs))
            mag = max(ranges)
            if mag > 0.0001:
                moves.append((mag, nname, path, ranges))
        elif path == 'rotation':
            if len(outputs) < 2:
                continue
            # quaternions - measure max angle between consecutive
            max_diff = 0
            for i in range(len(outputs)-1):
                q1 = outputs[i]
                q2 = outputs[i+1]
                d = abs(q1[0]-q2[0]) + abs(q1[1]-q2[1]) + abs(q1[2]-q2[2]) + abs(q1[3]-q2[3])
                if d > max_diff:
                    max_diff = d
            # also measure overall range
            xs = [v[0] for v in outputs]
            ys = [v[1] for v in outputs]
            zs = [v[2] for v in outputs]
            ws = [v[3] for v in outputs]
            total_range = (max(xs)-min(xs)) + (max(ys)-min(ys)) + (max(zs)-min(zs)) + (max(ws)-min(ws))
            if total_range > 0.001:
                moves.append((total_range, nname, path, (max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs), max(ws)-min(ws))))

    print(f"  keyframe counts across channels: {sorted(keyframe_counts)}")
    moves.sort(reverse=True, key=lambda x: x[0])
    print(f"  channels with motion: {len(moves)}")
    for mag, nm, path, rng in moves[:15]:
        print(f"   {nm}.{path}  magnitude={mag:.4f}  range={rng}")
