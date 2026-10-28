import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './LegalMarkdown.module.scss';

// 規約・ポリシーの Markdown 本文を描画する(サーバーコンポーネント)。
// 表はスマホ幅で横スクロールできるよう枠で包む。
export default function LegalMarkdown({ source }: { source: string }) {
  return (
    <div className={styles.body}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className={styles.tableWrap}>
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {source}
      </Markdown>
    </div>
  );
}
