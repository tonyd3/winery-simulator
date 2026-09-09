import { useState } from 'react';
import type { Reserve } from './winemaking';
import { liters, volume } from './winemaking';
import {
  allocateBlend,
  maximumBlendVolume,
  percentWeights,
  recipePercentages,
} from './blendPlanning';
import type { BlendPortion } from './blendPlanning';

export function BlendProportions({
  lots,
  portions,
  onApply,
}: {
  lots: Reserve[];
  portions: BlendPortion[];
  onApply: (portions: BlendPortion[]) => void;
}) {
  const initialMl = portions.reduce(
    (sum, p) => sum + (Number.isFinite(p.ml) && p.ml > 0 ? p.ml : 0),
    0,
  );
  const [target, setTarget] = useState(String(initialMl / 1000));
  const [percentages, setPercentages] = useState(() =>
    recipePercentages(portions),
  );
  let error = '',
    maximum = 0,
    proposed: BlendPortion[] = [];
  try {
    const weights = percentWeights(percentages);
    maximum = maximumBlendVolume(lots, weights);
    const ml = Number(target) * 1000;
    if (!target.trim() || Math.abs(ml - Math.round(ml)) > 0.000001)
      throw new Error('Use a batch size with up to three decimal places.');
    if (ml > maximum)
      throw new Error(
        `These proportions allow up to ${liters(maximum)} L from your stock.`,
      );
    proposed = allocateBlend(lots, weights, Math.round(ml));
  } catch (e) {
    error = e instanceof Error ? e.message : 'Check your recipe.';
  }
  const totalPercent = percentages.reduce(
    (sum, p) => sum + (Number(p) || 0),
    0,
  );
  return (
    <details className="blend-proportions">
      <summary>Set percentages & batch size</summary>
      <p>
        Try a recipe here, then apply it to the bench. Source wine stays in
        reserves.
      </p>
      <div className="recipe-presets">
        <button
          type="button"
          className="text-button"
          onClick={() =>
            setPercentages(
              recipePercentages(lots.map((lot) => ({ id: lot.id, ml: 1 }))),
            )
          }
        >
          Equal shares
        </button>
        {lots.length === 2 && (
          <>
            <button
              type="button"
              className="text-button"
              onClick={() => setPercentages(['60', '40'])}
            >
              60 / 40
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setPercentages(['80', '20'])}
            >
              80 / 20
            </button>
          </>
        )}
      </div>
      <div className="recipe-shares">
        {lots.map((lot, i) => (
          <label key={lot.id}>
            <span>
              {lot.name}
              <small>
                Lot {lot.id} · {liters(volume(lot.components))} L available
              </small>
            </span>
            <span className="recipe-percent-input">
              <input
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                aria-label={`Percentage from lot ${lot.id}`}
                value={percentages[i]}
                onChange={(e) =>
                  setPercentages(
                    percentages.map((p, j) => (i === j ? e.target.value : p)),
                  )
                }
              />
              %
            </span>
          </label>
        ))}
      </div>
      <div className="recipe-total">
        Total{' '}
        <strong>
          {Number.isFinite(totalPercent)
            ? Number(totalPercent.toFixed(2))
            : '—'}
          %
        </strong>
      </div>
      <label className="recipe-size">
        <span>
          Batch size <small>L</small>
        </span>
        <input
          aria-label="Blend batch size in liters"
          type="number"
          min="0.001"
          max="100000"
          step="0.001"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </label>
      <button
        className="text-button"
        type="button"
        disabled={!maximum}
        onClick={() => setTarget(String(maximum / 1000))}
      >
        Use maximum available · {liters(maximum)} L
      </button>
      {error && (
        <p className="recipe-error" role="status">
          {error}
        </p>
      )}
      <button
        className="button secondary wide"
        type="button"
        disabled={Boolean(error)}
        onClick={() => onApply(proposed)}
      >
        Apply proportions
      </button>
    </details>
  );
}
