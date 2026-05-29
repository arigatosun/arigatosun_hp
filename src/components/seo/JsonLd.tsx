/**
 * 構造化データ（JSON-LD）を出力する小さなサーバーコンポーネント。
 * data はアプリ側で生成する信頼値のため dangerouslySetInnerHTML で問題ない。
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
