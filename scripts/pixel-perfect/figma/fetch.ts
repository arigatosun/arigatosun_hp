/**
 * Figma Dev Mode MCP からの正解値取得（Phase 2 実装予定）
 *
 * 現状はプレースホルダ。Phase 1 では fixtures/<section>.json を手動編集して使う。
 *
 * Phase 2 で実装する流れ:
 *   1. Claude Code 側で Figma MCP を呼び出して get_code を実行
 *   2. レスポンスからCSS数値（width/height/padding/font-size等）をパース
 *   3. プロジェクトのSCSS規約（fluid()のmax値）に変換
 *   4. fixtures/<section>.json に書き出す
 *
 * 注意: このファイル自体が MCP を呼ぶのではなく、
 * Claude Code（このCLIエージェント）が MCP を呼ぶ → このスクリプトが受け取る、
 * という設計が現実的。
 */

console.log('Figma fetch is not yet implemented (Phase 2).');
console.log('See scripts/pixel-perfect/figma/SETUP.md for setup instructions.');
process.exit(0);
