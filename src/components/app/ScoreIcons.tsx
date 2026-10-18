"use client";

import { useId } from "react";

type ScoreIconProps = { size?: number; className?: string };

// Approved dimensional SVG artwork (18 October 2026): lightning for the
// streak, an explicitly labelled badge for XP. Each instance owns its gradient
// IDs so desktop/mobile headers and specimens can coexist without collisions.
// Parent chips supply accessible names and tooltips; these marks are decorative.

export function StreakBolt({ size = 24, className = "" }: ScoreIconProps) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
      <defs>
      <linearGradient id={`${id}-bolt-depth`} x1="34" y1="33" x2="91" y2="111" gradientUnits="userSpaceOnUse">
      <stop stopColor="#9A660D"/>
      <stop offset=".46" stopColor="#69400B"/>
      <stop offset="1" stopColor="#37280E"/>
      </linearGradient>
      <linearGradient id={`${id}-bolt-face`} x1="42" y1="19" x2="84" y2="99" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFF2B1"/>
      <stop offset=".27" stopColor="#FFE071"/>
      <stop offset=".62" stopColor="#EFB83D"/>
      <stop offset="1" stopColor="#BD7D1B"/>
      </linearGradient>
      <linearGradient id={`${id}-bolt-bevel`} x1="70" y1="14" x2="55" y2="109" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFFDE4"/>
      <stop offset=".38" stopColor="#FFF1A4"/>
      <stop offset="1" stopColor="#EAB744"/>
      </linearGradient>
      <linearGradient id={`${id}-bolt-fold`} x1="79" y1="42" x2="47" y2="112" gradientUnits="userSpaceOnUse">
      <stop stopColor="#F2BD48"/>
      <stop offset=".45" stopColor="#DA9829"/>
      <stop offset="1" stopColor="#A16411"/>
      </linearGradient>
      <linearGradient id={`${id}-bolt-edge`} x1="79" y1="15" x2="36" y2="69" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFFFEA"/>
      <stop offset="1" stopColor="#FFDA72"/>
      </linearGradient>
      </defs>
      <path d="M77 14 31 66Q29 69 33 70L56 74 43 112Q42 116 46 113L96 58Q99 55 95 54L71 50 81 17Q82 13 77 14Z" transform="translate(3 6)" fill={`url(#${id}-bolt-depth)`}/>
      <path d="M77 14 31 66Q29 69 33 70L56 74 43 112Q42 116 46 113L96 58Q99 55 95 54L71 50 81 17Q82 13 77 14Z" fill={`url(#${id}-bolt-face)`}/>
      <path d="M77 17 38 66 63 68 47 106 56 74 33 70Q29 69 31 66L77 14Q82 13 81 17L71 50 65 54Z" fill={`url(#${id}-bolt-bevel)`}/>
      <path d="M65 54 94 57 47 106 63 68 57 68 43 112Q42 116 46 113L96 58Q99 55 95 54L71 50Z" fill={`url(#${id}-bolt-fold)`}/>
      <path d="M77 16 32 67" stroke={`url(#${id}-bolt-edge)`} strokeWidth="1.25" strokeLinecap="round"/>
      <path d="M34 69 58 73" stroke="#FFF6C5" strokeOpacity=".55" strokeWidth=".8" strokeLinecap="round"/>
    </svg>
  );
}

export function XpBadge({ size = 24, className = "" }: ScoreIconProps) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
      <defs>
      <linearGradient id={`${id}-xp-edge`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#969de7"/>
      <stop offset="38%" stopColor="#555d9f"/>
      <stop offset="62%" stopColor="#303a76"/>
      <stop offset="100%" stopColor="#18244f"/>
      </linearGradient>
      <linearGradient id={`${id}-xp-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f1edff"/>
      <stop offset="20%" stopColor="#b6b3ee"/>
      <stop offset="46%" stopColor="#828ddd"/>
      <stop offset="55%" stopColor="#c7d1ff"/>
      <stop offset="77%" stopColor="#788bd1"/>
      <stop offset="100%" stopColor="#4b5d9b"/>
      </linearGradient>
      <linearGradient id={`${id}-xp-face`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#7b80c5"/>
      <stop offset="45%" stopColor="#505a9b"/>
      <stop offset="100%" stopColor="#253766"/>
      </linearGradient>
      <linearGradient id={`${id}-xp-letters`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff"/>
      <stop offset="60%" stopColor="#e0e6ff"/>
      <stop offset="100%" stopColor="#b7caff"/>
      </linearGradient>
      </defs>
      <path d="M65 14Q69 14 73 16L102 33Q108 36 108 43V80Q108 87 102 90L73 107Q67 111 61 107L32 90Q26 87 26 80V43Q26 36 32 33L61 16Q63 14 65 14Z" transform="translate(0 7)" fill={`url(#${id}-xp-edge)`}/>
      <path d="M65 14Q69 14 73 16L102 33Q108 36 108 43V80Q108 87 102 90L73 107Q67 111 61 107L32 90Q26 87 26 80V43Q26 36 32 33L61 16Q63 14 65 14Z" fill={`url(#${id}-xp-rim)`}/>
      <path d="M66 24 98 42V79L66 98 35 79V42Z" fill={`url(#${id}-xp-face)`}/>
      <path d="M35 42 66 24 98 42" stroke="#ebeaff" strokeOpacity=".6" strokeWidth="1"/>
      <path d="M35 79 66 98 98 79" stroke="#bacdff" strokeOpacity=".65" strokeWidth="1"/>
      <path d="M30 42Q30 39 35 36L63 20Q66 18 70 20L99 37" stroke="#f3f2ff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity=".85"/>
      <g transform="translate(6.575 5.325) scale(.85)">
      <path d="M44 49H53L60 59 67 49H76L64 65 76 82H67L60 71 53 82H44L56 65Z" fill="#15264f" transform="translate(0 1.6)"/>
      <path d="M44 49H53L60 59 67 49H76L64 65 76 82H67L60 71 53 82H44L56 65Z" fill={`url(#${id}-xp-letters)`}/>
      <path d="M79 49H89Q100 49 100 60Q100 71 89 71H87V82H79ZM87 56V64H89Q93 64 93 60Q93 56 89 56Z" fill="#15264f" fillRule="evenodd" transform="translate(-3 1.6)"/>
      <path d="M79 49H89Q100 49 100 60Q100 71 89 71H87V82H79ZM87 56V64H89Q93 64 93 60Q93 56 89 56Z" fill={`url(#${id}-xp-letters)`} fillRule="evenodd" transform="translate(-3 0)"/>
      </g>
    </svg>
  );
}
