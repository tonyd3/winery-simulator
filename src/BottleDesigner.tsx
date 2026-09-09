import { BOTTLE_PATHS } from './BottleArtwork';
import { applyBottleLook, BOTTLE_LOOKS } from './bottleStudio';
import { WineBottle } from './WinePresentation';
import {
  BOTTLE_FINISHES,
  BOTTLE_SHAPES,
  LABEL_COLORS,
  LABEL_PAPERS,
  LABEL_STYLES,
} from './winemaking';
import type { LabelDesign } from './winemaking';

export function BottleDesigner({
  design,
  onChange,
  name,
  estate,
  white,
  founded,
  year,
}: {
  design: LabelDesign;
  onChange: (design: LabelDesign) => void;
  name: string;
  estate: string;
  white: boolean;
  founded: number;
  year: string;
}) {
  const preview = (sample: LabelDesign, labelDetail = false) => (
    <span className="design-miniature" aria-hidden="true">
      <WineBottle
        name={name}
        estate={estate}
        design={sample}
        founded={founded}
        year={year}
        release={1}
        white={white}
        labelDetail={labelDetail}
      />
    </span>
  );
  return (
    <div className="bottle-designer">
      <details className="studio-disclosure">
        <summary>Start with a complete look</summary>
        <div className="bottle-looks">
          {BOTTLE_LOOKS.map((look) => (
            <button
              type="button"
              key={look.name}
              className="bottle-look"
              onClick={() => onChange(applyBottleLook(design, look.design))}
              aria-label={`Use ${look.name} look`}
            >
              {preview(look.design)}
              <span>
                <b>{look.name}</b>
                <small>{look.description}</small>
              </span>
            </button>
          ))}
        </div>
      </details>
      <fieldset className="design-gallery">
        <legend>Label artwork</legend>
        <div className="design-options">
          {Object.entries(LABEL_STYLES).map(([style, title]) => (
            <button
              type="button"
              key={style}
              aria-label={title}
              aria-pressed={design.style === style}
              onClick={() =>
                onChange({ ...design, style: style as LabelDesign['style'] })
              }
            >
              {preview(
                { ...design, style: style as LabelDesign['style'] },
                true,
              )}
              <span>{title}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="studio-inks">
        <legend>Ink color</legend>
        <div>
          {Object.entries(LABEL_COLORS).map(([color, hex]) => (
            <button
              type="button"
              key={color}
              aria-label={`${color} ink`}
              aria-pressed={design.color === color}
              onClick={() =>
                onChange({ ...design, color: color as LabelDesign['color'] })
              }
            >
              <i style={{ background: hex }} aria-hidden="true" />
              <span>{color}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <details className="studio-disclosure">
        <summary>
          Bottle & finishing touches{' '}
          <span>{BOTTLE_FINISHES[design.finish ?? 'foil']}</span>
        </summary>
        <fieldset className="design-gallery shape-gallery">
          <legend>Bottle shape</legend>
          <div className="design-options">
            {Object.entries(BOTTLE_SHAPES).map(([bottle, title]) => (
              <button
                type="button"
                key={bottle}
                aria-label={title}
                aria-pressed={design.bottle === bottle}
                onClick={() =>
                  onChange({
                    ...design,
                    bottle: bottle as LabelDesign['bottle'],
                  })
                }
              >
                <svg viewBox="0 0 140 238" aria-hidden="true">
                  <path
                    d={BOTTLE_PATHS[bottle as LabelDesign['bottle']]}
                    fill={white ? '#8d9464' : '#405b4c'}
                  />
                </svg>
                <span>{title}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="design-selects">
          <div>
            <label className="field-label" htmlFor="bottle-finish">
              Neck finish
            </label>
            <select
              id="bottle-finish"
              value={design.finish ?? 'foil'}
              onChange={(e) =>
                onChange({
                  ...design,
                  finish: e.target.value as LabelDesign['finish'],
                })
              }
            >
              {Object.entries(BOTTLE_FINISHES).map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="label-paper">
              Label paper
            </label>
            <select
              id="label-paper"
              value={design.paper ?? 'cream'}
              onChange={(e) =>
                onChange({
                  ...design,
                  paper: e.target.value as LabelDesign['paper'],
                })
              }
            >
              {Object.entries(LABEL_PAPERS).map(([id, paper]) => (
                <option key={id} value={id}>
                  {paper.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>
      <details className="studio-disclosure">
        <summary>
          A note on the back{' '}
          <span>{design.note?.trim() ? 'Personalized' : 'Make it yours'}</span>
        </summary>
        <label className="field-label" htmlFor="winemaker-note">
          Winemaker’s note
        </label>
        <textarea
          id="winemaker-note"
          value={design.note ?? ''}
          maxLength={160}
          rows={3}
          placeholder="A place, a person, a dinner worth remembering…"
          aria-describedby="winemaker-note-help"
          onChange={(e) => onChange({ ...design, note: e.target.value })}
        />
        <p id="winemaker-note-help" className="studio-note-help">
          <span>Printed on the back label and saved with this wine line.</span>
          <span>{design.note?.length ?? 0}/160</span>
        </p>
      </details>
    </div>
  );
}
