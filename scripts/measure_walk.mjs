import { NodeIO } from '@gltf-transform/core';
const io = new NodeIO();
const doc = await io.read('public/models/arigatokunn_unified.glb');
const root = doc.getRoot();
for (const anim of root.listAnimations()) {
  let dur = 0;
  const trackNames = new Set();
  for (const ch of anim.listChannels()) {
    const samp = ch.getSampler();
    const input = samp.getInput();
    const target = ch.getTargetNode();
    const path = ch.getTargetPath();
    trackNames.add(`${target?.getName()}.${path}`);
    if (input) {
      const arr = input.getArray();
      const max = arr[arr.length-1];
      if (max > dur) dur = max;
    }
  }
  console.log('---', anim.getName(), 'duration=', dur.toFixed(3), 's', 'channels=', anim.listChannels().length);
  // Look for root-related tracks
  for (const name of trackNames) {
    if (name.toLowerCase().includes('root')) console.log('   ROOT:', name);
  }
}
