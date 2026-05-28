"""新 wave glb のアニメに root translation があるかチェック。
あれば 1.5 秒後にキャラが画面外に飛ぶことで「消える」現象が起きる。"""
import struct, json, os

for fname in ['arigatokunn_wave.glb', 'arigatokunn_wave_simple.glb', 'arigatokunn_wave_felt.glb']:
    p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', fname)
    with open(p, 'rb') as f:
        data = f.read()
    json_len, _ = struct.unpack_from('<II', data, 12)
    gltf = json.loads(data[20:20+json_len].decode('utf-8'))
    off = 20 + json_len
    bin_len, _ = struct.unpack_from('<II', data, off)
    bin_data = data[off+8:off+8+bin_len]

    nodes = gltf.get('nodes', [])
    print(f"\n=== {fname} ===")
    for anim in gltf.get('animations', []):
        anim_name = anim.get('name', '?')
        translation_targets = []
        for ch in anim['channels']:
            target_node = ch['target']['node']
            target_path = ch['target']['path']
            if target_path == 'translation':
                node_name = nodes[target_node].get('name', '?')
                # output accessor 範囲
                s = anim['samplers'][ch['sampler']]
                a = gltf['accessors'][s['output']]
                bv = gltf['bufferViews'][a['bufferView']]
                o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
                n = a['count']
                outs = []
                for i in range(n):
                    v = struct.unpack_from('<fff', bin_data, o + i * 12)
                    outs.append(v)
                xs = [v[0] for v in outs]
                ys = [v[1] for v in outs]
                zs = [v[2] for v in outs]
                range_x = max(xs) - min(xs)
                range_y = max(ys) - min(ys)
                range_z = max(zs) - min(zs)
                max_range = max(range_x, range_y, range_z)
                translation_targets.append((node_name, max_range, (round(min(xs),3), round(max(xs),3)), (round(min(ys),3), round(max(ys),3)), (round(min(zs),3), round(max(zs),3))))
        print(f"  Animation: {anim_name}  translation tracks: {len(translation_targets)}")
        # 大きい順
        translation_targets.sort(key=lambda t: -t[1])
        for name, mr, x, y, z in translation_targets[:8]:
            print(f"    {name:<20}  max_range={mr:.3f}  X={x}  Y={y}  Z={z}")
