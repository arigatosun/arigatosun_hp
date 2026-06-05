'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ArigatoChat.module.scss';

// ── モックアップ用のダミー会話データ ──
// ※ まだ AI 連携はしておらず、見た目・体験を確認するためのデモ版。
//    本実装時はここをサーバー応答（FAQ / LLM）に差し替える。

type Message = {
  id: number;
  role: 'bot' | 'user';
  // text は改行を含められるよう string[]（段落）で持つ
  lines: string[];
  // 採用導線など、回答に付けるリンク（任意）
  link?: { href: string; label: string };
};

type QuickReply = {
  key: string;
  label: string;
  question: string;
  answer: string[];
  link?: { href: string; label: string };
};

// クイック返信（会社・事業 / メンバー紹介 / 採用・お問い合わせ）
const QUICK_REPLIES: QuickReply[] = [
  {
    key: 'company',
    label: '会社・事業のこと',
    question: 'アリガトサンってどんな会社？',
    answer: [
      'アリガトサンは「妥協なき愛で、世を照らす太陽であれ」を掲げる制作会社だよ🌞',
      'AI開発から IP・クリエイティブ制作まで、関わる人に“想像を超える価値”を届けているんだ。',
      'くわしくは SERVICE ページをのぞいてみてね！',
    ],
    link: { href: '/service', label: 'SERVICE を見る' },
  },
  {
    key: 'member',
    label: 'メンバー紹介',
    question: 'どんなメンバーがいるの？',
    answer: [
      '個性ゆたかな仲間がそろっているよ！',
      'CEO の中村さん、CTO の吉川さん、CCO の廣森さん（クソメガネ！）など…',
      '気になる人のカードをクリックすると、くわしいプロフィールが読めるよ👀',
    ],
  },
  {
    key: 'recruit',
    label: '採用・お問い合わせ',
    question: '相談や採用について知りたい',
    answer: [
      '一緒に挑戦したい仲間、大かんげい！',
      'ご相談・お問い合わせは CONTACT ページからどうぞ📩',
      'きみの「やりたい」を聞かせてね！',
    ],
    link: { href: '/contact', label: 'CONTACT する' },
  },
];

const GREETING: string[] = [
  'こんにちは！アリガトくんだよ🌞',
  'アリガトサンのこと、なんでも聞いてね！',
  '下のボタンから選んでもOKだよ。',
];

// 自由入力に対する暫定の返答（デモ版）
const FALLBACK_ANSWER: string[] = [
  'ごめんね、まだお勉強中で うまく答えられないことがあるんだ🙏',
  'まずは下のボタンから選んでみてね！（このチャットはデモ版だよ）',
];

export default function ArigatoChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'bot', lines: GREETING },
  ]);
  const [input, setInput] = useState('');
  const idRef = useRef(1);
  const messagesRef = useRef<HTMLDivElement>(null);

  const nextId = () => idRef.current++;

  const scrollToBottom = () => {
    // 次の描画後に最下部へ
    requestAnimationFrame(() => {
      const el = messagesRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const pushMessages = (items: Omit<Message, 'id'>[]) => {
    setMessages((prev) => [
      ...prev,
      ...items.map((m) => ({ ...m, id: nextId() })),
    ]);
    scrollToBottom();
  };

  const handleQuickReply = (qr: QuickReply) => {
    pushMessages([
      { role: 'user', lines: [qr.question] },
      { role: 'bot', lines: qr.answer, link: qr.link },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    pushMessages([
      { role: 'user', lines: [text] },
      { role: 'bot', lines: FALLBACK_ANSWER },
    ]);
  };

  return (
    <section className={styles.root} aria-label="アリガトくんチャット（デモ）">
      <header className={styles.header}>
        <div className={styles.avatar}>
          <Image
            src="/images/team/arigato-kun-color.webp"
            alt="アリガトくん"
            width={120}
            height={120}
            className={styles.avatarImg}
          />
        </div>
        <div className={styles.headerText}>
          <p className={styles.role}>CHARACTER</p>
          <h1 className={styles.name}>アリガトくん</h1>
          <p className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            AIアシスタント（デモ版）
          </p>
        </div>
      </header>

      <div className={styles.window}>
        <div className={styles.messages} ref={messagesRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${styles.row} ${
                m.role === 'bot' ? styles.rowBot : styles.rowUser
              }`}
            >
              {m.role === 'bot' && (
                <span className={styles.bubbleAvatar} aria-hidden="true">
                  <Image
                    src="/images/team/arigato-kun-color.webp"
                    alt=""
                    width={56}
                    height={56}
                    className={styles.bubbleAvatarImg}
                  />
                </span>
              )}
              <div
                className={`${styles.bubble} ${
                  m.role === 'bot' ? styles.bubbleBot : styles.bubbleUser
                }`}
              >
                {m.lines.map((line, i) => (
                  <p key={i} className={styles.bubbleLine}>
                    {line}
                  </p>
                ))}
                {m.link && (
                  <Link href={m.link.href} className={styles.bubbleLink}>
                    {m.link.label} &gt;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.quickReplies}>
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr.key}
              type="button"
              className={styles.chip}
              onClick={() => handleQuickReply(qr)}
            >
              {qr.label}
            </button>
          ))}
        </div>

        <form className={styles.inputRow} onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力…"
            className={styles.input}
            aria-label="メッセージを入力"
          />
          <button type="submit" className={styles.sendButton}>
            送信
          </button>
        </form>
      </div>

      <p className={styles.note}>
        ※ こちらはイメージ確認用のデモ版です。実際の応答内容は今後調整します。
      </p>
    </section>
  );
}
