import FooterCharacterLoader from '@/components/three/FooterCharacterLoader';
import styles from './page.module.scss';

// ヒーロー手振り 3D（meshopt 圧縮版）の確認用デバッグページ。
// /debug/wave-compare でアクセスできる（Header/Footer なし）。
// ※ 圧縮前後の比較は完了し元 .glb は削除済み。現行（圧縮版）の表示確認用として残置。

export default function WaveComparePage() {
  return (
    <main className={styles.root}>
      <h1 className={styles.title}>WAVE CHARACTER（meshopt 圧縮版）</h1>

      <div className={styles.pair}>
        <div className={styles.cell}>
          <div className={styles.label}>現行ヒーローキャラ</div>
          <div className={styles.canvasWrap}>
            <FooterCharacterLoader
              charPosition={[-20.93, -0.75, 0]}
              charRotationY={0}
              cameraPosition={[2, -5, 28]}
              orthographic
              cameraZoom={15}
            />
          </div>
          <div className={styles.note}>
            arigatokunn_wave_meshopt.glb — 6MB（meshopt 圧縮 / 元 17MB から -67%）
          </div>
        </div>
      </div>
    </main>
  );
}
