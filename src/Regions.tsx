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
import { RegionLandscape } from './RegionLandscape';

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
            varieties. Every other grape needs its own research project. All{' '}
            {Object.keys(VARIETIES).length} can be studied in any region.
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
