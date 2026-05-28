import FooterCharacterLoader from '@/components/three/FooterCharacterLoader';
import styles from './page.module.scss';

// 手振り 3D の マテリアル比較デバッグページ。
// /debug/wave-compare でアクセスできる（Header/Footer なし）。
//
// 2 体並べて比較:
//   左: 旧 wave.glb (Procedural Clay = 動作実績あり、reference)
//   右: Simple        (Clay rough baked)

export default function WaveComparePage() {
  return (
    <main className={styles.root}>
      <h1 className={styles.title}>WAVE CHARACTER — material compare</h1>

      <div className={styles.pair}>
        <div className={styles.cell}>
          <div className={styles.label}>旧 wave.glb (Reference)</div>
          <div className={styles.canvasWrap}>
            <FooterCharacterLoader
              charPosition={[-20.93, -0.75, 0]}
              charRotationY={0}
              cameraPosition={[2, -5, 28]}
              orthographic
              cameraZoom={15}
            />
          </div>
          <div className={styles.note}>arigatokunn_wave.glb (現行・本番使用)</div>
        </div>

        <div className={styles.cell}>
          <div className={styles.label}>Simple (Clay rough)</div>
          <div className={styles.canvasWrap}>
            <FooterCharacterLoader
              glbPath="/models/arigatokunn_wave_simple.glb"
              charPosition={[-20.93, -0.75, 0]}
              charRotationY={0}
              cameraPosition={[2, -5, 28]}
              orthographic
              cameraZoom={15}
            />
          </div>
          <div className={styles.note}>arigatokunn_wave_simple.glb</div>
        </div>
      </div>
    </main>
  );
}
