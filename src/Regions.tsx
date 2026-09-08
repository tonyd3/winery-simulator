import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Shuffle,
  MapPin,
  Sun,
  Sprout,
} from 'lucide-react';
import { REGIONS, REGION_IDS, VARIETIES, newGame } from './game';
import type { GameState, RegionId } from './game';
import { generateEstateName } from './estateNames';

export function RegionLandscape({ region }: { region: RegionId }) {
  const r = REGIONS[region];
  return (
    <svg
      className="region-landscape"
      viewBox="0 0 640 420"
      role="img"
      aria-label={`Illustrated vineyards inspired by ${r.name}`}
    >
      <rect width="640" height="420" fill={r.sky} />
      <circle cx="510" cy="78" r="31" fill="#f9f2d8" />
      {r.landmark === 'mountain' ? (
        <g>
          <path
            d="M0 230 140 65 228 157 343 33 470 158 555 84 640 191V320H0Z"
            fill={r.hill}
          />
          <path d="m285 110 58-77 69 93-68-35-19 26-17-17Z" fill="#f4f2e5" />
        </g>
      ) : (
        <path d="M0 186Q110 82 229 167T458 137T640 157V310H0Z" fill={r.hill} />
      )}
      <path d="M0 243Q137 129 339 225T640 219V420H0Z" fill={r.ground} />
      <path d="M0 337Q147 191 343 283T640 279V420H0Z" fill="#9ca779" />
      {r.landmark === 'river' && (
        <path
          d="M356 178Q246 225 353 270T265 420"
          stroke="#a4c3c0"
          strokeWidth="32"
          fill="none"
        />
      )}
      <g stroke="#f5eed6" strokeWidth="7" opacity=".7">
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M${-150 + i * 58} 420Q${-30 + i * 45} 290 ${130 + i * 35} 234`}
            fill="none"
          />
        ))}
      </g>
      <g stroke="#748553" strokeWidth="8" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M${-120 + i * 58} 420Q${i * 45} 304 ${143 + i * 35} 241`}
            fill="none"
          />
        ))}
      </g>
      <g transform="translate(403 208)">
        <path d="M0 0H94V66H0Z" fill="#f5edce" />
        <path d="m-12 0 55-38 64 38Z" fill="#ac765b" />
        <path d="M39 34a10 10 0 0 1 20 0v32H39Z" fill="#79795d" />
        <path d="M12 17H24V34H12ZM71 17H83V34H71Z" fill="#8e9874" />
        {r.landmark === 'chateau' && (
          <>
            <path d="M-3-17H18V66H-3ZM78-17H99V66H78Z" fill="#eee5c7" />
            <path d="M-10-17 7-45 25-17ZM71-17 89-45 107-17Z" fill="#93725e" />
          </>
        )}
      </g>
      <path
        d="M450 274Q407 331 640 386"
        stroke="#e9dab3"
        strokeWidth="17"
        fill="none"
      />
      {[
        { x: 380, y: 239 },
        { x: 534, y: 240 },
        { x: 567, y: 266 },
      ].map(({ x, y }) => (
        <g key={x}>
          <path
            d={`M${x} ${y + 19}V${y - 12}`}
            stroke="#7f7752"
            strokeWidth="4"
          />
          <ellipse cx={x} cy={y - 15} rx="10" ry="31" fill="#687e59" />
        </g>
      ))}
      <g fill="#f5f0dc" opacity=".9">
        <path d="m88 80 6 4 6-4-6 8Z" />
        <path d="m114 65 6 4 6-4-6 8Z" />
      </g>
    </svg>
  );
}

export default function RegionSetup({
  onStart,
  onCancel,
}: {
  onStart: (game: GameState) => void;
  onCancel?: () => void;
}) {
  const [region, setRegion] = useState<RegionId>('bordeaux');
  const [name, setName] = useState('Domaine Bellevue');
  const r = REGIONS[region];
  return (
    <div className="setup-page">
      <header className="setup-header">
        <div className="wordmark">
          terroir<span>WINERY TYCOON</span>
        </div>
        <span className="setup-step">01 / YOUR BEGINNINGS</span>
        {onCancel && (
          <button className="text-button" onClick={onCancel}>
            <ArrowLeft size={16} /> Return to estate
          </button>
        )}
      </header>
      <main className="setup-main">
        <section className="region-choice">
          <span className="eyebrow">A PLACE TO PUT DOWN ROOTS</span>
          <h1>
            Every wine starts
            <br />
            somewhere<span>.</span>
          </h1>
          <p className="setup-intro">
            Choose your corner of the wine world. Follow its traditions, or
            plant something unexpected.
          </p>
          <div className="region-list-heading">
            <b>Your wine region</b>
            <button
              className="text-button"
              onClick={() => {
                const choices = REGION_IDS.filter((id) => id !== region);
                setRegion(choices[Math.floor(Math.random() * choices.length)]);
              }}
            >
              <Shuffle size={15} /> Surprise me
            </button>
          </div>
          <div className="region-options" role="group" aria-label="Wine region">
            {REGION_IDS.map((id) => (
              <button
                key={id}
                className={`region-option ${region === id ? 'selected' : ''}`}
                aria-pressed={region === id}
                onClick={() => setRegion(id)}
              >
                <span>
                  <strong>{REGIONS[id].name}</strong>
                  <small>{REGIONS[id].country}</small>
                </span>
                {region === id ? (
                  <Check size={18} />
                ) : (
                  <span className="region-dot" />
                )}
              </button>
            ))}
          </div>
          <p className="setup-fine">
            Every region starts with $12,500, three parcels, and two planted
            varieties. All 24 grapes can be unlocked in any region.
          </p>
        </section>
        <section className="region-preview" aria-live="polite">
          <div key={region} className="region-art">
            <RegionLandscape region={region} />
            <span className="region-postmark">
              <MapPin size={13} />
              {r.country.toUpperCase()}
            </span>
          </div>
          <div className="region-description">
            <span className="eyebrow">YOUR TERROIR</span>
            <h2>{r.name}</h2>
            <p>{r.description}</p>
            <div className="region-facts">
              <span>
                <Sun size={17} />
                {r.climate}
              </span>
              <span>
                <Sprout size={17} />
                {[...new Set(r.soils)].slice(0, 3).join(' · ')}
              </span>
            </div>
            <div className="signature-grapes">
              <small>REGIONAL FAVORITES · 15% CHEAPER VINES</small>
              <p>{r.signature.map((id) => VARIETIES[id].name).join(' · ')}</p>
            </div>
            <p className="starting-vines">
              Your first vines:{' '}
              <b>{r.starters.map((id) => VARIETIES[id].name).join(' + ')}</b>
            </p>
          </div>
        </section>
      </main>
      <form
        className="setup-footer"
        onSubmit={(e) => {
          e.preventDefault();
          onStart(newGame(region, name));
        }}
      >
        <div className="estate-name-field">
          <div className="estate-name-heading">
            <label htmlFor="new-estate-name">Name your estate</label>
            <button
              type="button"
              className="text-button"
              aria-label="Generate estate name"
              title={`Generate a name inspired by ${r.name}`}
              onClick={() => setName(generateEstateName(region, name))}
            >
              <Shuffle size={13} /> Generate
            </button>
          </div>
          <input
            id="new-estate-name"
            value={name}
            maxLength={32}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <p>
          {onCancel
            ? 'Starting replaces your current estate. Export its save first to keep both.'
            : 'Progress saves automatically in this browser. Your first harvest is already waiting.'}
        </p>
        <button
          className="button primary"
          disabled={!name.trim()}
          type="submit"
        >
          {onCancel ? 'Start new estate' : 'Begin your estate'}
          <ArrowRight size={18} />
        </button>
      </form>
      <div className="simulation-note">
        Inspired by real wine regions. Climate, breeding, and the 12-week
        seasons are simplified for play.
      </div>
    </div>
  );
}
