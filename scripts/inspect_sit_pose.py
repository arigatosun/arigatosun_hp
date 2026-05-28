"""sit_clay glb のボーン姿勢を確認 - T-pose のままか、座り姿勢になっているか"""
import struct, json, os

p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_sit_clay.glb')
with open(p, 'rb') as f:
    data = f.read()
json_len, _ = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))
off = 20 + json_len
bin_len, _ = struct.unpack_from('<II', data, off)
bin_data = data[off+8:off+8+bin_len]

print(f"file: {os.path.basename(p)} ({len(data):,} bytes)")
print(f"animations: {len(gltf.get('animations', []))}")
for anim in gltf.get('animations', []):
    print(f"\n=== animation: {anim.get('name', '?')}  channels={len(anim['channels'])} ===")
    nodes = gltf['nodes']
    # 各 channel の target node とその初期値（最初のキー値）
    key_bones = ['hips', 'spine', 'head', 'shoulder.L', 'upper_arm.L', 'lowarm.L', 'hand.L',
                 'foot.L', 'low_foot.L', 'upper_foot.L', 'IKhand.L', 'upper_arm.L.001']
    by_bone_path = {}
    for ch in anim['channels']:
        tn = nodes[ch['target']['node']]
        name = tn.get('name', '?')
        if name not in key_bones: continue
        path = ch['target']['path']
        s = anim['samplers'][ch['sampler']]
        out_acc = gltf['accessors'][s['output']]
        bv = gltf['bufferViews'][out_acc['bufferView']]
        o = bv.get('byteOffset', 0) + out_acc.get('byteOffset', 0)
        comp = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[out_acc['type']]
        # 最初の値
        first = struct.unpack_from('<' + 'f'*comp, bin_data, o)
        # 最後の値
        last = struct.unpack_from('<' + 'f'*comp, bin_data, o + (out_acc['count']-1)*comp*4)
        by_bone_path[(name, path)] = (first, last, out_acc['count'])

    for bone in key_bones:
        for path in ['rotation', 'translation', 'scale']:
            if (bone, path) in by_bone_path:
                first, last, count = by_bone_path[(bone, path)]
                first_str = ', '.join(f'{v:+.3f}' for v in first)
                last_str = ', '.join(f'{v:+.3f}' for v in last)
                # 動きあるか
                changed = any(abs(a - b) > 0.001 for a, b in zip(first, last))
                flag = ' ★' if changed else ''
                # rest pose と違うか (translation = (0,0,0)、rotation = identity と異なるか)
                is_non_identity_at_first = False
                if path == 'rotation':
                    # quaternion identity = (0, 0, 0, 1)
                    if abs(first[3] - 1.0) > 0.01 or any(abs(v) > 0.01 for v in first[:3]):
                        is_non_identity_at_first = True
                elif path == 'translation':
                    if any(abs(v) > 0.001 for v in first):
                        is_non_identity_at_first = True
                ident_flag = ' [POSE]' if is_non_identity_at_first else ' [identity]'
                print(f"  {bone:<18}.{path:<11}: f1=({first_str}){ident_flag}  count={count}{flag}")
