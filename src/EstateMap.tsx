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

function Tree({
  x,
  y,
  scale = 1,
  cypress = false,
}: {
  x: number;
  y: number;
  scale?: number;
  cypress?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="8" cy="3" rx="18" ry="8" fill="#5a704629" />
      <path d="M0 1V-30" stroke="#8e7657" strokeWidth="5" />
      {cypress ? (
        <>
          <path
            d="M0-76C-7-63-15-37-12-22C-10-10 11-10 13-22C15-38 5-70 0-76"
            fill="#577352"
          />
          <path
            d="M0-76C-2-51-5-28 1-15C12-14 14-22 12-34C10-50 4-71 0-76"
            fill="#476349"
          />
        </>
      ) : (
        <>
          <path
            d="M-24-28C-37-40-24-61-12-58C-7-79 19-72 24-55C44-48 34-24 22-23C10-12-16-12-24-28"
            fill="#8b9b60"
          />
          <path
            d="M-12-58C-23-43-17-25 0-21C17-10 34-28 33-40C23-34 15-42 10-60Z"
            fill="#758953"
          />
          <ellipse cx="-9" cy="-51" rx="13" ry="10" fill="#a3b174" />
        </>
      )}
    </g>
  );
}

function Building({
  x,
  y,
  small = false,
}: {
  x: number;
  y: number;
  small?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${small ? 0.7 : 0.78})`}>
      <ellipse cx="12" cy="24" rx="91" ry="31" fill="#73754a20" />
      <path d="M-70-20 10 25 78-14 0-60Z" fill="#ded4b7" />
      <path d="M-70-20V-80L10-35V25Z" fill="#f5edd7" />
      <path d="M10-35 78-74V-14L10 25Z" fill="#d8c9a6" />
      <path d="M-77-78 3-33 39-76-39-119Z" fill="#b66f54" />
      <path d="M3-33 85-79 39-106 39-76Z" fill="#9c5947" />
      <path
        d="M-39-119 43-165 121-121 39-76Z"
        fill="#b97859"
        transform="translate(-.2 46)"
      />
      <path d="M-70-83-40-116-5-97-2-46" fill="#c77f5d" opacity=".65" />
      {Array.from({ length: 6 }, (_, i) => (
        <path
          key={i}
          d={`M${-68 + i * 12} ${-81 + i * 6.8}l34-37`}
          stroke="#97563e"
          strokeWidth="1.2"
          opacity=".38"
        />
      ))}
      <path d="M-17-104V-136L-4-144 9-137V-91" fill="#e5d8b8" />
      <path d="M-20-137-6-146 12-138-3-129Z" fill="#c0ac89" />
      <path d="M-45-5V-38Q-34-53-23-25V8Z" fill="#8b7555" />
      <path d="M-41-4V-34Q-33-43-27-26V4Z" fill="#657663" />
      <path
        d="M-61-57-50-51V-37L-61-43Z M-17-32-6-26V-12L-17-18Z"
        fill="#758a7a"
        stroke="#d5c3a1"
        strokeWidth="3"
      />
      <path
        d="M26-32 42-41V-20L26-11Z M55-49 68-56V-35L55-27Z"
        fill="#788673"
        stroke="#bfac8a"
        strokeWidth="3"
      />
      <path d="M-70 1 11 46 11 27-70-19Z" fill="#c8bf9d" />
      <path d="M-70-19 11 27 22 21-59-25Z" fill="#e8debf" />
      <g transform="translate(58 8)">
        <ellipse cy="-12" rx="11" ry="7" fill="#ae8355" />
        <path d="M-11-12V5Q0 17 11 5V-12" fill="#a17d52" />
        <ellipse cy="5" rx="11" ry="6" fill="#9b744b" />
        <path
          d="M-11-6Q0 4 11-6M-11 1Q0 11 11 1"
          stroke="#695e45"
          strokeWidth="2"
          fill="none"
        />
      </g>
    </g>
  );
}
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
                            plot.growth >= 80
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
  const estate = getEstate(state),
    district = districtForPlot(selected);
  return (
    <div
      className="estate-map"
      style={{ background: REGIONS[estate.region].sky }}
    >
      <div className="map-heading">
        <span className="map-live-dot" /> ESTATE VIEW{' '}
        <span className="map-heading-divider" />{' '}
        {estatePlots(state).filter((p) => p.owned).length} parcels ·{' '}
        {hectares(estateArea(state))} ha
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
          <path
            d="M-80 190Q80 114 213 172T552 145T1050 186V720H-80"
            fill="#e1e5c5"
          />
          <path
            d="M-20 358Q163 285 232 325T565 284T1040 349V710H-20"
            fill="#d9dfb9"
          />
          <path
            d="M-20 501Q106 429 194 484T489 521T1050 449V710H-20"
            fill="#d0d9b0"
          />
          <path d="M56 313 500 59 955 318 515 597Z" fill="#bec99d" />
          <path d="M56 306 500 52 955 311 515 590Z" fill="#e7e7c5" />
          <path d="M56 306 500 52 955 311 515 590Z" fill="url(#terrain-dots)" />
          <path
            d="M38 574Q114 499 106 466T68 397Q50 365 86 337"
            fill="none"
            stroke="#b9ccb0"
            strokeWidth="39"
          />
          <path
            d="M38 574Q114 499 106 466T68 397Q50 365 86 337"
            fill="none"
            stroke="#a5c7bc"
            strokeWidth="26"
          />
          <path
            d="M48 557Q95 504 97 481M81 414Q66 388 71 373"
            fill="none"
            stroke="#d4e4ca"
            strokeWidth="3"
            strokeLinecap="round"
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
          <g opacity=".8">
            <Tree x={100} y={180} scale={1.1} />
            <Tree x={150} y={127} scale={0.7} />
            <Tree x={829} y={100} scale={1.1} />
            <Tree x={874} y={146} scale={0.7} />
            <Tree x={898} y={421} scale={1.2} />
            <Tree x={850} y={485} scale={0.85} />
            <Tree x={181} y={552} scale={0.8} />
            <Tree x={208} y={565} scale={0.6} />
            <Tree x={716} y={578} scale={1} />
            <Tree x={785} y={532} scale={0.6} />
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
                  fill={
                    p.owned ? (p.variety ? '#d4d7a6' : '#dad2a5') : '#dce0b6'
                  }
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
                    fill={active ? '#e1cbd2' : '#93947d'}
                    fontSize="9"
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
            <Building x={472} y={130} />
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
          <Building x={851} y={292} small />
          <Tree x={381} y={154} cypress scale={0.82} />
          <Tree x={587} y={159} cypress scale={0.9} />
          <Tree x={805} y={275} cypress scale={0.78} />
          <Tree x={342} y={511} cypress scale={0.85} />
          <Tree x={636} y={502} cypress scale={0.9} />
          <g transform="translate(513 616)">
            <path d="M-36-18v30M37-18v30" stroke="#a68b63" strokeWidth="4" />
            <path d="M-38-20H39V-3H-38Z" fill="#8d805d" />
            <text
              x="0"
              y="-9"
              textAnchor="middle"
              fontSize="7.5"
              letterSpacing="2"
              fill="#f8edce"
            >
              {REGIONS[estate.region].name.toUpperCase()}
            </text>
          </g>
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
