'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  WELCOME,
  INPUT_PLACEHOLDER,
  COPYRIGHT,
  BOT_ANSWER,
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

export default function ArigatoChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasConversation = messages.length > 0;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: idRef.current++, role: 'user', lines: [text] },
      { id: idRef.current++, role: 'bot', lines: BOT_ANSWER },
    ]);
    scrollToBottom();
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
          {!hasConversation ? (
            // ── 会話開始前: キャラクター紹介ヒーロー ──
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
                <p className={styles.welcomeOverline}>{WELCOME.overline}</p>
                <h1 className={styles.welcomeName}>
                  <span className={styles.welcomeNameJp}>{WELCOME.name}</span>
                  <span className={styles.welcomeNameEn}>{WELCOME.nameEn}</span>
                </h1>
                <span className={styles.welcomeDivider} aria-hidden="true" />
                <p className={styles.welcomeCatch}>{WELCOME.catchphrase}</p>
                <div className={styles.welcomeIntro}>
                  {WELCOME.intro.map((paragraph, pi) => (
                    <p key={pi} className={styles.welcomeIntroParagraph}>
                      {paragraph.map((line, li) => (
                        <span key={li}>
                          {line}
                          {li < paragraph.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // ── 会話開始後: チャットバブル ──
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
                        {m.lines.map((line, i) => (
                          <p key={i} className={styles.bubbleLine}>
                            {line}
                          </p>
                        ))}
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
          />
          <button type="submit" className={styles.sendButton} aria-label="送信">
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
