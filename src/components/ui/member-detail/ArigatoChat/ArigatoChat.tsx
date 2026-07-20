'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  WELCOME,
  INPUT_PLACEHOLDER,
  COPYRIGHT,
  matchAnswer,
} from '@/data/arigato-chat';
import styles from './ArigatoChat.module.scss';

const CHAR_SRC = '/images/sections/arigato-chat/arigatokun.webp';

type Message = {
  id: number;
  role: 'bot' | 'user';
  // 改行（段落）を保持できるよう行配列で持つ。
  lines: string[];
};

// 送信アイコン（Figma 支給 SVG。色は CSS の currentColor 経由でブランドレッド）。
function SendIcon() {
  return (
    <svg
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M25 1.00003L11.8 14.2M11.8 14.2L1.00001 9.40003L25 1.00003L16.6 25L11.8 14.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 受け取ったテキストを段落配列（バブルの行）に整形する。空行は落とす。
function toLines(text: string): string[] {
  return text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
}

// ボット応答内のマークダウンを React ノードに変換する。
//   [表示テキスト](/path) → 内部リンク（next/link） / 外部URLは別タブ
//   **太字**            → <strong>
// それ以外はそのままテキスト。
function renderRich(line: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      const text = match[1];
      const url = match[2];
      if (url.startsWith('/')) {
        nodes.push(
          <Link key={key++} href={url} className={styles.bubbleLink}>
            {text}
          </Link>,
        );
      } else {
        nodes.push(
          <a
            key={key++}
            href={url}
            className={styles.bubbleLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>,
        );
      }
    } else if (match[3] !== undefined) {
      nodes.push(<strong key={key++}>{match[3]}</strong>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < line.length) nodes.push(line.slice(lastIndex));
  return nodes;
}

export default function ArigatoChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  // 応答ストリーミング中はフォームをロックして二重送信を防ぐ。
  const [isStreaming, setIsStreaming] = useState(false);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasConversation = messages.length > 0;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  // 指定 id のメッセージの lines を更新する。
  const setMessageLines = (id: number, lines: string[]) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, lines } : m)));
    scrollToBottom();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    const userMessage: Message = { id: idRef.current++, role: 'user', lines: [text] };
    const botId = idRef.current++;
    // ユーザー発話 + 空のボット応答（タイピング表示）を同時に追加する。
    setMessages((prev) => [...prev, userMessage, { id: botId, role: 'bot', lines: [] }]);
    scrollToBottom();
    setIsStreaming(true);

    // サーバーへ渡す会話履歴（最新ユーザー発話を含む）。
    const history = [...messages, userMessage].map((m) => ({
      role: m.role,
      text: m.lines.join('\n'),
    }));

    try {
      const res = await fetch('/api/arigato-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      // 非ストリーム（キー未設定/レート超過/エラー）は FAQ 定型文へフォールバック。
      if (!res.ok || !res.body) {
        setMessageLines(botId, matchAnswer(text));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessageLines(botId, toLines(acc));
      }
      acc += decoder.decode();
      const finalLines = toLines(acc);
      // 何も返らなかった場合も FAQ にフォールバック。
      setMessageLines(botId, finalLines.length > 0 ? finalLines : matchAnswer(text));
    } catch {
      setMessageLines(botId, matchAnswer(text));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <section
      className={`${styles.root} ${
        hasConversation ? styles.chatting : styles.welcomeMode
      }`}
      aria-label="アリガトくんチャット"
    >
      <div className={styles.stage}>
        <div className={styles.scrollArea} ref={scrollRef}>
          {
            // ── キャラクター紹介ヒーロー ──
            // 会話開始後も描画したままにして、スクロールを上まで戻すと再び見えるようにする
            // （以前は会話開始と同時に DOM から外していたため初期画面に戻れなかった）。
            <div className={styles.welcome}>
              <div className={styles.welcomeChar}>
                <Image
                  src={CHAR_SRC}
                  alt="アリガトくん"
                  width={386}
                  height={383}
                  className={styles.welcomeCharImg}
                  priority
                />
              </div>
              <div className={styles.welcomeText}>
                {/* SP では「キャラ + ここ(head)」までを固定し、welcomeBody 以降をスクロールさせる */}
                <div className={styles.welcomeHead}>
                  <p className={styles.welcomeOverline}>{WELCOME.overline}</p>
                  <h1 className={styles.welcomeName}>
                    <span className={styles.welcomeNameJp}>{WELCOME.name}</span>
                    <span className={styles.welcomeNameEn}>{WELCOME.nameEn}</span>
                  </h1>
                </div>
                {/* SP ではこのブロックだけが独立してスクロールする（上端＝固定部との区切り） */}
                <div className={styles.welcomeBody}>
                  <span className={styles.welcomeDivider} aria-hidden="true" />
                  <p className={styles.welcomeCatch}>
                    {WELCOME.catchphrase[0]}
                    {/* SP のみ「から」の後で改行 */}
                    <span className={styles.brSpOnly} aria-hidden="true" />
                    {WELCOME.catchphrase[1]}
                  </p>
                  <div className={styles.welcomeIntro}>
                    {WELCOME.intro.map((paragraph, pi) => (
                      <p key={pi} className={styles.welcomeIntroParagraph}>
                        {paragraph.map((line, li) => (
                          <span key={li}>
                            {line}
                            {li < paragraph.length - 1 &&
                              // 2行目→3行目の改行は PC のみ（SP では結合して自然折り返し）
                              (li === 1 ? (
                                <br className={styles.brPcOnly} />
                              ) : (
                                <br />
                              ))}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }
          {hasConversation && (
            // ── 会話開始後: チャットバブル（ヒーローの下に積む） ──
            <div className={styles.messages}>
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className={styles.rowUser}>
                    <div className={styles.bubbleUser}>
                      {m.lines.map((line, i) => (
                        <p key={i} className={styles.bubbleLine}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className={styles.rowBot}>
                    <div className={styles.bubbleBot}>
                      <span className={styles.botAvatar} aria-hidden="true">
                        <Image
                          src={CHAR_SRC}
                          alt=""
                          width={77}
                          height={76}
                          className={styles.botAvatarImg}
                        />
                      </span>
                      <div className={styles.bubbleBotText}>
                        {m.lines.length === 0 ? (
                          <span className={styles.typing} aria-label="入力中">
                            <span />
                            <span />
                            <span />
                          </span>
                        ) : (
                          m.lines.map((line, i) => (
                            <p key={i} className={styles.bubbleLine}>
                              {renderRich(line)}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <form className={styles.inputBar} onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={INPUT_PLACEHOLDER}
            className={styles.input}
            aria-label="メッセージを入力"
            disabled={isStreaming}
          />
          <button
            type="submit"
            className={styles.sendButton}
            aria-label="送信"
            disabled={isStreaming || input.trim() === ''}
          >
            <SendIcon />
          </button>
        </form>

        <p className={styles.disclaimer}>
          ※ AIによる回答のため、内容が正確でない場合があります。重要な事項は[
          <Link href="/contact" className={styles.disclaimerLink}>
            お問い合わせ
          </Link>
          ]よりご確認ください。
          <br />
          ※ 入力された内容は、回答の生成に利用されます。詳しくは[
          <Link href="/privacy" className={styles.disclaimerLink}>
            プライバシーポリシー
          </Link>
          ]をご覧ください。
        </p>
      </div>

      <div className={styles.copyright}>
        <span className={styles.copyrightLeft}>{COPYRIGHT.left}</span>
        <span className={styles.copyrightRight}>{COPYRIGHT.right}</span>
      </div>
    </section>
  );
}
