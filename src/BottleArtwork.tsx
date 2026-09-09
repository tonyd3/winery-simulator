import type { LabelDesign } from './winemaking';
import { labelLines } from './bottleStudio';

export function BottleFinish({
  finish = 'foil',
  accent,
  paper,
  monogram,
}: {
  finish: LabelDesign['finish'];
  accent: string;
  paper: string;
  monogram: string;
}) {
  if (finish === 'cork')
    return (
      <g>
        <path d="M59 8H81V28H59Z" fill="#b39670" />
        <path
          d="M62 12h5m5 4h6m-16 7h8m5-12h3"
          stroke="#80674d"
          strokeWidth=".7"
        />
        <path d="M57 27H83V32H57Z" fill="#607260" />
      </g>
    );
  if (finish === 'wax')
    return (
      <g>
        <path
          d="M57 10Q70 7 83 10V44Q81 48 79 44V51Q76 57 73 50V47Q70 44 67 48Q64 52 62 46Q59 48 57 43Z"
          fill={accent}
        />
        <path
          d="M60 14Q70 12 79 14"
          fill="none"
          stroke="#ffffff40"
          strokeWidth="1"
        />
        <circle
          cx="70"
          cy="31"
          r="7"
          fill={accent}
          stroke="#ffffff45"
          strokeWidth=".6"
        />
        <text
          x="70"
          y="33.5"
          textAnchor="middle"
          fill={paper}
          fontFamily="Georgia"
          fontSize="7"
        >
          {monogram}
        </text>
      </g>
    );
  if (finish === 'wrap')
    return (
      <g>
        <path d="M57 10H83V22H57Z" fill={accent} />
        <path d="M57 28H83V45H57Z" fill={paper} />
        <path d="M58 30H82M58 43H82" stroke={accent} strokeWidth=".5" />
        <path d="M70 32 74 36.5 70 41 66 36.5Z" fill={accent} opacity=".75" />
      </g>
    );
  return (
    <g>
      <path d="M57 10H83V47H57Z" fill={accent} />
      <path d="M57 18H83M57 22H83" stroke="#ffffff35" />
    </g>
  );
}

export function BackLabel({
  note,
  estate,
  year,
  release,
  paper,
  accent,
}: {
  note: string;
  estate: string;
  year: string;
  release: number;
  paper: string;
  accent: string;
}) {
  const lines = labelLines(note, 24);
  const spacing = Math.min(6, 48 / Math.max(1, lines.length));
  return (
    <g>
      <rect x="44" y="117" width="52" height="85" rx="1" fill={paper} />
      <path d="M49 131H91M49 186H91" stroke={accent} strokeWidth=".5" />
      <text x="70" y="127" textAnchor="middle" fontSize="3.5" fill={accent}>
        WINEMAKER’S NOTE
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          x="70"
          y={139 + i * spacing}
          textAnchor="middle"
          fontSize={Math.min(4, spacing * 0.8)}
          fontFamily="Georgia"
          fill={accent}
          textLength={Math.min(42, Array.from(line).length * 2)}
          lengthAdjust="spacingAndGlyphs"
        >
          {line}
        </text>
      ))}
      <text
        x="70"
        y="193"
        textAnchor="middle"
        fontSize="3.5"
        fill={accent}
        textLength={estate.length > 22 ? 43 : undefined}
        lengthAdjust="spacingAndGlyphs"
      >
        {estate}
      </text>
      <text
        x="70"
        y="198"
        textAnchor="middle"
        fontSize="3"
        fill={accent}
        textLength="42"
        lengthAdjust="spacingAndGlyphs"
      >
        {year} · No. {String(release).padStart(2, '0')} · 750 mL
      </text>
    </g>
  );
}

export const BOTTLE_PATHS: Record<LabelDesign['bottle'], string> = {
  shouldered:
    'M58 12H82V65Q83 73 96 86Q103 94 103 108V210Q103 222 91 222H49Q37 222 37 210V108Q37 94 44 86Q57 73 58 65Z',
  rounded:
    'M59 12H81V62C81 84 108 82 108 117V210Q108 222 96 222H44Q32 222 32 210V117C32 82 59 84 59 62Z',
  slender:
    'M60 6H80V61C80 86 96 108 96 135V212Q96 222 86 222H54Q44 222 44 212V135C44 108 60 86 60 61Z',
  tapered:
    'M59 12H81V69Q81 77 97 86Q110 93 108 113L98 211Q97 222 86 222H54Q43 222 42 211L32 113Q30 93 43 86Q59 77 59 69Z',
  flask:
    'M59 12H81V71C81 91 120 100 120 150C120 194 105 222 83 222H57C35 222 20 194 20 150C20 100 59 91 59 71Z',
  amphora:
    'M58 12H82V58C82 76 112 74 114 107C117 143 106 179 92 209L88 222H52L48 209C34 179 23 143 26 107C28 74 58 76 58 58Z',
};

export function LabelArtwork({
  style,
  accent,
  paper,
}: {
  style: LabelDesign['style'];
  accent: string;
  paper: string;
}) {
  if (style === 'botanical')
    return (
      <g fill="none" stroke={accent} strokeWidth=".8" strokeLinecap="round">
        <path d="M52 180C46 160 50 145 59 132M88 180C94 160 90 145 81 132" />
        <path
          d="M54 144q-9-1-7-10q9 1 7 10ZM54 144q9-1 7-10q-8 0-7 10ZM86 144q9-1 7-10q-9 1-7 10ZM86 144q-9-1-7-10q8 0 7 10Z"
          fill="#9fa880"
          stroke="none"
        />
        <path d="M65 126q5-5 10 0M70 127v5" />
        <g fill={accent} stroke="none">
          <circle cx="67" cy="134" r="2.3" />
          <circle cx="73" cy="134" r="2.3" />
          <circle cx="64" cy="139" r="2.3" />
          <circle cx="70" cy="139" r="2.3" />
          <circle cx="76" cy="139" r="2.3" />
          <circle cx="67" cy="144" r="2.3" />
          <circle cx="73" cy="144" r="2.3" />
          <circle cx="70" cy="149" r="2.3" />
        </g>
        <path d="M58 179q12 4 24 0" />
      </g>
    );
  if (style === 'parcel')
    return (
      <g>
        <path d="M48 121H92V145H48Z" fill="#dce1cc" />
        <path d="M48 138 62 126 75 133 92 122V145H48Z" fill="#9fa880" />
        <path
          d="M49 121 60 132 54 145M71 121 69 133 80 145M92 129 78 137 73 145M48 133 92 141"
          fill="none"
          stroke={paper}
          strokeWidth="1.5"
        />
        <path
          d="M51 140 59 143M59 133 63 138M76 126 80 129M83 125 87 128"
          stroke={accent}
          strokeWidth=".6"
        />
        <circle cx="87" cy="125" r="2" fill={accent} />
        <path d="M48 179H92" stroke={accent} strokeWidth=".6" />
        <path d="M48 198H92V202H48Z" fill={accent} />
      </g>
    );
  if (style === 'vintage')
    return (
      <g fill="none" stroke={accent}>
        <path d="M48 199V141a22 22 0 0 1 44 0V199Z" strokeWidth=".7" />
        <path d="M53 178H87M56 181H84" strokeWidth=".6" />
        <circle cx="70" cy="138" r="5" fill={accent} stroke="none" />
        <path
          d="M70 127V130M70 146V149M59 138H62M78 138H81M62 130 64 132M76 144 78 146M62 146 64 144M76 132 78 130"
          strokeWidth=".8"
        />
      </g>
    );
  return null;
}
