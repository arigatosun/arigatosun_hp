'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ParallaxMotifs.module.scss';

gsap.registerPlugin(ScrollTrigger);

// 各モチーフの設定（Figma「Group 868」書き出しの17シェイプ順）
// scrollY: スクロール時のY移動量 / scrollRotation: スクロール時の回転量(度)
// floatY: 浮遊Y振幅(px) / floatRotation: 浮遊回転振幅(度) / floatDuration: 浮遊1サイクル秒数
type MotifConfig = {
  scrollY: number;
  scrollRotation: number;
  floatY: number;
  floatRotation: number;
  floatDuration: number;
};

const MOTIF_CONFIG: MotifConfig[] = [
  { scrollY: -380, scrollRotation: 10,  floatY: 22, floatRotation: 4.0, floatDuration: 3.6 }, // 0
  { scrollY: -300, scrollRotation: -6,  floatY: 30, floatRotation: 3.5, floatDuration: 3.2 }, // 1
  { scrollY: -480, scrollRotation: 12,  floatY: 20, floatRotation: 5.0, floatDuration: 4.0 }, // 2
  { scrollY: -620, scrollRotation: -10, floatY: 18, floatRotation: 3.5, floatDuration: 4.4 }, // 3
  { scrollY: -340, scrollRotation: 8,   floatY: 26, floatRotation: 4.5, floatDuration: 3.0 }, // 4
  { scrollY: -560, scrollRotation: -12, floatY: 18, floatRotation: 4.0, floatDuration: 4.2 }, // 5
  { scrollY: -500, scrollRotation: 9,   floatY: 24, floatRotation: 5.0, floatDuration: 3.5 }, // 6
  { scrollY: -240, scrollRotation: -8,  floatY: 38, floatRotation: 6.5, floatDuration: 2.7 }, // 7
  { scrollY: -540, scrollRotation: 11,  floatY: 20, floatRotation: 4.5, floatDuration: 3.8 }, // 8
  { scrollY: -280, scrollRotation: -5,  floatY: 34, floatRotation: 6.0, floatDuration: 2.9 }, // 9
  { scrollY: -460, scrollRotation: 10,  floatY: 22, floatRotation: 4.0, floatDuration: 3.4 }, // 10
  { scrollY: -220, scrollRotation: 7,   floatY: 40, floatRotation: 7.0, floatDuration: 2.6 }, // 11
  { scrollY: -260, scrollRotation: -6,  floatY: 36, floatRotation: 6.5, floatDuration: 2.8 }, // 12
  { scrollY: -520, scrollRotation: 13,  floatY: 20, floatRotation: 3.5, floatDuration: 4.1 }, // 13
  { scrollY: -400, scrollRotation: -11, floatY: 24, floatRotation: 4.5, floatDuration: 3.3 }, // 14
  { scrollY: -360, scrollRotation: 8,   floatY: 28, floatRotation: 5.0, floatDuration: 3.1 }, // 15
  { scrollY: -440, scrollRotation: -9,  floatY: 22, floatRotation: 4.0, floatDuration: 3.7 }, // 16
];

export default function ParallaxMotifs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollMotifs = container.querySelectorAll('[data-motif]');
    const floatMotifs = container.querySelectorAll('[data-float]');
    const scrollAnimations: gsap.core.Tween[] = [];
    const floatAnimations: gsap.core.Tween[] = [];

    // スクロールパララックス（外側の<g>に適用）
    scrollMotifs.forEach((motif, index) => {
      const config = MOTIF_CONFIG[index];
      if (!config) return;

      gsap.set(motif, { force3D: true });

      const tween = gsap.to(motif, {
        y: config.scrollY,
        rotation: config.scrollRotation,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      scrollAnimations.push(tween);
    });

    // 浮遊アニメーション（内側の<g>に適用、常時ループ）
    floatMotifs.forEach((motif, index) => {
      const config = MOTIF_CONFIG[index];
      if (!config) return;

      gsap.set(motif, { force3D: true });

      // 各モチーフに異なる開始位相を与えて動きをばらけさせる
      const randomDelay = index * 0.3;

      const tween = gsap.to(motif, {
        y: config.floatY,
        rotation: config.floatRotation,
        duration: config.floatDuration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: randomDelay,
        force3D: true,
      });

      floatAnimations.push(tween);
    });

    return () => {
      scrollAnimations.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      floatAnimations.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <svg
        className={styles.svg}
        viewBox="0 0 1920 1919"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="motif-f0" x="1211.4" y="699.932" width="938.362" height="746.557" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f1" x="1644.7" y="406.465" width="378.081" height="292.875" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f2" x="1101" y="1558.66" width="436.641" height="360.182" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="9" dy="9"/>
            <feGaussianBlur stdDeviation="37.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f3" x="-403.503" y="1049.25" width="813.137" height="623.488" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f4" x="998.676" y="400.77" width="705.767" height="671.49" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f5" x="1130.01" y="551.404" width="944.825" height="810.766" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f6" x="761.534" y="1115.18" width="931.47" height="633.477" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f7" x="1015.31" y="920.273" width="252.933" height="252.934" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f8" x="680.941" y="980.82" width="856.205" height="767.4" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f9" x="1287.15" y="0" width="657.449" height="521.146" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f10" x="-118.257" y="1279.78" width="780.866" height="497.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f11" x="-52.6885" y="645.77" width="405.271" height="355.393" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="9" dy="9"/>
            <feGaussianBlur stdDeviation="37.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f12" x="632.996" y="1475.24" width="297.933" height="297.934" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="9" dy="9"/>
            <feGaussianBlur stdDeviation="37.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f13" x="1486.79" y="635.047" width="506.452" height="453.416" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f14" x="1443.52" y="1054.45" width="546.563" height="583.689" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f15" x="-209.064" y="840.025" width="396.239" height="394.93" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="9" dy="9"/>
            <feGaussianBlur stdDeviation="37.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f16" x="1349.43" y="1184.46" width="728.503" height="481.826" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
        </defs>

        <g data-motif="0"><g data-float="0" filter="url(#motif-f0)"><path d="M1441.54 807.932L1588.77 1025.19C1654.27 1121.81 1785.54 1146.92 1882.03 1081.56L1890.08 1076.1L1966.77 1189.24L1958.71 1194.69C1802.6 1300.45 1590.4 1262.09 1481.1 1109.93L1328.4 884.619L1441.54 807.932Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="1"><g data-float="1" filter="url(#motif-f1)"><path d="M1962.79 584.475L1932.76 451.465L1689.7 506.33L1719.73 639.34L1962.79 584.475Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="2"><g data-float="2" filter="url(#motif-f2)"><path d="M1411.99 1834.84L1453.64 1700.77L1208.65 1624.66L1167 1758.72L1411.99 1834.84Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="3"><g data-float="3" filter="url(#motif-f3)"><path d="M226.544 1612.73L98.7104 1348.99C47.9583 1244.41 -78.1999 1201.08 -183.27 1252.05L-299.057 1308.29L-358.503 1185.73L-242.601 1129.42C-72.8546 1046.88 131.324 1114.62 217.482 1280.29L349.634 1552.71L226.587 1612.55L226.544 1612.73Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="4"><g data-float="4" filter="url(#motif-f4)"><path d="M1433.77 508.77L1115.68 775.828L1203.35 880.26L1521.44 613.202L1433.77 508.77Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="5"><g data-float="5" filter="url(#motif-f5)"><path d="M1766.36 659.547L1626.5 912.489C1567.32 1019.47 1432.29 1058.3 1325.28 999.288L1316.34 994.348L1247.01 1119.79L1255.96 1124.73C1429.08 1220.34 1647.23 1160.1 1747.04 990.729L1891.84 728.705L1766.35 659.405L1766.36 659.547Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="6"><g data-float="6" filter="url(#motif-f6)"><path d="M948.872 1556.65L1205.83 1385.7C1289.66 1329.92 1403.12 1340.6 1475.68 1410.87L1482.11 1417.19L1510 1277.31L1507.19 1275.5C1394.53 1204.96 1250.74 1205.89 1139.6 1277.4L878.534 1450.99L948.967 1556.56L948.872 1556.65Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="7"><g data-float="7" filter="url(#motif-f7)"><path d="M1111.27 965.274L1060.31 1062.25L1157.29 1113.21L1208.24 1016.23L1111.27 965.274Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="8"><g data-float="8" filter="url(#motif-f8)"><path d="M1354.15 1442.19L972.408 1256.53C1001.95 1224.46 1039.97 1202.47 1081.23 1192.24L988.033 1088.82C917.49 1121.24 857.272 1177.26 820.677 1252.27C812.027 1270.16 804.646 1289.22 799.118 1308.82L797.941 1312.77L1298.49 1556.22L1354.02 1442.13L1354.15 1442.19Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="9"><g data-float="9" filter="url(#motif-f9)"><path d="M1439.03 329.146L1761.6 249.791L1726.71 107.999L1404.15 187.354L1439.03 329.146Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="10"><g data-float="10" filter="url(#motif-f10)"><path d="M18.3198 1387.78L-1.25684 1512.82L460.033 1585.04L479.609 1460L18.3198 1387.78Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="11"><g data-float="11" filter="url(#motif-f11)"><path d="M64.6331 711.769L13.3115 823.379L217.262 917.161L268.583 805.551L64.6331 711.769Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="12"><g data-float="12" filter="url(#motif-f12)"><path d="M749.953 1541.24L698.996 1638.22L795.972 1689.18L846.929 1592.2L749.953 1541.24Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="13"><g data-float="13" filter="url(#motif-f13)"><path d="M1635.11 820.637C1734.47 835.179 1811.74 918.872 1818.82 1019.57L1819.43 1028.46L1933.24 943.206L1932.24 939.919C1895.56 812.192 1788.12 716.942 1657.81 695.829L1549.82 680.046L1531.79 805.55L1634.97 820.661L1635.11 820.637Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="14"><g data-float="14" filter="url(#motif-f14)"><path d="M1690.88 1446.14L1807.09 1374.8L1676.73 1162.44L1560.52 1233.78L1690.88 1446.14Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="15"><g data-float="15" filter="url(#motif-f15)"><path d="M-56.9952 1150.96L103.175 993.678L17.1057 906.026L-143.064 1063.3L-56.9952 1150.96Z" fill="var(--color-primary)"/></g></g>
        <g data-motif="16"><g data-float="16" filter="url(#motif-f16)"><path d="M1962.62 1229.46L1394.43 1481.66L1449.75 1606.29L2017.94 1354.09L1962.62 1229.46Z" fill="var(--color-primary)"/></g></g>
      </svg>
    </div>
  );
}
