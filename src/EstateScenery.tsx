import type { RegionId } from './catalog';
import { REGIONS } from './catalog';

export const SEASON_PALETTES: Record<
  string,
  { ground: string; soil: string; leaf: string; shade: string; light: string }
> = {
  Spring: {
    ground: '#dde2c4',
    soil: '#d6d6ab',
    leaf: '#91a46b',
    shade: '#718953',
    light: '#b2bc85',
  },
  Summer: {
    ground: '#e1ddba',
    soil: '#cdc99d',
    leaf: '#7f9359',
    shade: '#627c4c',
    light: '#a2af70',
  },
  Autumn: {
    ground: '#e3d4b4',
    soil: '#cbb994',
    leaf: '#b89150',
    shade: '#997345',
    light: '#cfb172',
  },
  Winter: {
    ground: '#dfe0d4',
    soil: '#d0ccbb',
    leaf: '#99a18a',
    shade: '#76836d',
    light: '#b8bba5',
  },
};

export function EstateTerrain({
  region,
  season,
  wet,
}: {
  region: RegionId;
  season: string;
  wet: boolean;
}) {
  const ground = SEASON_PALETTES[season].ground;
  const hill = REGIONS[region].hill;
  return (
    <g
      aria-hidden="true"
      className={`estate-terrain season-${season.toLowerCase()}`}
    >
      <rect
        x="-300"
        y="-200"
        width="1600"
        height="1100"
        fill={REGIONS[region].sky}
      />
      {region === 'mendoza' ? (
        <>
          <path
            d="M-150 190 80 15 176 92 297-25 413 85 562-50 695 89 798 9 1130 210V700H-150Z"
            fill="#96a9aa"
          />
          <path
            d="m80 15-31 79 43-24 84 22Zm217-40-55 107 48-27 47 25Zm265-25-60 113 62-39 63 49Z"
            fill="#f0eee2"
          />
          <path
            d="M-150 254 53 159 157 202 297 91 442 211 662 104 832 212 1100 166V760H-150Z"
            fill="#b8bbae"
          />
          <path
            d="M-200 343Q151 233 337 302T1130 276V850H-200Z"
            fill={ground}
          />
          <path
            d="M89 350 16 504 197 651"
            fill="none"
            stroke="#9cb4b0"
            strokeWidth="13"
          />
          <path
            d="M80 350 7 504 189 651M98 351 25 502 205 651"
            fill="none"
            stroke="#c2b28d"
            strokeWidth="3"
          />
        </>
      ) : region === 'mosel' ? (
        <>
          <path
            d="M-200 110 114 37 285 134 511 24 831 150 1080 68V840H-200Z"
            fill={hill}
          />
          <path
            d="M-80 205 97 105 221 182 538 99 950 229V780H-80Z"
            fill="#bcc8aa"
          />
          <path
            d="M-100 280Q236 184 477 226T1100 254V800H-100Z"
            fill={ground}
          />
          <path
            d="M-55 234C166 320-4 434 117 511S226 684 43 778"
            fill="none"
            stroke="#a7beb4"
            strokeWidth="76"
          />
          <path
            d="M-55 234C166 320-4 434 117 511S226 684 43 778"
            fill="none"
            stroke="#789f9c"
            strokeWidth="49"
          />
          <path
            d="M0 280Q70 311 59 351M79 464Q82 491 124 521M178 583Q198 635 161 669"
            stroke="#dbe5d5"
            strokeWidth="3"
            fill="none"
          />
          <g stroke="#9d9e8c" strokeWidth="4" fill="none">
            <path d="M123 195 345 80M170 218 382 105M690 102 895 211M736 92 933 198" />
          </g>
        </>
      ) : region === 'napa' ? (
        <>
          <path
            d="M-130 134 33 29 117 92 210 55 354 179 551 53 708 111 886 4 1120 144V810H-130Z"
            fill="#91a07d"
          />
          <path
            d="M-90 228 107 138 282 223 491 153 611 214 852 114 1100 219V800H-90Z"
            fill={hill}
          />
          <path
            d="M-150 363Q186 183 441 306T1190 269V850H-150Z"
            fill={ground}
          />
          <path
            d="M958 320Q837 464 902 697"
            fill="none"
            stroke="#bac1a3"
            strokeWidth="42"
          />
          <g fill="#6e825e">
            <path d="m68 185 14-51 14 51Zm47-20 17-64 17 64Zm692 22 20-82 20 82Zm77-64 14-49 14 49Z" />
          </g>
        </>
      ) : region === 'tuscany' ? (
        <>
          <path
            d="M-150 158Q62-21 243 102T612 87T1150 167V800H-150Z"
            fill="#b4b889"
          />
          <path
            d="M-170 288Q118 85 317 207T740 155T1160 272V840H-170Z"
            fill="#c8c399"
          />
          <path
            d="M-150 403Q151 227 417 330T1150 270V840H-150Z"
            fill={ground}
          />
          <path
            d="M-70 190Q114 94 275 190M710 157Q894 90 1100 219"
            fill="none"
            stroke="#e8d9ad"
            strokeWidth="10"
          />
          <g stroke="#a5a36e" strokeWidth="4" fill="none">
            <path d="M-60 231Q117 135 251 215M-30 246Q122 160 230 236M754 203Q921 130 1060 232M787 225Q931 163 1030 251" />
          </g>
        </>
      ) : region === 'rioja' ? (
        <>
          <path
            d="M-100 172 21 91 135 92 216 28 344 41 440 116 602 74 776 91 868 45 1140 178V850H-100Z"
            fill="#aca68c"
          />
          <path
            d="M-120 259 58 171 254 205 419 145 563 187 773 140 1120 247V850H-120Z"
            fill="#c6b494"
          />
          <path
            d="M-130 345Q153 250 367 295T1150 319V850H-130Z"
            fill={ground}
          />
          <path
            d="M48 399 88 365 131 366 104 406 148 423 92 448Z"
            fill="#bd9f7c"
          />
          <path d="M863 491 917 476 952 521 895 531Z" fill="#c3a27b" />
          <g stroke="#ead6af" strokeWidth="4">
            <path d="m55 404 42-12m-12 35 40-11m775 90 32-8" />
          </g>
        </>
      ) : region === 'barossa' ? (
        <>
          <path d="M-180 199Q141 3 395 119T1150 130V850H-180Z" fill="#c1af7e" />
          <path
            d="M-150 308Q191 110 445 224T1150 235V850H-150Z"
            fill="#d2bc8b"
          />
          <path
            d="M-120 383Q170 269 408 330T1170 321V850H-120Z"
            fill={season === 'Winter' ? ground : '#e3cea8'}
          />
          <path
            d="M940 159Q857 317 978 501T952 776"
            fill="none"
            stroke="#c59f75"
            strokeWidth="32"
          />
          <g fill="none" stroke="#9d976b" strokeWidth="3">
            <path d="m102 324 4-14 5 14m-39 138 3-17 4 17m822 37 4-18 4 18m-77 99 5-20 5 20" />
          </g>
        </>
      ) : region === 'burgundy' ? (
        <>
          <path
            d="M-130 153Q65 38 243 109T623 71T1150 158V850H-130Z"
            fill={hill}
          />
          <path
            d="M-170 319Q134 110 341 223T802 187T1150 268V850H-170Z"
            fill="#c4c7a4"
          />
          <path d="M-150 430Q55 290 379 322T1140 331V850H-150Z" fill={ground} />
          <g fill="none" stroke="#ece4c9" strokeWidth="7">
            <path d="M-40 218 125 159 201 186M700 130 897 244 1080 170M92 434 152 468 128 514M801 504 846 531 929 481" />
          </g>
          <g fill="none" stroke="#a7a488" strokeWidth="2">
            <path d="M-40 222 125 163 201 190M700 134 897 248 1080 174M92 438 152 472 128 518M801 508 846 535 929 485" />
          </g>
        </>
      ) : (
        <>
          <path d="M-200 193Q156 77 381 160T1150 126V850H-200Z" fill={hill} />
          <path
            d="M-150 346Q111 223 401 280T1180 273V850H-150Z"
            fill={ground}
          />
          <path
            d="M-131 169Q143 378 58 582T-99 826"
            fill="none"
            stroke="#abc4b6"
            strokeWidth="122"
          />
          <path
            d="M-131 169Q143 378 58 582T-99 826"
            fill="none"
            stroke="#8baea6"
            strokeWidth="76"
          />
          <path
            d="M7 349Q37 384 40 428M20 554 1 602"
            fill="none"
            stroke="#d5e1cc"
            strokeWidth="3"
          />
          <g fill="#839663">
            <ellipse cx="955" cy="482" rx="32" ry="13" />
            <ellipse cx="921" cy="536" rx="27" ry="11" />
          </g>
        </>
      )}
      {wet && (
        <path
          className="estate-mist"
          d="M-150 178Q34 144 198 169T512 161T1140 190V216Q861 179 705 201T213 199T-150 219Z"
          fill="#f4f3e4"
          opacity=".35"
        />
      )}
    </g>
  );
}

export function EstateTree({
  x,
  y,
  scale = 1,
  kind = 'oak',
  season,
}: {
  x: number;
  y: number;
  scale?: number;
  kind?: 'oak' | 'cypress' | 'olive' | 'gum' | 'poplar';
  season: string;
}) {
  const palette = SEASON_PALETTES[season];
  const bare = season === 'Winter' && (kind === 'oak' || kind === 'poplar');
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="9" cy="4" rx="23" ry="9" fill="#485b3820" />
      <path
        d={
          kind === 'gum'
            ? 'M0 2-6-31 3-73M-5-27-26-55M0-53 24-79'
            : 'M0 0V-35M0-19-19-40M0-27 19-48'
        }
        fill="none"
        stroke={kind === 'gum' ? '#b6b69f' : '#897251'}
        strokeWidth={kind === 'gum' ? 6 : 4}
      />
      {!bare &&
        (kind === 'cypress' || kind === 'poplar' ? (
          <>
            <path
              d="M0-87C-10-63-16-29-10-17Q0-8 10-17C16-29 8-67 0-87Z"
              fill={kind === 'cypress' ? '#5c7856' : palette.leaf}
            />
            <path
              d="M0-87Q-5-33 1-11Q17-16 10-46Z"
              fill={kind === 'cypress' ? '#43654b' : palette.shade}
            />
          </>
        ) : kind === 'gum' ? (
          <g fill="#7c947d">
            <ellipse cx="4" cy="-76" rx="24" ry="16" />
            <ellipse cx="-24" cy="-56" rx="22" ry="13" />
            <ellipse cx="29" cy="-78" rx="20" ry="12" />
            <ellipse cx="19" cy="-50" rx="22" ry="12" fill="#91a089" />
          </g>
        ) : kind === 'olive' ? (
          <>
            <path
              d="M-31-26C-42-48-23-61-9-55C5-76 28-60 28-49C49-40 36-18 15-21Q-11-12-31-26Z"
              fill="#919c7c"
            />
            <path
              d="M-28-32Q-17-62 5-57Q24-59 25-43Q5-33-28-32Z"
              fill="#acb198"
            />
          </>
        ) : (
          <>
            <path
              d="M-28-29C-45-45-26-65-13-61C-6-80 22-75 25-57C47-48 35-23 23-23C10-11-17-12-28-29Z"
              fill={palette.leaf}
            />
            <path
              d="M-13-61Q-25-34 1-23Q30-12 36-40Q17-31 11-63Z"
              fill={palette.shade}
            />
            <ellipse cx="-10" cy="-53" rx="15" ry="10" fill={palette.light} />
          </>
        ))}
      {bare && (
        <path
          d="M0-35-8-57M0-31 8-62M-17-39-23-59M15-44 29-56M6-50 22-67"
          fill="none"
          stroke="#8d806a"
          strokeWidth="2.5"
        />
      )}
    </g>
  );
}

export function RegionalBuilding({
  region,
  x,
  y,
  small = false,
}: {
  region: RegionId;
  x: number;
  y: number;
  small?: boolean;
}) {
  const roof =
    region === 'bordeaux' || region === 'mosel'
      ? '#687879'
      : region === 'barossa'
        ? '#8d9a91'
        : '#ad7153';
  return (
    <g transform={`translate(${x} ${y}) scale(${small ? 0.62 : 0.9})`}>
      <ellipse cx="8" cy="17" rx="96" ry="27" fill="#5863441c" />
      {region === 'mendoza' ? (
        <>
          <path d="M-81-42-8-76 83-27 8 16Z" fill="#dbc59d" />
          <path d="M-81-42V-73L8-26V16Z" fill="#cbae89" />
          <path d="M8-26 83-66V-27L8 16Z" fill="#b59475" />
          <path d="M-85-76-11-115 86-70 9-25Z" fill="#e5d3af" />
          <path d="M-70-73-12-101 70-68 10-39Z" fill="#c9b38a" />
          <path
            d="M-85-76v-10L9-35v10L86-70v-10"
            fill="none"
            stroke="#e5d3af"
            strokeWidth="5"
          />
          <path
            d="M-48-17v-26q12-14 21 12V-6M30-8v-23l14-7v22"
            fill="#6e7b68"
          />
        </>
      ) : region === 'rioja' ? (
        <>
          <path d="M-102-59 13 3 103-46V-89L13-41-102-103Z" fill="#d1ba95" />
          <path d="M13-41 103-89V-46L13 3Z" fill="#b99e7b" />
          <path d="M-110-105-15-138 112-94 13-34Z" fill={roof} />
          <path d="M-110-105-60-126 60-65 13-34Z" fill="#ba805b" />
          <path
            d="M-81-57v-26q10-14 20 11v26m16 8v-26q10-14 20 11v26m17 9v-26q10-14 20 11v26"
            fill="#827b5c"
          />
        </>
      ) : (
        <>
          <path
            d="M-72-17 7 28 80-13V-72L0-117-72-76Z"
            fill={region === 'napa' ? '#a8a18b' : '#eee5cf'}
          />
          <path
            d="M7-33 80-72V-13L7 28Z"
            fill={region === 'napa' ? '#8c9480' : '#cfc3a4'}
          />
          <path d="M-80-79-30-116 50-71 7-31Z" fill={roof} />
          <path d="M7-31 50-71 87-77Z" fill="#596b61" opacity=".8" />
          <path d="M-30-116 0-125 87-77 50-71Z" fill={roof} />
          {region === 'mosel' && (
            <path
              d="M-80-79-31-135 50-94 7-31Z M7-31 50-94 87-77Z"
              fill={roof}
            />
          )}
          {region === 'napa' ? (
            <g stroke="#818977" strokeWidth="2">
              <path d="M-62-67v57m14-48v56m14-48v56m14-48v56m14-48v56" />
            </g>
          ) : (
            <path
              d="M-54-57-40-49V-30L-54-38Zm28 15 14 8v19l-14-8ZM24-29l15-8v19l-15 8Zm29-17 14-8v19l-14 8Z"
              fill="#6e8273"
            />
          )}
          <path d="M-30 6V-23Q-18-40-5-10V20Z" fill="#7c7b5d" />
          {region === 'bordeaux' && (
            <>
              <path d="M-75-25v-64l24-14 25 14v76Z" fill="#e2d9c1" />
              <path d="M-81-87-53-136-20-87-49-70Z" fill="#657777" />
              <path d="M56-8v-69l22-12 21 12v58Z" fill="#d3c6aa" />
              <path d="M50-77 78-122 105-77 78-62Z" fill="#596e70" />
              <path
                d="M-63-75v17m0 11v17M80-66v17m0 11v17"
                stroke="#7b887d"
                strokeWidth="6"
              />
            </>
          )}
          {region === 'burgundy' && (
            <>
              <path
                d="M-62-74-32-91-1-74-31-57Z M-26-54 4-71 34-54 4-37Z"
                fill="#c5a362"
              />
              <path
                d="M-49-75-31-84-14-74-31-64ZM-12-54 4-63 20-54 4-45Z"
                fill="#738563"
              />
              <path d="M64-49V-106l16-10 17 10v48" fill="#e2d7bc" />
              <path d="M60-108 80-135 101-108 80-96Z" fill="#a47254" />
            </>
          )}
          {region === 'tuscany' && (
            <>
              <path d="M-60-22v-85l23-13 21 13v109" fill="#efe3bf" />
              <path d="M-67-107-37-129-9-109-35-94Z" fill="#b57250" />
              <path d="M-50-86-36-78v16l-14-8" fill="#798568" />
              <path d="M30-98v-28l11-5 11 6v38" fill="#dfcbaa" />
            </>
          )}
          {region === 'mosel' && (
            <g fill="none" stroke="#7d705b" strokeWidth="4">
              <path d="M-70-68 4-26M-70-44 4-2M-53-58v60M-24-42v59M-69-65-24 9M-26-40-52-1M21-27v43M52-42v42" />
            </g>
          )}
          {(region === 'barossa' || region === 'napa') && (
            <>
              <path
                d="M-86-25 7 26 27 13-64-40Z"
                fill={region === 'barossa' ? '#87988a' : '#b29f7c'}
              />
              <path
                d="M-81-23v29M-42-3v29M0 21v29"
                stroke="#eee1c4"
                strokeWidth="4"
              />
              <path d="M-84 8 8 56 29 44-64-4Z" fill="#c1b394" />
            </>
          )}
        </>
      )}
    </g>
  );
}
