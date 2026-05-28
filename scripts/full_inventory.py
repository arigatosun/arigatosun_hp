import struct, json, os, math

p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_unified.glb')
with open(p, 'rb') as f:
    data = f.read()

magic, version, total = struct.unpack_from('<III', data, 0)
json_len, _ = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))
off = 20 + json_len
bin_len, _ = struct.unpack_from('<II', data, off)
bin_data = data[off+8:off+8+bin_len]

bvs = gltf['bufferViews']
accs = gltf['accessors']

def read(idx):
    a = accs[idx]
    bv = bvs[a['bufferView']]
    o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = a['count']
    t = a['type']
    comp = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[t]
    out = []
    for i in range(n):
        vals = struct.unpack_from('<' + 'f' * comp, bin_data, o + i * comp * 4)
        out.append(vals if comp > 1 else vals[0])
    return out

nodes = gltf.get('nodes', [])

# For each animation, summarize: which body region is moving, and how much
REGIONS = {
    'head/neck': ['head', 'neck'],
    'torso (spine/hips)': ['spine', 'hips', 'chest', 'torso', 'root'],
    'left arm': ['shoulder.L', 'upper_arm.L', 'lowarm.L', 'hand.L', 'IKhand.L'],
    'right arm': ['shoulder.R', 'upper_arm.R', 'lowarm.R', 'hand.R', 'IKhand.R'],
    'left leg': ['upper_foot.L', 'foot.L', 'low_foot.L', 'toe.L', 'foot.L.001'],
    'right leg': ['upper_foot.R', 'foot.R', 'low_foot.R', 'toe.R', 'foot.R.001'],
}

print(f"glb path: {os.path.basename(p)}")
print(f"animations total: {len(gltf.get('animations', []))}")

for anim in gltf.get('animations', []):
    name = anim.get('name', '')
    # Determine duration
    max_t = 0
    for ch in anim['channels']:
        s = anim['samplers'][ch['sampler']]
        ins = read(s['input'])
        if ins and ins[-1] > max_t:
            max_t = ins[-1]

    # Aggregate per region
    region_totals = {k: 0.0 for k in REGIONS}
    total_motion = 0.0
    max_kf = 0
    for ch in anim['channels']:
        s = anim['samplers'][ch['sampler']]
        outs = read(s['output'])
        ins = read(s['input'])
        if len(ins) > max_kf:
            max_kf = len(ins)
        if len(outs) < 2:
            continue
        node = nodes[ch['target']['node']]
        nname = node.get('name', '?')
        path = ch['target']['path']

        if path == 'rotation':
            xs = [v[0] for v in outs]; ys = [v[1] for v in outs]
            zs = [v[2] for v in outs]; ws = [v[3] for v in outs]
            mag = (max(xs)-min(xs)) + (max(ys)-min(ys)) + (max(zs)-min(zs)) + (max(ws)-min(ws))
        elif path == 'translation':
            xs = [v[0] for v in outs]; ys = [v[1] for v in outs]; zs = [v[2] for v in outs]
            mag = max(max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs))
        else:
            continue

        total_motion += mag
        for region, names in REGIONS.items():
            if nname in names:
                region_totals[region] += mag
                break

    print(f"\n=== {name} ===")
    print(f"  duration: {max_t:.3f}s  max keyframes/channel: {max_kf}  total channels: {len(anim['channels'])}")
    print(f"  motion by region (sum of all channel magnitudes):")
    for region, total in sorted(region_totals.items(), key=lambda x: -x[1]):
        bar = '#' * int(total * 5)
        print(f"    {region:22s} {total:7.3f}  {bar}")
    other = total_motion - sum(region_totals.values())
    print(f"    {'(other bones)':22s} {other:7.3f}")
