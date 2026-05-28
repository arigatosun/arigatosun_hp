"""sit_clay glb の skeleton + skin 構造確認"""
import struct, json, os

p = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'arigatokunn_sit_clay.glb')
with open(p, 'rb') as f:
    data = f.read()
json_len, _ = struct.unpack_from('<II', data, 12)
gltf = json.loads(data[20:20+json_len].decode('utf-8'))
off = 20 + json_len
bin_len, _ = struct.unpack_from('<II', data, off)
bin_data = data[off+8:off+8+bin_len]

print(f"=== nodes: {len(gltf.get('nodes', []))} ===")
# armature root を探す
arm_node_idx = None
for i, node in enumerate(gltf.get('nodes', [])):
    name = node.get('name', '')
    if 'Armature' in name:
        arm_node_idx = i
        print(f"  Armature root: nodes[{i}] = {name}")
        # children
        print(f"    children: {node.get('children', [])}")

# bone 名一覧（armature の子孫を辿る）
bone_names = []
def collect_bones(idx, depth=0):
    n = gltf['nodes'][idx]
    bone_names.append((depth, n.get('name', '?'), idx))
    for c in n.get('children', []):
        collect_bones(c, depth + 1)

if arm_node_idx is not None:
    for c in gltf['nodes'][arm_node_idx].get('children', []):
        collect_bones(c)

print(f"\n=== bones (first 30, hierarchical) ===")
for depth, name, idx in bone_names[:30]:
    indent = "  " * (depth + 1)
    print(f"{indent}[{idx}] {name}")
print(f"  ... 全 {len(bone_names)} bones")

# 主要 bone のチェック
key_bone_names = {'shoulder.L', 'upper_arm.L', 'lowarm.L', 'hand.L', 'IKhand.L', 'hips', 'spine', 'head', 'foot.L', 'low_foot.L', 'upper_foot.L'}
found = [name for _, name, _ in bone_names if name in key_bone_names]
print(f"\n主要ボーン発見: {sorted(found)}")
missing = key_bone_names - set(found)
if missing:
    print(f"見つからないボーン: {missing}")

# skin 情報
print(f"\n=== skins: {len(gltf.get('skins', []))} ===")
for si, skin in enumerate(gltf.get('skins', [])):
    print(f"  skin[{si}]: joints={len(skin.get('joints', []))} skeleton={skin.get('skeleton')}")

# meshes と animation の関連
print(f"\n=== animations summary ===")
for anim in gltf.get('animations', []):
    print(f"  {anim.get('name')}: {len(anim['channels'])} channels")
    # 最初の channel の sampler input/output count
    if anim['channels']:
        s = anim['samplers'][anim['channels'][0]['sampler']]
        in_acc = gltf['accessors'][s['input']]
        out_acc = gltf['accessors'][s['output']]
        print(f"    sampler[0]: input.count={in_acc['count']}  output.count={out_acc['count']}")
