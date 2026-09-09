import {
  EstateTerrain,
  EstateTree,
  RegionalBuilding,
  SEASON_PALETTES,
} from './EstateScenery';
import { CrestDrawing } from './HouseCrest';
import { DEFAULT_HOUSE } from './houseIdentity';
import { weather } from './game';
import { districtForPlot, plotId } from './estates';
import { useState } from 'react';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import {
  REGIONS,
  getVariety,
  getLand,
  getEstate,
  estatePlots,
  estateArea,
  hectares,
  calendar,
  readyToHarvest,
} from './game';
import type { GameState, Plot } from './game';

function Vines({
  plot,
  winter,
  state,
}: {
  plot: Plot;
  winter: boolean;
  state: GameState;
}) {
  return (
    <>
      {Array.from({ length: 6 }, (_, row) => {
        const yy = -56 + row * 22;
        return (
          <g key={row}>
            <path
              d={`M${-61 * 0.87 - yy * 0.87},${-61 * 0.5 + yy * 0.5} l108 62`}
              stroke={plot.variety ? '#acaa76' : '#c8bc8c'}
              strokeWidth="8"
              opacity=".55"
            />
            {plot.variety &&
              Array.from({ length: 8 }, (_, col) => {
                const xx = -65 + col * 19;
                const x = (xx - yy) * 0.87;
                const y = (xx + yy) * 0.5;
                return (
                  <g key={col} transform={`translate(${x} ${y})`}>
                    <path d="M0 0v-15" stroke="#8e7c58" strokeWidth="2.1" />
                    {!winter && (
                      <>
                        <path
                          d="M-8-8C-14-13-9-20-3-17C0-25 9-22 9-16C18-15 13-5 6-7C0-2-5-5-8-8"
                          fill={
                            calendar(state.week).season === 'Autumn'
                              ? '#a8914f'
                              : plot.growth >= 80
                                ? '#708549'
                                : plot.growth < 30
                                  ? '#a1ac6b'
                                  : '#839853'
                          }
                        />
                        <path
                          d="M-6-14Q0-22 6-16"
                          stroke="#a2ae65"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {plot.growth > 50 && (
                          <g fill={getVariety(state, plot.variety!).color}>
                            <circle cx="-4" cy="-8" r="2.5" />
                            <circle cx="0" cy="-7" r="2.5" />
                            <circle cx="-2" cy="-4" r="2.2" />
                          </g>
                        )}
                      </>
                    )}
                  </g>
                );
              })}
          </g>
        );
      })}
    </>
  );
}
export default function EstateMap({
  state,
  selected,
  onSelect,
  onCellar,
}: {
  state: GameState;
  selected: number;
  onSelect: (id: number) => void;
  onCellar: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const date = calendar(state.week);
  const palette = SEASON_PALETTES[date.season];
  const estate = getEstate(state),
    district = districtForPlot(selected);
  const sky = weather(state.week, estate.region);
  const treeKind =
    estate.region === 'tuscany'
      ? 'cypress'
      : estate.region === 'barossa'
        ? 'gum'
        : estate.region === 'mendoza' || estate.region === 'mosel'
          ? 'poplar'
          : estate.region === 'rioja'
            ? 'olive'
            : 'oak';
  return (
    <div
      className="estate-map"
      data-region={estate.region}
      data-season={date.season}
      style={{ background: REGIONS[estate.region].sky }}
    >
      <div className="map-heading">
        <span className="map-heading-label">
          <span className="map-live-dot" /> ESTATE VIEW
        </span>{' '}
        <span className="map-heading-divider" />{' '}
        <span className="map-heading-details">
          {estatePlots(state).filter((p) => p.owned).length} parcels ·{' '}
          {hectares(estateArea(state))} ha · {REGIONS[estate.region].name} ·{' '}
          {date.season}
        </span>
      </div>
      <svg
        className="world"
        viewBox="0 0 1000 660"
        aria-label="Interactive estate map. Select a vineyard parcel to manage it."
      >
        <defs>
          <pattern
            id="terrain-dots"
            width="25"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="8" cy="5" r="1" fill="#a9af7435" />
          </pattern>
          <filter
            id="label-shadow"
            x="-30%"
            y="-40%"
            width="160%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="3"
              floodColor="#4b5038"
              floodOpacity=".1"
            />
          </filter>
        </defs>
        <g
          style={{
            transform: `translate(500px, 330px) scale(${zoom}) translate(-500px, -330px)`,
            transition: 'transform .3s ease',
          }}
        >
          <EstateTerrain
            region={estate.region}
            season={date.season}
            wet={sky.name === 'Light rain' || sky.name === 'Overcast'}
          />
          <g
            fill="none"
            stroke="#d2c8a2"
            strokeWidth="28"
            strokeLinejoin="round"
          >
            <path d="M36 316 502 582 979 307" />
            <path d="M276 85 754 357" />
            <path d="M201 419 729 116" />
            <path d="M515 584V647" />
          </g>
          <g
            fill="none"
            stroke="#ebe0bb"
            strokeWidth="21"
            strokeLinejoin="round"
          >
            <path d="M36 313 502 579 979 304" />
            <path d="M276 82 754 354" />
            <path d="M201 416 729 113" />
            <path d="M515 581V647" />
          </g>
          <g aria-hidden="true">
            {[
              [109, 193, 1],
              [159, 129, 0.7],
              [849, 119, 1.2],
              [898, 171, 0.7],
              [921, 431, 1.1],
              [855, 484, 0.9],
              [190, 554, 0.8],
              [218, 574, 0.65],
              [725, 581, 1],
              [799, 543, 0.6],
            ].map(([x, y, scale], i) => (
              <EstateTree
                key={i}
                x={x + (estate.region === 'mosel' ? 22 : 0)}
                y={y}
                scale={scale}
                kind={treeKind}
                season={date.season}
              />
            ))}
          </g>
          <g opacity=".5" stroke="#8b9f63" strokeWidth="2" fill="none">
            {Array.from({ length: 24 }, (_, i) => (
              <path
                key={i}
                d={`M${90 + ((i * 137) % 825)} ${95 + ((i * 79) % 480)}l-3-5m3 5 4-6`}
              />
            ))}
          </g>
          {[6, 4, 1, 3, 2, 5].map((local) => {
            const id = plotId(estate.id, district, local);
            const p = state.plots.find((p) => p.id === id)!;
            const l = getLand(state, id);
            const ready = readyToHarvest(p, state.week);
            const active = selected === id;
            return (
              <g
                key={id}
                transform={`translate(${l.x} ${l.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${l.name}, ${p.owned ? (p.variety ? getVariety(state, p.variety).name : 'empty parcel') : 'available to buy'}${ready ? ', ready to harvest' : ''}${p.expansions ? `, expanded to ${l.area} hectares` : ''}`}
                aria-pressed={active}
                onClick={() => onSelect(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(id);
                  }
                }}
                className={`map-parcel ${active ? 'selected' : ''}`}
              >
                <title>
                  {l.name} · {l.soil} · {l.area} ha
                </title>
                <path
                  d="M-126 5 0-67 126 5 0 78Z"
                  fill="#a0a76d"
                  opacity=".22"
                />
                <path
                  className="parcel-surface"
                  d="M-126 0 0-72 126 0 0 72Z"
                  fill={p.owned ? palette.soil : palette.ground}
                  stroke={active ? '#805168' : p.owned ? '#b7b888' : '#b2bb8f'}
                  strokeWidth={active ? '2.5' : '1.5'}
                  strokeDasharray={p.owned ? undefined : '7 5'}
                />
                <Vines
                  state={state}
                  plot={p}
                  winter={calendar(state.week).season === 'Winter'}
                />
                {(p.expansions ?? 0) > 0 && (
                  <g transform="translate(83 -18)">
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="18"
                      rx="4"
                      fill="#fcfaf0"
                      stroke="#b7b888"
                    />
                    <text
                      textAnchor="middle"
                      y="2"
                      fontSize="8.5"
                      fill="#515440"
                    >
                      {l.area} ha
                    </text>
                  </g>
                )}
                {!p.owned && (
                  <g
                    transform="translate(0 -9)"
                    stroke="#89916a"
                    fill="none"
                    strokeWidth="2"
                  >
                    <path d="M-7 0v-5a7 7 0 0 1 14 0v5" />
                    <rect x="-10" y="0" width="20" height="16" rx="3" />
                  </g>
                )}
                {p.owned && !p.variety && (
                  <g
                    stroke="#9c916b"
                    strokeWidth="2"
                    transform="translate(0 -13)"
                  >
                    <path d="M-7 0H7M0-7V7" />
                  </g>
                )}
                <g
                  className="parcel-label"
                  transform="translate(0 61)"
                  filter="url(#label-shadow)"
                >
                  <rect
                    x="-85"
                    y="-14"
                    width="170"
                    height="38"
                    rx="7"
                    fill={active ? '#754456' : '#fcfaf0'}
                  />
                  <text
                    y="2"
                    textAnchor="middle"
                    fill={active ? '#fff9ee' : '#515440'}
                    fontSize="11.5"
                    fontWeight="650"
                  >
                    {l.name}
                  </text>
                  <text
                    y="15"
                    textAnchor="middle"
                    fill={active ? '#f3e0e5' : '#69705c'}
                    fontSize="10"
                  >
                    {p.owned
                      ? p.variety
                        ? `${getVariety(state, p.variety).name} · ${p.harvestedYear === calendar(state.week).year ? 'Harvested' : `${Math.round(p.growth)}% ripe`}`
                        : 'Ready to plant'
                      : `Available · $${l.cost.toLocaleString()}`}
                  </text>
                </g>
                {ready && (
                  <g className="harvest-flag" transform="translate(0 -56)">
                    <rect
                      x="-45"
                      y="-16"
                      width="90"
                      height="23"
                      rx="11"
                      fill="#fbefd0"
                      stroke="#dece93"
                    />
                    <circle cx="-29" cy="-4.5" r="3" fill="#b0993f" />
                    <text
                      x="6"
                      y="-1"
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="600"
                      fill="#8f7837"
                    >
                      Harvest ready
                    </text>
                    <path d="M-4 7 0 11 4 7" fill="#fbefd0" />
                  </g>
                )}
              </g>
            );
          })}
          <g
            role="button"
            tabIndex={0}
            aria-label="Open the winery cellar"
            onClick={onCellar}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCellar();
              }
            }}
            className="winery-building"
          >
            <RegionalBuilding region={estate.region} x={472} y={130} />
            <g transform="translate(480 180)" filter="url(#label-shadow)">
              <rect
                x="-54"
                y="-14"
                width="108"
                height="25"
                rx="6"
                fill="#fcfaf0"
              />
              <text
                textAnchor="middle"
                y="2"
                fontSize="11"
                fill="#5d604b"
                fontWeight="600"
              >
                The winery ↗
              </text>
            </g>
          </g>
          <RegionalBuilding region={estate.region} x={851} y={292} small />
          <EstateTree
            season={date.season}
            kind={treeKind}
            x={381}
            y={154}
            scale={0.82}
          />
          <EstateTree
            season={date.season}
            kind={treeKind}
            x={587}
            y={159}
            scale={0.9}
          />
          <EstateTree
            season={date.season}
            kind={treeKind}
            x={805}
            y={275}
            scale={0.78}
          />
          <g transform="translate(513 630)" aria-hidden="true">
            <path d="M-80-22v32M80-22v32" stroke="#99815e" strokeWidth="5" />
            <path d="M-85-25H85V-4H-85Z" fill="#7e7557" />
            <text
              y="-11"
              textAnchor="middle"
              fontSize="9"
              fill="#fff7e2"
              textLength={estate.name.length > 25 ? 150 : undefined}
              lengthAdjust="spacingAndGlyphs"
            >
              {estate.name}
            </text>
            <g transform="translate(-13 -58) scale(.4)">
              <CrestDrawing
                identity={state.houseIdentity ?? DEFAULT_HOUSE}
                name={state.name}
              />
            </g>
          </g>
          {state.grapes.some(
            (grapes) => (grapes.estateId ?? 1) === estate.id,
          ) && (
            <g
              className="harvest-crates"
              aria-hidden="true"
              transform="translate(587 275)"
            >
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i * 21} ${(i % 2) * 13})`}>
                  <path d="M-16-8 4-19 22-9 2 3Z" fill="#b09565" />
                  <path d="M-16-8V8L2 19V3Z" fill="#ab8457" />
                  <path d="M2 3 22-9V8L2 19Z" fill="#c8a473" />
                  <path
                    d="M-13-3 0 5m-13 1 13 8M5 6 19-2m-14 14 14-8"
                    stroke="#e7cf9e"
                  />
                  <g fill="#755068">
                    <circle cx="0" cy="-10" r="4" />
                    <circle cx="8" cy="-10" r="4" />
                    <circle cx="4" cy="-5" r="4" />
                  </g>
                </g>
              ))}
            </g>
          )}
          <g transform="translate(565 365)">
            <path d="M-12-12 17-29 40-15 11 2Z" fill="#e7dcbf" />
            <path d="M-12-12V1L11 15V2Z" fill="#a98c69" />
            <path d="M11 2 40-15V-2L11 15Z" fill="#c3a67c" />
            <path d="M-7-9 9 0V-12L-7-21Z" fill="#83978b" />
            <circle cx="-4" cy="6" r="5" fill="#59604d" />
            <circle cx="31" cy="7" r="5" fill="#59604d" />
          </g>
          {state.upgrades.includes('tasting') && (
            <g transform="translate(577 245)">
              <ellipse rx="34" ry="19" fill="#d4c99f" />
              <path d="M0-35V0" stroke="#998567" strokeWidth="3" />
              <path d="M-31-30Q0-65 31-30L0-17Z" fill="#f5eee0" />
              <path d="M0-50 0-17 31-30Z" fill="#c5a28b" />
              <ellipse cy="-5" rx="17" ry="9" fill="#e9dfc5" />
            </g>
          )}
          <g fill="#d8d8bb">
            <ellipse cx="188" cy="284" rx="9" ry="5" />
            <ellipse cx="839" cy="335" rx="13" ry="7" />
            <ellipse cx="203" cy="293" rx="5" ry="3" />
          </g>
        </g>
      </svg>
      <div className="map-legend">
        <span>
          <i className="legend-owned" />
          Your land
        </span>
        <span>
          <i className="legend-available" />
          Available land
        </span>
        <span className="map-hint">Click a parcel to make it your own.</span>
      </div>
      <div className="map-controls">
        <button
          aria-label="Zoom out"
          disabled={zoom <= 0.8}
          onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))}
        >
          <Minus size={15} />
        </button>
        <button aria-label="Reset map zoom" onClick={() => setZoom(1)}>
          <Maximize2 size={14} />
        </button>
        <button
          aria-label="Zoom in"
          disabled={zoom >= 1.45}
          onClick={() => setZoom((z) => Math.min(1.45, z + 0.15))}
        >
          <Plus size={15} />
        </button>
      </div>
      <div className="compass">
        <span>N</span>
        <svg viewBox="0 0 30 36" width="27">
          <path d="M15 0 24 30 15 23 6 30Z" fill="#748565" />
          <path d="M15 0V23L6 30Z" fill="#a8b291" />
        </svg>
      </div>
    </div>
  );
}
