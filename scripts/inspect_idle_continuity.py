"""Idle 開始フレームと、StopWalk / TurnRight それぞれの終了フレームを比較し、
どちら方向からの遷移が連続的か（あるいは両方とも非連続か）を可視化する。

unified.glb 内の Idle / StopWalk と、turn_right.glb 内の TurnRight を読み出し、
主要ボーン（hips, spine, head, root, shoulder.L/R, upper_arm.L/R）の
ローカル rotation_quaternion + translation を比較。
"""
import struct, json, os, math

def load_glb(path):
    with open(path, 'rb') as f:
        data = f.read()
    json_len, _ = struct.unpack_from('<II', data, 12)
    gltf = json.loads(data[20:20+json_len].decode('utf-8'))
    off = 20 + json_len
    bin_len, _ = struct.unpack_from('<II', data, off)
    bin_data = data[off+8:off+8+bin_len]
    return gltf, bin_data

def read_accessor(gltf, bin_data, idx):
    a = gltf['accessors'][idx]
    bv = gltf['bufferViews'][a['bufferView']]
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

def get_clip_pose_at(gltf, bin_data, anim_name, time_target, bone_names):
    """指定 anim の指定時間における各ボーンの translation + rotation を返す。
    実装簡略化のため最近接キーフレームを取る（補間なし）。"""
    nodes = gltf['nodes']
    name_to_idx = {n.get('name', ''): i for i, n in enumerate(nodes)}
    bone_idxs = {b: name_to_idx.get(b, -1) for b in bone_names}

    result = {}  # bone -> {translation: (x,y,z), rotation: (x,y,z,w)}
    for anim in gltf.get('animations', []):
        if anim.get('name') != anim_name:
            continue
        for ch in anim['channels']:
            target_node = ch['target']['node']
            target_path = ch['target']['path']
            bone_name = None
            for b, idx in bone_idxs.items():
                if idx == target_node:
                    bone_name = b
                    break
            if not bone_name:
                continue
            s = anim['samplers'][ch['sampler']]
            inputs = read_accessor(gltf, bin_data, s['input'])
            outputs = read_accessor(gltf, bin_data, s['output'])
            # find closest keyframe to time_target
            best_i = 0
            best_d = abs(inputs[0] - time_target)
            for i, t in enumerate(inputs):
                d = abs(t - time_target)
                if d < best_d:
                    best_d = d
                    best_i = i
            val = outputs[best_i]
            result.setdefault(bone_name, {})[target_path] = val
            result[bone_name].setdefault('_t', inputs[best_i])
        break
    return result

BONES = ["root", "hips", "spine", "head", "shoulder.L", "shoulder.R",
         "upper_arm.L", "upper_arm.R", "hand.L", "hand.R"]

unified = load_glb(os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_unified.glb'))
turn = load_glb(os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_turn_right.glb'))

# Idle frame 0 (t=0)
print("===== Idle @ t=0 (待機開始フレーム) =====")
pose_idle0 = get_clip_pose_at(*unified, 'Idle', 0.0, BONES)
for bone in BONES:
    p = pose_idle0.get(bone, {})
    rot = p.get('rotation', '?')
    tr = p.get('translation', '?')
    sample_t = p.get('_t', '?')
    print(f"  {bone:<14} t={sample_t}  rot={rot}  trans={tr}")

# StopWalk frame N (end)
print("\n===== StopWalk @ end (左歩き停止終了) =====")
# Get duration first
sw_anim = next(a for a in unified[0]['animations'] if a.get('name') == 'StopWalk')
sw_dur = 0
for ch in sw_anim['channels']:
    s = sw_anim['samplers'][ch['sampler']]
    a_in = unified[0]['accessors'][s['input']]
    if 'max' in a_in:
        if a_in['max'][0] > sw_dur:
            sw_dur = a_in['max'][0]
print(f"  duration: {sw_dur}s")
pose_sw_end = get_clip_pose_at(*unified, 'StopWalk', sw_dur, BONES)
for bone in BONES:
    p = pose_sw_end.get(bone, {})
    rot = p.get('rotation', '?')
    tr = p.get('translation', '?')
    sample_t = p.get('_t', '?')
    print(f"  {bone:<14} t={sample_t}  rot={rot}  trans={tr}")

# TurnRight frame N (end)
print("\n===== TurnRight @ end (右歩き停止終了) =====")
tr_anim = next(a for a in turn[0]['animations'] if a.get('name') == 'TurnRight')
tr_dur = 0
for ch in tr_anim['channels']:
    s = tr_anim['samplers'][ch['sampler']]
    a_in = turn[0]['accessors'][s['input']]
    if 'max' in a_in:
        if a_in['max'][0] > tr_dur:
            tr_dur = a_in['max'][0]
print(f"  duration: {tr_dur}s")
pose_tr_end = get_clip_pose_at(*turn, 'TurnRight', tr_dur, BONES)
for bone in BONES:
    p = pose_tr_end.get(bone, {})
    rot = p.get('rotation', '?')
    tr_v = p.get('translation', '?')
    sample_t = p.get('_t', '?')
    print(f"  {bone:<14} t={sample_t}  rot={rot}  trans={tr_v}")

# Compute deltas
print("\n===== 差分 (Idle@0 - StopWalk@end) [左歩き終端 → Idle 開始 の繋ぎ品質] =====")
for bone in BONES:
    a = pose_idle0.get(bone, {})
    b = pose_sw_end.get(bone, {})
    if 'rotation' in a and 'rotation' in b:
        dr = sum(abs(x-y) for x, y in zip(a['rotation'], b['rotation']))
        dt = sum(abs(x-y) for x, y in zip(a.get('translation', (0,0,0)), b.get('translation', (0,0,0))))
        print(f"  {bone:<14} d_rot={dr:.4f}  d_trans={dt:.4f}")

print("\n===== 差分 (Idle@0 - TurnRight@end) [右歩き終端 → Idle 開始 の繋ぎ品質] =====")
for bone in BONES:
    a = pose_idle0.get(bone, {})
    b = pose_tr_end.get(bone, {})
    if 'rotation' in a and 'rotation' in b:
        dr = sum(abs(x-y) for x, y in zip(a['rotation'], b['rotation']))
        dt = sum(abs(x-y) for x, y in zip(a.get('translation', (0,0,0)), b.get('translation', (0,0,0))))
        print(f"  {bone:<14} d_rot={dr:.4f}  d_trans={dt:.4f}")
