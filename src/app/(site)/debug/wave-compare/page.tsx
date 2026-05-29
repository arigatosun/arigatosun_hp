import FooterCharacterLoader from '@/components/three/FooterCharacterLoader';
import styles from './page.module.scss';

// 手振り 3D の 圧縮前後 比較デバッグページ。
// /debug/wave-compare でアクセスできる（Header/Footer なし）。
//
// 2 体並べて比較（Tier2 meshopt 圧縮の品質確認用）:
//   左: 元 wave.glb (17MB / 無圧縮・現行本番)
//   右: meshopt 圧縮版 (6MB)

export default function WaveComparePage() {
  return (
    <main className={styles.root}>
      <h1 className={styles.title}>WAVE CHARACTER — meshopt 圧縮 前後比較</h1>

      <div className={styles.pair}>
        <div className={styles.cell}>
          <div className={styles.label}>元（無圧縮）</div>
          <div className={styles.canvasWrap}>
            <FooterCharacterLoader
              charPosition={[-20.93, -0.75, 0]}
              charRotationY={0}
              cameraPosition={[2, -5, 28]}
              orthographic
              cameraZoom={15}
            />
          </div>
          <div className={styles.note}>arigatokunn_wave.glb — 17MB（現行本番）</div>
        </div>

        <div className={styles.cell}>
          <div className={styles.label}>meshopt 圧縮版</div>
          <div className={styles.canvasWrap}>
            <FooterCharacterLoader
              glbPath="/models/arigatokunn_wave_meshopt.glb"
              meshopt
              charPosition={[-20.93, -0.75, 0]}
              charRotationY={0}
              cameraPosition={[2, -5, 28]}
              orthographic
              cameraZoom={15}
            />
          </div>
          <div className={styles.note}>arigatokunn_wave_meshopt.glb — 6MB（-67%）</div>
        </div>
      </div>
    </main>
  );
}
