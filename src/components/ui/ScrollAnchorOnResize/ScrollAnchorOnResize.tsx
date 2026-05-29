'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// レスポンシブ境界（1024px / @include sp・pc）をまたいでウィンドウ幅を変えると、
// ServiceSection の横スクロールが gsap.matchMedia('(min-width:1024px)') + pin で
// 生成/破棄され、footer の上にある巨大な pin-spacer の高さが変化する。
// このとき ScrollTrigger.refresh() がスクロール位置をトップへ飛ばすため、
// footer を見ていたのに先頭まで戻ってしまう。
//
// 対策: refresh の直前に「ビューポート最上部を占めている、高さが変わる
// ServiceSection よりも“下”の要素」とそのオフセットを記録し、refresh 直後に
// 同じ要素が同じ位置へ来るようスクロールを復元する。これで見ていた箇所
// （footer / works / news / message）を保ったままレイアウトを切り替えられる。
//
// ※ ServiceSection より上（hero / about / service 自体）を見ている時は基準要素が
//   無いため復元しない（GSAP 既定動作のまま）。height が変わる領域を基準にしても
//   位置を保てないため、あえて介入しない。
export default function ScrollAnchorOnResize() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let anchorEl: HTMLElement | null = null;
    let anchorTop = 0;

    // service セクションより後ろ（DOM順で下）にあるブロック + footer を基準候補にする。
    const getCandidates = (): HTMLElement[] => {
      const candidates: HTMLElement[] = [];
      const service = document.querySelector<HTMLElement>('[data-section="service"]');
      const pageRoot = service?.parentElement;
      if (pageRoot && service) {
        const blocks = Array.from(pageRoot.children) as HTMLElement[];
        const serviceIdx = blocks.indexOf(service);
        if (serviceIdx >= 0) {
          candidates.push(...blocks.slice(serviceIdx + 1));
        }
      }
      const footer = document.querySelector<HTMLElement>('footer');
      if (footer) candidates.push(footer);
      return candidates;
    };

    // ビューポート最上端を跨いでいる（= 最上部に表示されている）要素を選ぶ。
    const capture = () => {
      anchorEl = null;
      let bestTop = -Infinity;
      for (const el of getCandidates()) {
        const top = el.getBoundingClientRect().top;
        // top <= 1: 上端が画面上端以上に来ている要素のうち、最も 0 に近いもの
        if (top <= 1 && top > bestTop) {
          bestTop = top;
          anchorEl = el;
        }
      }
      if (anchorEl) anchorTop = bestTop;
    };

    const restore = () => {
      if (!anchorEl) return;
      const newTop = anchorEl.getBoundingClientRect().top;
      const delta = newTop - anchorTop;
      anchorEl = null;
      // 微小なズレ（通常リサイズ）は無視。境界跨ぎの大ジャンプのみ復元する。
      if (Math.abs(delta) > 1) {
        window.scrollTo({ top: window.scrollY + delta, left: 0 });
      }
    };

    ScrollTrigger.addEventListener('refreshInit', capture);
    ScrollTrigger.addEventListener('refresh', restore);
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', capture);
      ScrollTrigger.removeEventListener('refresh', restore);
    };
  }, []);

  return null;
}
