'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ParallaxMotifs.module.scss';

gsap.registerPlugin(ScrollTrigger);

// 各モチーフのパララックスY移動量
const MOTIF_SPEEDS = [
  -80,   // motif 0: 右上の小さな矩形
  -120,  // motif 1: 横長の帯
  -200,  // motif 2: 大きな曲線（右上）
  -60,   // motif 3: 小さな矩形（中央下）
  -90,   // motif 4: 横長の帯（右）
  -180,  // motif 5: 大きな曲線（左）
  -150,  // motif 6: 斜めの帯（左）
  -170,  // motif 7: 大きな曲線（左下）
  -130,  // motif 8: 大きな曲線（中央）
  -50,   // motif 9: 小さな矩形（左上）
  -70,   // motif 10: 小さな矩形（中央上）
  -160,  // motif 11: 大きな曲線（中央）
  -140,  // motif 12: 斜めの帯（左中央）
  -190,  // motif 13: 斜めの帯（左下）
  -100,  // motif 14: 矩形（右下）
  -75,   // motif 15: 小さな矩形（右中央）
  -110,  // motif 16: 曲線（右上）
  -85,   // motif 17: 横長の帯（中央）
];

export default function ParallaxMotifs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const motifs = container.querySelectorAll('[data-motif]');
    const animations: gsap.core.Tween[] = [];

    motifs.forEach((motif, index) => {
      const speed = MOTIF_SPEEDS[index] || -400;

      const tween = gsap.to(motif, {
        y: speed,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      animations.push(tween);
    });

    return () => {
      animations.forEach((tween) => tween.scrollTrigger?.kill());
      animations.forEach((tween) => tween.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <svg
        className={styles.svg}
        viewBox="0 0 1920 1371"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="motif-shadow-sm" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="10" dy="10"/>
            <feGaussianBlur stdDeviation="35"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-shadow-md" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="12" dy="12"/>
            <feGaussianBlur stdDeviation="50"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-shadow-lg" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="44" dy="56"/>
            <feGaussianBlur stdDeviation="100"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-shadow-lg-strong" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="44" dy="56"/>
            <feGaussianBlur stdDeviation="100"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-shadow-lg-extra" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="44" dy="56"/>
            <feGaussianBlur stdDeviation="100"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
        </defs>

        {/* モチーフ 0: 右上の小さな矩形 */}
        <g data-motif="0" filter="url(#motif-shadow-md)">
          <path d="M1792.57 879.304L1961.12 713.798L1870.55 621.561L1702 787.067L1792.57 879.304Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 1: 横長の帯 */}
        <g data-motif="1" filter="url(#motif-shadow-sm)">
          <path d="M1685.17 642.613L1061.08 446.557L1018.08 583.452L1642.17 779.508L1685.17 642.613Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 2: 大きな曲線（右上） */}
        <g data-motif="2" filter="url(#motif-shadow-lg-strong)">
          <path d="M1467.93 252.562L1622.87 481.185C1691.79 582.859 1829.93 609.288 1931.47 540.507L1939.94 534.764L2020.64 653.814L2012.16 659.558C1847.88 770.842 1624.58 730.479 1509.56 570.356L1348.88 333.261L1467.93 252.562Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 3: 小さな矩形（中央下） */}
        <g data-motif="3" filter="url(#motif-shadow-sm)">
          <path d="M931.559 1083.75L987.379 951.563L745.824 849.561L690.005 981.749L931.559 1083.75Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 4: 横長の帯（右） */}
        <g data-motif="4" filter="url(#motif-shadow-md)">
          <path d="M1845.4 1034.39L1887.98 897.356L1637.57 819.561L1595 956.592L1845.4 1034.39Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 5: 大きな曲線（左） */}
        <g data-motif="5" filter="url(#motif-shadow-sm)">
          <path d="M-227.795 982.011L40.2978 829.53C146.599 769.002 183.367 633.532 122.58 526.732L55.5108 409.043L180.088 338.141L247.241 455.946C345.656 628.474 288.654 847.557 120.661 949.49L-156.253 1107.11L-227.595 982.044L-227.795 982.011Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 6: 斜めの帯（左） */}
        <g data-motif="6" filter="url(#motif-shadow-lg)">
          <path d="M582.855 263.556L358.93 638.896L482.157 712.412L706.082 337.073L582.855 263.556Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 7: 大きな曲線（左下） */}
        <g data-motif="7" filter="url(#motif-shadow-lg)">
          <path d="M95.59 747.71L339.578 566.105C442.796 489.306 589.075 510.789 665.974 613.86L672.396 622.482L793.365 532.402L786.943 523.78C662.589 356.9 427.34 319.797 258.069 438.726L5.40248 626.888L95.5336 747.849L95.59 747.71Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 8: 大きな曲線（中央） */}
        <g data-motif="8" filter="url(#motif-shadow-lg)">
          <path d="M937.714 895.244L1229.05 751.723C1324.11 704.892 1441.06 731.44 1507.24 814.622L1513.09 822.08L1561.18 679.906L1558.49 677.636C1450.5 588.733 1300.33 570.183 1174.65 629.723L878.656 775.434L937.826 895.155L937.714 895.244Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 9: 小さな矩形（左上） */}
        <g data-motif="9" filter="url(#motif-shadow-sm)">
          <path d="M324.855 214.561L226.992 275.491L287.922 373.353L385.784 312.423L324.855 214.561Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 10: 小さな矩形（中央上） */}
        <g data-motif="10" filter="url(#motif-shadow-sm)">
          <path d="M1205.68 161.556L1152.06 263.605L1254.11 317.228L1307.73 215.179L1205.68 161.556Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 11: 大きな曲線（中央） */}
        <g data-motif="11" filter="url(#motif-shadow-lg-strong)">
          <path d="M1277.57 834.414L875.86 639.041C906.947 605.294 946.957 582.157 990.375 571.388L892.302 462.56C818.068 496.677 754.7 555.626 716.191 634.555C707.088 653.385 699.321 673.444 693.504 694.067L692.265 698.221L1219 954.411L1277.44 834.356L1277.57 834.414Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 12: 斜めの帯（左中央） */}
        <g data-motif="12" filter="url(#motif-shadow-lg-extra)">
          <path d="M693.169 608.561L364.98 728.921L417.888 873.184L746.076 752.824L693.169 608.561Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 13: 斜めの帯（左下） */}
        <g data-motif="13" filter="url(#motif-shadow-lg-strong)">
          <path d="M275.806 673.561L182 768.1L530.776 1114.17L624.582 1019.63L275.806 673.561Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 14: 矩形（右下） */}
        <g data-motif="14" filter="url(#motif-shadow-md)">
          <path d="M1328.03 1139.06L1406.65 1241.67L1594.16 1098L1515.54 995.387L1328.03 1139.06Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 15: 小さな矩形（右中央） */}
        <g data-motif="15" filter="url(#motif-shadow-md)">
          <path d="M1383.65 815.561L1330.03 917.61L1432.08 971.233L1485.7 869.184L1383.65 815.561Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 16: 曲線（右上） */}
        <g data-motif="16" filter="url(#motif-shadow-sm)">
          <path d="M1706.22 225.931C1803.42 267.372 1859.62 373.259 1839.81 477.621L1838.05 486.836L1976.72 430.601L1976.59 426.989C1973.52 287.181 1889.72 161.445 1762.79 105.019L1657.14 60.0001L1605.13 182.874L1706.08 225.919L1706.22 225.931Z" fill="#E8291C"/>
        </g>

        {/* モチーフ 17: 横長の帯（中央） */}
        <g data-motif="17" filter="url(#motif-shadow-lg)">
          <path d="M1193.03 504.837L1211.63 362.557L951.638 328.561L933.034 470.841L1193.03 504.837Z" fill="#E8291C"/>
        </g>
      </svg>
    </div>
  );
}
