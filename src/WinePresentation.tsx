import { parcelLabel } from './parcelProvenance';
import { useEffect, useId, useState } from 'react';
import { ArrowRight, Check, RotateCw, Sparkles } from 'lucide-react';
import { Modal } from './components';
import { getVariety, getEstate, wineSales } from './game';
import type { GameState, Wine } from './game';
import {
  LABEL_COLORS,
  LABEL_PAPERS,
  vintage,
  volume,
  wineSourceKey,
} from './winemaking';
import type { ArchiveSummary, LabelDesign, WineComponent } from './winemaking';
import { TastingNotes } from './TastingNotes';
import { releaseTasting } from './wineSensory';
import {
  BackLabel,
  BOTTLE_PATHS,
  BottleFinish,
  LabelArtwork,
} from './BottleArtwork';
import { backLabelNote } from './bottleStudio';
import { CrestDrawing } from './HouseCrest';

export function SalesCount({
  wines,
  archive,
}: {
  wines: readonly Wine[];
  archive?: ArchiveSummary;
}) {
  const live = wineSales(wines);
  const count = live.count + (archive?.sold ?? 0);
  const complete = live.complete && (archive?.complete ?? true);
  return (
    <span
      title={
        complete
          ? undefined
          : 'Earlier sales were not recorded in this save. New sales are tracked.'
      }
    >
      {complete
        ? count.toLocaleString()
        : count
          ? `${count.toLocaleString()}+`
          : 'Unrecorded'}
    </span>
  );
}

export function Composition({
  parts,
  state,
}: {
  parts: WineComponent[];
  state: GameState;
}) {
  const total = volume(parts);
  const rows = new Map<
    string,
    Pick<WineComponent, 'variety' | 'year' | 'ml' | 'estateId' | 'parcel'>
  >();
  for (const p of parts) {
    const key = wineSourceKey(p);
    const row = rows.get(key);
    if (row) row.ml += p.ml;
    else rows.set(key, { ...p });
  }
  const sorted = [...rows].sort(([, a], [, b]) => b.ml - a.ml);
  return (
    <div className="composition">
      <div className="composition-bar" aria-hidden="true">
        {sorted.map(([key, p], i) => (
          <span
            key={key}
            style={{
              width: `${(p.ml / total) * 100}%`,
              background: getVariety(state, p.variety).color,
              opacity: 1 - (i % 4) * 0.18,
            }}
          />
        ))}
      </div>
      <ul>
        {sorted.map(([key, p], i) => (
          <li key={key}>
            <i
              style={{
                background: getVariety(state, p.variety).color,
                opacity: 1 - (i % 4) * 0.18,
              }}
            />
            <span>
              {getVariety(state, p.variety).name}{' '}
              <small>
                · Year {p.year}
                {state.estates.length > 1 &&
                  ` · ${getEstate(state, p.estateId ?? 1).name}`}
              </small>
              <small className="parcel-source">{parcelLabel(p.parcel)}</small>
            </span>
            <b>
              {((p.ml / total) * 100).toLocaleString('en-US', {
                maximumFractionDigits: 1,
              })}
              %
            </b>
          </li>
        ))}
      </ul>
    </div>
  );
}

type WineBottleProps = {
  name: string;
  estate: string;
  design: LabelDesign;
  founded: number;
  year: string;
  release: number;
  white?: boolean;
  score?: number;
};

export function WineBottle({
  name,
  estate,
  design,
  founded,
  year,
  release,
  white = false,
  score,
  back = false,
  labelDetail = false,
}: WineBottleProps & { back?: boolean; labelDetail?: boolean }) {
  const accent = LABEL_COLORS[design.color];
  const paper = LABEL_PAPERS[design.paper ?? 'cream'].color;
  const modern = design.style === 'modern';
  const heritage = design.style === 'heritage';
  const path = BOTTLE_PATHS[design.bottle];
  const clipId = useId();
  const words = name.trim().split(/\s+/);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + word.length < 16)
      lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return (
    <div className={`bottle-presentation label-${design.style}`}>
      {score !== undefined && (
        <span className="quality-seal" aria-label={`${score} points`}>
          {score}
          <small>POINTS</small>
        </span>
      )}
      <svg
        viewBox={labelDetail ? '40 113 60 94' : '0 0 140 238'}
        role="img"
        aria-label={
          back
            ? `${name || 'Your wine line'}, back label`
            : `${name || 'Your wine line'}, ${design.style} label, ${design.bottle} bottle`
        }
      >
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
        <ellipse cx="70" cy="227" rx="40" ry="7" fill="#56473a12" />
        <path d={path} fill={white ? '#8d9464' : '#405b4c'} />
        <path
          d="M64 48V74Q61 86 51 104V209"
          stroke="#ffffff13"
          strokeWidth="5"
          fill="none"
          clipPath={`url(#${clipId})`}
        />
        <BottleFinish
          finish={design.finish}
          accent={accent}
          paper={paper}
          monogram={
            design.houseMark?.monogram || estate.charAt(0).toUpperCase()
          }
        />
        <g clipPath={`url(#${clipId})`}>
          <g
            transform={
              design.bottle === 'amphora'
                ? 'translate(70 0) scale(.84 1) translate(-70 0)'
                : undefined
            }
          >
            {back ? (
              <BackLabel
                note={backLabelNote(design.note, estate)}
                estate={estate}
                year={year}
                release={release}
                paper={paper}
                accent={accent}
              />
            ) : (
              <>
                {design.style === 'vintage' ? (
                  <path d="M44 202V141a26 26 0 0 1 52 0V202Z" fill={paper} />
                ) : (
                  <rect
                    x="44"
                    y="117"
                    width="52"
                    height="85"
                    fill={modern ? accent : paper}
                  />
                )}
                {heritage && (
                  <>
                    <rect
                      x="47"
                      y="120"
                      width="46"
                      height="79"
                      fill="none"
                      stroke={accent}
                      strokeWidth=".6"
                    />
                    {!design.houseMark && (
                      <>
                        <path
                          d="M63 134q7 -7 14 0v8q-7 9-14 0Z"
                          fill="none"
                          stroke={accent}
                        />
                        <text
                          x="70"
                          y="142"
                          textAnchor="middle"
                          fontSize="8"
                          fill={accent}
                          fontFamily="Georgia"
                        >
                          {estate.charAt(0).toUpperCase()}
                        </text>
                        <path
                          d="M57 137q-6 8 4 13M83 137q6 8-4 13"
                          fill="none"
                          stroke={accent}
                          strokeWidth=".6"
                        />
                      </>
                    )}
                    {design.houseMark && (
                      <g transform="translate(59 128) scale(.35)">
                        <CrestDrawing
                          identity={design.houseMark}
                          name={estate}
                        />
                      </g>
                    )}
                  </>
                )}
                {(modern || design.style === 'estate') && (
                  <path
                    d={
                      modern
                        ? 'M50 126h40v3H50z'
                        : 'M51 141 63 129 73 139 85 130 90 146H51Z'
                    }
                    fill={modern ? paper : '#9fa880'}
                  />
                )}
                <LabelArtwork
                  style={design.style}
                  accent={accent}
                  paper={paper}
                />
                {design.houseMark && !heritage && (
                  <g transform="translate(63 95) scale(.22)">
                    <path
                      d="M10 8Q32 0 54 8V35Q54 52 32 61Q10 52 10 35Z"
                      fill={paper}
                    />
                    <CrestDrawing identity={design.houseMark} name={estate} />
                  </g>
                )}
                {lines.slice(0, 3).map((line, i) => (
                  <text
                    key={i}
                    x="70"
                    y={158 + i * 8}
                    textAnchor="middle"
                    fill={modern ? paper : accent}
                    fontSize="6"
                    textLength={line.length > 15 ? 43 : undefined}
                    lengthAdjust="spacingAndGlyphs"
                    fontFamily="Georgia"
                  >
                    {line}
                  </text>
                ))}
                <text
                  x="70"
                  y="187"
                  textAnchor="middle"
                  fontSize="4.5"
                  fill={modern ? paper : accent}
                >
                  {year.startsWith('Multi')
                    ? 'MULTI-VINTAGE'
                    : year.toUpperCase()}
                </text>
                <text
                  x="70"
                  y="194"
                  textAnchor="middle"
                  fontSize="3.6"
                  fill={modern ? paper : accent}
                >
                  EST. Y{founded} · No. {String(release).padStart(2, '0')}
                </text>
              </>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}

export function BottleView(props: WineBottleProps) {
  const [back, setBack] = useState(false);
  return (
    <div className="bottle-view">
      <div className={`bottle-face${back ? ' is-back' : ''}`}>
        <WineBottle {...props} back={back} />
      </div>
      <button
        type="button"
        className="text-button bottle-turn"
        onClick={() => setBack(!back)}
        aria-pressed={back}
      >
        <RotateCw size={14} aria-hidden="true" />{' '}
        {back ? 'Show front label' : 'Read back label'}
      </button>
      {back && (
        <p className="bottle-back-note">
          {backLabelNote(props.design.note, props.estate)}
        </p>
      )}
    </div>
  );
}

export function ReleaseReveal({
  wine,
  unlockedPricing = false,
  state,
  onClose,
  onShop,
}: {
  wine: Wine;
  unlockedPricing?: boolean;
  state: GameState;
  onClose: () => void;
  onShop: () => void;
}) {
  const [points, setPoints] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? wine.quality
      : 0,
  );
  const [complete, setComplete] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const start = performance.now();
    const finish = () => {
      cancelAnimationFrame(frame);
      setPoints(wine.quality);
      setComplete(true);
    };
    const animate = (now: number) => {
      if (reduced.matches) return finish();
      const t = Math.min(1, (now - start) / 1800);
      setPoints(Math.round(wine.quality * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(animate);
      else setComplete(true);
    };
    frame = requestAnimationFrame(animate);
    reduced.addEventListener('change', finish);
    return () => {
      cancelAnimationFrame(frame);
      reduced.removeEventListener('change', finish);
    };
  }, [wine.id, wine.quality]);
  return (
    <Modal title="A new chapter, bottled." onClose={onClose}>
      <div className={`release-reveal ${complete ? 'revealed' : ''}`}>
        <p className="eyebrow">
          {wine.estate} · RELEASE {String(wine.release).padStart(2, '0')}
        </p>
        <div className="reveal-body">
          <div className="reveal-identity">
            <div className="reveal-stage">
              <BottleView
                name={wine.label}
                estate={wine.estate}
                design={wine.design}
                founded={wine.founded}
                year={vintage(wine.components)}
                release={wine.release}
                white={getVariety(state, wine.variety).wineType === 'White'}
                score={points}
              />
            </div>
            <h3>{wine.label}</h3>
            <p className="tasting-status" role="status">
              {complete
                ? `${wine.quality} points · ${wine.quality >= 95 ? 'An exceptional release' : wine.quality >= 85 ? 'Beautifully expressive' : wine.quality >= 75 ? 'A wine with character' : 'A promising beginning'}`
                : 'Tasting your wine…'}
            </p>
            <p>
              {wine.produced} bottles · {vintage(wine.components)}
            </p>
          </div>
          <div className="reveal-description">
            <Composition parts={wine.components} state={state} />
            <TastingNotes profile={releaseTasting(wine, state)} />
          </div>
        </div>
        {complete && unlockedPricing && (
          <p className="pricing-unlock-note" role="status">
            <strong>Collector pricing unlocked.</strong> Your first 98+ point
            release opens prices up to $10,000 for every wine.
          </p>
        )}
        <p className="fine-print">
          <Check size={13} /> Added to your wine line. This tasting score is
          final.
        </p>
        <button className="button primary wide" onClick={onShop}>
          Bring it to the wine shop <ArrowRight size={16} />
        </button>
        <button className="text-button" onClick={onClose}>
          <Sparkles size={14} /> Keep working in the cellar
        </button>
      </div>
    </Modal>
  );
}
