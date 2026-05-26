import { Fragment } from 'react';
import type { ServiceOrgBubble } from '@/types/service';
import styles from './ServiceOrgBubbles.module.scss';

type ServiceOrgBubblesProps = {
  bubbles: ServiceOrgBubble[];
};

/**
 * CREATOR FIRST セクションの右側に置くギルド型組織のバブル図。
 * Figma Group 1022 (667x667) を 100% コンテナとし、その内側に
 *  - core: 中央の「作者」バブル（最も赤味が強い）
 *  - inner: プロデュース / ディレクション（中濃度）
 *  - outer: コンテンツ企画・制作 / グッズ / アプリ・ゲーム開発 / 3Dデザイン / グッズ管理・EC / コラボレーション
 * を absolute 配置する。SP では円形配置をやめ縦並びに展開する。
 */
export default function ServiceOrgBubbles({ bubbles }: ServiceOrgBubblesProps) {
  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        {bubbles.map((bubble, i) => (
          <div
            key={i}
            className={`${styles.bubble} ${styles[bubble.ring]}`}
            style={{
              left: `${bubble.leftPct}%`,
              top: `${bubble.topPct}%`,
              width: `${bubble.sizePct}%`,
              aspectRatio: '1 / 1',
            }}
          >
            <span className={styles.label}>
              {bubble.text.split('\n').map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
