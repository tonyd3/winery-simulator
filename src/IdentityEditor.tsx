import { useState } from 'react';
import {
  DEFAULT_HOUSE,
  HOUSE_COLORS,
  HOUSE_MOTIFS,
  houseInitials,
} from './houseIdentity';
import type { HouseIdentity } from './houseIdentity';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import { WineBottle } from './WinePresentation';
import { DEFAULT_DESIGN } from './winemaking';

import { HouseCrest } from './HouseCrest';

export function IdentityEditor({
  state,
  dispatch,
  onClose,
}: {
  state: GameState;
  dispatch: Dispatch;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(state.houseIdentity ?? DEFAULT_HOUSE);
  const [error, setError] = useState('');
  return (
    <form
      className="identity-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (dispatch({ type: 'houseIdentity', identity: draft })) onClose();
        else
          setError(
            'The house identity could not be saved. Check your initials and try again.',
          );
      }}
    >
      <p>
        Your mark on the estate gate, cellar cases, journal and future bottles.
      </p>
      <div className="identity-preview">
        <HouseCrest identity={draft} name={state.name} />
        <div>
          <span className="eyebrow">THE HOUSE OF</span>
          <h3>{state.name}</h3>
          <span>Established Year {state.estates[0].founded}</span>
        </div>
        <WineBottle
          name="House reserve"
          estate={state.name}
          design={{
            ...DEFAULT_DESIGN,
            houseMark: { ...draft, monogram: houseInitials(state.name, draft) },
          }}
          founded={1}
          year="Year 1"
          release={1}
        />
      </div>
      <fieldset>
        <legend>House emblem</legend>
        <div className="identity-choices">
          {Object.entries(HOUSE_MOTIFS).map(([motif, label]) => (
            <button
              key={motif}
              type="button"
              aria-pressed={draft.motif === motif}
              onClick={() =>
                setDraft({ ...draft, motif: motif as HouseIdentity['motif'] })
              }
            >
              <HouseCrest
                identity={{ ...draft, motif: motif as HouseIdentity['motif'] }}
                name={state.name}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="identity-fields">
        <label>
          Initials
          <input
            value={draft.monogram}
            maxLength={3}
            placeholder={houseInitials(state.name, DEFAULT_HOUSE)}
            onChange={(e) => setDraft({ ...draft, monogram: e.target.value })}
          />
          <small>
            Up to 3 characters. Leave blank to use the winery’s initials.
          </small>
        </label>
        <label>
          House ink
          <select
            value={draft.color}
            onChange={(e) =>
              setDraft({
                ...draft,
                color: e.target.value as HouseIdentity['color'],
              })
            }
          >
            {Object.keys(HOUSE_COLORS).map((color) => (
              <option key={color} value={color}>
                {color[0].toUpperCase() + color.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="subtle">
        Existing releases keep their original mark. Your next bottling uses this
        identity, including releases from an existing wine line.
      </p>
      {error && <p role="alert">{error}</p>}
      <button className="button primary wide" type="submit">
        Save house identity
      </button>
    </form>
  );
}
