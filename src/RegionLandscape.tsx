import { useId } from 'react';
import type { ReactNode } from 'react';
import { REGIONS } from './catalog';
import type { RegionId } from './catalog';

// Each postcard has its own geography; only the drawing primitives are shared.
function Vineyard({
  outline,
  rows,
  soil,
  vines,
  width = 5,
}: {
  outline: string;
  rows: string[];
  soil: string;
  vines: string;
  width?: number;
}) {
  const clipId = useId();
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill={soil} />
      <g clipPath={`url(#${clipId})`} fill="none" strokeLinecap="round">
        {rows.map((d) => (
          <g key={d}>
            <path d={d} stroke={vines} strokeWidth={width} />
            <path
              d={d}
              transform={`translate(0 ${width + 3})`}
              stroke="#f8efcf"
              strokeOpacity=".5"
              strokeWidth="2"
            />
          </g>
        ))}
      </g>
    </g>
  );
}

function Cypress({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0V-45" stroke="#776947" strokeWidth="3" />
      <path
        d="M0-66C-8-50-12-24-8-13Q0-4 8-13C12-24 8-50 0-66Z"
        fill="#4f6647"
      />
      <path d="M0-66Q10-23 1-10Q15-15 7-41Z" fill="#3f5940" />
    </g>
  );
}

function Oak({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 0-2-38M-1-18-20-40M-1-26 17-48"
        fill="none"
        stroke="#79694d"
        strokeWidth="5"
      />
      <path
        d="M-31-31C-47-46-29-66-16-60C-10-81 16-77 23-61C43-67 53-41 31-30C18-20-17-19-31-31Z"
        fill="#657852"
      />
      <path d="M-34-43Q-35-64-16-60Q-10-80 12-70Q22-52 1-47Z" fill="#809060" />
    </g>
  );
}

function Windows({
  x,
  y,
  count = 3,
  color = '#657168',
}: {
  x: number;
  y: number;
  count?: number;
  color?: string;
}) {
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => (
        <path key={i} d={`M${x + i * 21} ${y}h8v13h-8Z`} />
      ))}
    </g>
  );
}

const LANDSCAPES: Record<
  RegionId,
  { sky: string; description: string; art: ReactNode }
> = {
  bordeaux: {
    sky: '#dce6df',
    description:
      'A slate-roofed château, formal vineyard rows, and a broad estuary beneath an Atlantic sky.',
    art: (
      <>
        <path
          d="M55 91Q83 73 111 89T186 90M376 58Q408 42 445 59T518 59"
          fill="none"
          stroke="#f7f5e9"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path d="M0 182Q112 144 238 163T640 152V400H0Z" fill="#a3b79b" />
        <path
          d="M640 164Q448 169 422 203T640 233V279Q345 224 382 199T640 154Z"
          fill="#94b8b4"
        />
        <path
          d="M468 192Q534 187 613 197M475 211 587 219"
          fill="none"
          stroke="#d5e4da"
          strokeWidth="3"
        />
        <path d="M0 211Q210 175 419 238T640 277V400H0Z" fill="#c6cfaa" />
        <Vineyard
          outline="M0 230 278 239 221 400H0Z"
          soil="#a9bb8c"
          vines="#607e54"
          rows={Array.from(
            { length: 12 },
            (_, i) => `M${-220 + i * 43} 420  ${65 + i * 18} 223`,
          )}
          width={7}
        />
        <Vineyard
          outline="M340 247 640 289V400H303Z"
          soil="#b3bf94"
          vines="#6a8358"
          rows={Array.from(
            { length: 11 },
            (_, i) => `M${322 + i * 17} 238  ${322 + i * 46} 415`,
          )}
          width={7}
        />
        <path d="M265 400 304 242 318 242 290 400Z" fill="#e9dec0" />
        <g transform="translate(218 162)">
          <path d="M0 24H150V87H0Z" fill="#eee5cd" />
          <path d="m-8 24 21-31h122l23 31Z" fill="#667577" />
          <path d="M-6 5H22V88H-6ZM127 5H155V88H127Z" fill="#e4dac0" />
          <path d="m-12 5 20-38 20 38ZM120 5l21-38 21 38Z" fill="#53676c" />
          <path d="M61 50Q75 35 89 50V87H61Z" fill="#657168" />
          <Windows x={32} y={36} count={5} />
          <Windows x={34} y={60} count={1} />
          <Windows x={108} y={60} count={1} />
          <Windows x={3} y={20} count={1} />
          <Windows x={137} y={20} count={1} />
        </g>
        <Oak x={171} y={252} scale={0.65} />
        <Oak x={393} y={265} scale={0.6} />
      </>
    ),
  },
  burgundy: {
    sky: '#e5e4d9',
    description:
      'Small walled vineyard parcels on limestone slopes, with a stone village and tiled church tower.',
    art: (
      <>
        <circle cx="482" cy="78" r="27" fill="#f7f1d8" />
        <path d="M0 175Q179 71 378 155T640 137V400H0Z" fill="#939f82" />
        <path d="M0 219 173 146 351 204 640 162V400H0Z" fill="#c2bd94" />
        <Vineyard
          outline="M0 224 170 157 233 181 62 294 0 279Z"
          soil="#b2b98b"
          vines="#7d8e5d"
          rows={Array.from(
            { length: 9 },
            (_, i) => `M${-25 + i * 31} 172l55 143`,
          )}
        />
        <Vineyard
          outline="M81 299 248 190 369 234 253 345Z"
          soil="#c9bf87"
          vines="#969052"
          rows={Array.from(
            { length: 10 },
            (_, i) => `M${74 + i * 27} 200l98 163`,
          )}
        />
        <Vineyard
          outline="M388 236 640 177V306L488 333Z"
          soil="#b4b584"
          vines="#6f8054"
          rows={Array.from(
            { length: 11 },
            (_, i) => `M${340 + i * 29} 202l97 168`,
          )}
        />
        <Vineyard
          outline="M0 301 69 315 240 364 354 400H0Z"
          soil="#8e9e70"
          vines="#526f4d"
          rows={Array.from(
            { length: 7 },
            (_, i) => `M-20 ${297 + i * 22}l355 103`,
          )}
          width={7}
        />
        <Vineyard
          outline="M276 358 383 254 640 355V400H369Z"
          soil="#aea775"
          vines="#777b49"
          rows={Array.from(
            { length: 12 },
            (_, i) => `M${238 + i * 34} 259l81 163`,
          )}
          width={6}
        />
        <path
          d="M0 290 259 357 380 244 640 337M66 304 243 183"
          fill="none"
          stroke="#e5ddc4"
          strokeWidth="8"
        />
        <path
          d="M0 295 258 362 380 249 640 342M70 308 247 187"
          fill="none"
          stroke="#a59d81"
          strokeWidth="2"
        />
        <g transform="translate(377 150)">
          <path
            d="M0 19H54V57H0ZM49 29H99V65H49ZM106 19H142V56H106Z"
            fill="#eee3c9"
          />
          <path
            d="M-7 19 25-3 61 19ZM44 29 73 7 106 29ZM101 19l23-22 24 22Z"
            fill="#966f55"
          />
          <path d="M74-27H95V56H74Z" fill="#ded3b7" />
          <path d="m70-27 14-27 15 27Z" fill="#766959" />
          <Windows x={10} y={32} count={2} />
          <Windows x={81} y={-13} count={1} />
          <Windows x={116} y={32} count={1} />
        </g>
      </>
    ),
  },
  napa: {
    sky: '#e9dfc5',
    description:
      'A wide sunlit valley between wooded ridges, an oak tree, and a timber winery beside straight vineyard rows.',
    art: (
      <>
        <circle cx="399" cy="69" r="34" fill="#fff1ca" />
        <path
          d="M0 110Q96 74 183 168L284 222 383 166Q530 47 640 88V400H0Z"
          fill="#889679"
        />
        <path
          d="M0 163Q107 115 210 221L296 250 411 211Q537 128 640 152V400H0Z"
          fill="#647d65"
        />
        <path
          d="M0 232Q115 179 231 241L289 255 395 231Q524 191 640 240V400H0Z"
          fill="#c6b783"
        />
        <path
          d="M0 201Q108 175 225 231Q133 221 0 226ZM391 203Q510 160 640 185V195Q506 180 391 214Z"
          fill="#e4e4d5"
          opacity=".7"
        />
        <Vineyard
          outline="M0 297 283 247 299 400H0Z"
          soil="#a5ac73"
          vines="#566f48"
          rows={Array.from(
            { length: 12 },
            (_, i) => `M${-170 + i * 45} 420  ${209 + i * 7} 240`,
          )}
          width={7}
        />
        <Vineyard
          outline="M317 250 640 284V400H328Z"
          soil="#b8b37d"
          vines="#71804c"
          rows={Array.from(
            { length: 13 },
            (_, i) => `M${315 + i * 12} 239  ${344 + i * 42} 418`,
          )}
          width={7}
        />
        <path d="M296 246 306 246 330 400H303Z" fill="#eee1b9" />
        <g transform="translate(401 214)">
          <path d="M0 0H117V60H0Z" fill="#a16950" />
          <path d="m-9 0 42-31h61l33 31Z" fill="#566864" />
          <path
            d="M12 4V55M24 4V55M92 4V55M104 4V55"
            stroke="#c18a65"
            strokeWidth="3"
          />
          <path d="M43 25H77V60H43Z" fill="#574f3e" />
          <path d="m45 27 30 30M75 27 45 57" stroke="#bf9670" strokeWidth="3" />
          <Windows x={14} y={16} count={1} color="#dacbac" />
          <Windows x={93} y={16} count={1} color="#dacbac" />
        </g>
        <Oak x={124} y={286} scale={1.28} />
      </>
    ),
  },
  mosel: {
    sky: '#d6e4e4',
    description:
      'A broad blue river bends between steep slate vineyard terraces, a hilltop castle, and a riverside village.',
    art: (
      <>
        <path
          d="M0 127Q128 57 254 167L345 214 427 169Q544 72 640 106V400H0Z"
          fill="#99afa5"
        />
        <path
          d="M0 159 156 119 303 230 356 235 491 140 640 167V400H0Z"
          fill="#708d7c"
        />
        <path
          d="M0 318Q160 225 289 231Q416 201 506 246T467 344Q375 377 355 400H0Z"
          fill="#c4ccb1"
        />
        <path
          d="M307 224C476 190 613 252 494 306C437 332 278 319 287 354C291 371 370 380 424 400H139C121 340 215 304 370 299C530 294 536 226 307 231Z"
          fill="#82b2b7"
        />
        <path
          d="M350 228C510 215 555 265 459 288M328 328Q210 343 289 377"
          fill="none"
          stroke="#d0e3db"
          strokeWidth="3"
        />
        <Vineyard
          outline="M0 180 152 139 282 230 0 314Z"
          soil="#94a67a"
          vines="#526f59"
          rows={Array.from(
            { length: 9 },
            (_, i) =>
              `M-15 ${170 + i * 19}Q123 ${129 + i * 16} 290 ${213 + i * 11}`,
          )}
          width={5}
        />
        <Vineyard
          outline="M482 158 640 183V400H452Q579 323 571 258Z"
          soil="#91a47c"
          vines="#526f58"
          rows={Array.from(
            { length: 10 },
            (_, i) =>
              `M${477 + i * 18} 151Q${600 + i * 11} 280 ${438 + i * 24} 424`,
          )}
          width={5}
        />
        <path
          d="M0 330Q91 286 193 274L219 286Q111 320 68 400H0Z"
          fill="#667f68"
        />
        <g transform="translate(124 116)">
          <path d="M0 0H20V-36H37V0H55V-20H69V13H0Z" fill="#75766b" />
          <path d="M16-36 29-56 42-36ZM51-20 62-40 73-20Z" fill="#4a6465" />
          <path d="M26-23h5v9h-5Z" fill="#d8d9bd" />
        </g>
        <g transform="translate(310 267)">
          {[0, 28, 57, 85].map((x, i) => (
            <g key={x} transform={`translate(${x} ${(i % 2) * 5})`}>
              <path d="M0 0H24V31H0Z" fill={i % 2 ? '#ddd8bc' : '#f4e9cd'} />
              <path d="m-3 0 15-22L27 0Z" fill="#596c71" />
              <path
                d="M3 6H21M3 19H21M12 1V31"
                stroke="#8c8470"
                strokeWidth="2"
              />
            </g>
          ))}
          <path d="M119-20H136V27H119Z" fill="#e7ddc3" />
          <path d="m116-20 12-34 12 34Z" fill="#4d626c" />
        </g>
      </>
    ),
  },
  tuscany: {
    sky: '#f0dfbd',
    description:
      'Golden rolling hills, a terracotta-roofed villa, and a winding lane lined with tall cypresses.',
    art: (
      <>
        <circle cx="489" cy="81" r="37" fill="#fff0c9" />
        <path
          d="M0 167Q124 108 254 181T496 156T640 166V400H0Z"
          fill="#b8b383"
        />
        <path d="M0 234Q152 111 356 210T640 217V400H0Z" fill="#d3bc7d" />
        <path d="M0 292Q167 216 335 266T640 249V400H0Z" fill="#9da36a" />
        <path d="M0 339Q196 232 383 345T640 313V400H0Z" fill="#b4b77a" />
        <Vineyard
          outline="M0 278Q109 224 252 255L365 400H0Z"
          soil="#9ea86d"
          vines="#677e49"
          rows={Array.from(
            { length: 10 },
            (_, i) =>
              `M${-160 + i * 50} 414Q${30 + i * 27} 307 ${76 + i * 19} 242`,
          )}
          width={7}
        />
        <path
          d="M640 387C379 382 497 298 367 275C248 253 277 232 337 219"
          fill="none"
          stroke="#f0dfb1"
          strokeWidth="17"
        />
        <g transform="translate(297 162)">
          <path d="M0 24H107V67H0Z" fill="#f2ddb5" />
          <path d="m-9 24 35-27 89 27Z" fill="#b56e4c" />
          <path d="M66-17H94V67H66Z" fill="#e3cba0" />
          <path d="m61-17 19-17 20 17Z" fill="#a46145" />
          <path d="M34 46a10 10 0 0 1 20 0v21H34Z" fill="#77744f" />
          <Windows x={10} y={35} count={1} />
          <Windows x={76} y={0} count={1} />
        </g>
        {[
          [272, 230, 0.72],
          [250, 252, 0.8],
          [294, 283, 0.9],
          [359, 298, 1],
          [415, 324, 1.1],
          [430, 371, 1.2],
          [488, 391, 1.3],
        ].map(([x, y, scale]) => (
          <Cypress key={x} x={x} y={y} scale={scale} />
        ))}
      </>
    ),
  },
  rioja: {
    sky: '#ead3b9',
    description:
      'A rugged limestone ridge above red-earth vineyards and a sandstone hill village with a square bell tower.',
    art: (
      <>
        <circle cx="143" cy="86" r="30" fill="#fae8c5" />
        <path
          d="M0 173 62 136 128 146 189 102 234 115 295 79 362 111 415 106 470 138 536 111 640 152V400H0Z"
          fill="#a5a092"
        />
        <path
          d="m0 174 128-22 75-32 36 17 57-39 29 28 48-4 56 40 69-18 142 26v73H0Z"
          fill="#beb097"
        />
        <path d="M0 235Q122 174 287 225T640 204V400H0Z" fill="#c4946e" />
        <path d="M0 307Q159 211 318 290T640 268V400H0Z" fill="#b27a5e" />
        <Vineyard
          outline="M0 264 152 222 296 269 73 400H0Z"
          soil="#c2926d"
          vines="#777d4e"
          rows={Array.from(
            { length: 12 },
            (_, i) => `M${-190 + i * 41} 411  ${73 + i * 22} 218`,
          )}
          width={6}
        />
        <Vineyard
          outline="M330 284 640 242V400H152Z"
          soil="#b8885c"
          vines="#626e44"
          rows={Array.from(
            { length: 11 },
            (_, i) => `M${196 + i * 41} 416  ${354 + i * 24} 249`,
          )}
          width={7}
        />
        <path
          d="M99 400 321 275 640 229"
          fill="none"
          stroke="#e1bd91"
          strokeWidth="9"
        />
        <g transform="translate(370 184)">
          <path d="M-17 46 40 11 141 38 157 71H-36Z" fill="#a18b60" />
          <path
            d="M0 6H46V50H0ZM41 14H91V55H41ZM89 1H132V48H89Z"
            fill="#dec29b"
          />
          <path
            d="m-6 6 26-21L52 6ZM37 14 61-9 97 14ZM83 1l28-20 28 20Z"
            fill="#995d49"
          />
          <path d="M53-45H79V48H53Z" fill="#e6cda4" />
          <path d="M49-45H83V-51H49ZM57-56H75V-63H57Z" fill="#a9815d" />
          <path d="M61-31a5 5 0 0 1 10 0v12H61Z" fill="#7d7058" />
          <Windows x={11} y={21} count={2} color="#857653" />
          <Windows x={99} y={17} count={2} color="#857653" />
        </g>
      </>
    ),
  },
  mendoza: {
    sky: '#cbdde1',
    description:
      'Snow-covered Andean peaks above an arid foothill plain, irrigated vines, poplars, and an adobe winery.',
    art: (
      <>
        <circle cx="512" cy="69" r="27" fill="#f7efd5" />
        <path
          d="M0 202 88 96 160 156 267 33 337 126 402 64 474 157 543 105 640 186V400H0Z"
          fill="#8d9faa"
        />
        <path
          d="m0 203 88-107 18 77 54-17 107-123 4 88 66 5 65-62 10 106 62-13 69-52 97 81v51H0Z"
          fill="#a9b6b8"
        />
        <path
          d="m209 100 58-67 51 69-35-15-17 19-14-28-21 27ZM370 109l32-45 39 50-30-14-13 14-10-14ZM67 122l21-26 27 32-28-8-9 13Z"
          fill="#f6f3e5"
        />
        <path
          d="M0 237 89 209 161 224 234 187 311 231 380 208 472 234 561 205 640 237V400H0Z"
          fill="#b2a594"
        />
        <path
          d="M0 273 152 248 372 262 511 247 640 271V400H0Z"
          fill="#d0b58b"
        />
        <Vineyard
          outline="M0 286 291 269 250 400H0Z"
          soil="#a2a279"
          vines="#5e7959"
          rows={Array.from(
            { length: 13 },
            (_, i) => `M${-180 + i * 41} 411  ${87 + i * 19} 264`,
          )}
          width={7}
        />
        <Vineyard
          outline="M334 272 640 291V400H309Z"
          soil="#b3ac7d"
          vines="#5a7351"
          rows={Array.from(
            { length: 12 },
            (_, i) => `M${327 + i * 15} 266  ${317 + i * 46} 417`,
          )}
          width={7}
        />
        <path d="M304 268 280 400" stroke="#e5d6b6" strokeWidth="19" />
        <path d="M304 268 280 400" stroke="#83abad" strokeWidth="7" />
        <g transform="translate(355 234)">
          <path d="M0 0H126V42H0Z" fill="#cb9b78" />
          <path d="M-5-4H131V5H-5Z" fill="#a4775b" />
          <path d="M13-5V-17H48V-5" fill="#c49a77" />
          <path d="M49 23a13 13 0 0 1 26 0v19H49Z" fill="#796a54" />
          <Windows x={12} y={14} count={1} color="#826f51" />
          <Windows x={99} y={14} count={1} color="#826f51" />
        </g>
        {[165, 185, 205, 225, 502, 523].map((x) => (
          <Cypress key={x} x={x} y={270} scale={0.6} />
        ))}
      </>
    ),
  },
  barossa: {
    sky: '#f1d7a7',
    description:
      'Dry golden country, rusty vineyard soil, an old stone farmhouse, and a spreading gum tree beneath a hot sun.',
    art: (
      <>
        <circle cx="478" cy="82" r="43" fill="#fff0c8" />
        <path d="M0 208Q113 152 256 185T640 165V400H0Z" fill="#c6ac72" />
        <path d="M0 258Q201 182 381 241T640 224V400H0Z" fill="#d9bc78" />
        <path d="M0 306Q170 253 354 290T640 278V400H0Z" fill="#bd8e5b" />
        <Vineyard
          outline="M0 316 303 270 411 400H0Z"
          soil="#b98c5d"
          vines="#69784b"
          rows={Array.from(
            { length: 12 },
            (_, i) =>
              `M${-163 + i * 51} 418Q${110 + i * 21} 326 ${159 + i * 15} 277`,
          )}
          width={9}
        />
        <path
          d="M426 265Q329 314 640 372"
          fill="none"
          stroke="#efd29a"
          strokeWidth="17"
        />
        <g transform="translate(367 221)">
          <path d="M0 0H127V54H0Z" fill="#e5c89e" />
          <path d="m-10 0 37-29h71l39 29Z" fill="#8b8170" />
          <path d="M18-14V-41H31V-23" fill="#ccb08a" />
          <path d="M45 24H64V54H45Z" fill="#776f50" />
          <Windows x={14} y={17} count={1} color="#7b8365" />
          <Windows x={88} y={17} count={2} color="#7b8365" />
          <path d="M-10 28H137L123 16H3Z" fill="#aa9370" />
          <path d="M-2 28V58M130 28V58" stroke="#9d8561" strokeWidth="3" />
        </g>
        <g transform="translate(144 290)">
          <path
            d="M0 0Q14-48 0-102M8-45-33-81M8-63 48-109M4-80-21-127"
            fill="none"
            stroke="#e1d4ac"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M-54-78Q-80-99-46-115Q-34-129-10-114Q17-101-5-81Q-30-68-54-78Z"
            fill="#819273"
          />
          <path
            d="M-35-118Q-53-139-24-149Q-6-164 14-146Q42-150 43-128Q28-103 2-117Z"
            fill="#748769"
          />
          <path
            d="M23-99Q7-124 33-135Q51-151 73-131Q99-134 99-114Q94-91 70-98Q45-83 23-99Z"
            fill="#6b8168"
          />
          <path
            d="M-17-104Q4-95 10-72M40-118 22-100"
            fill="none"
            stroke="#d9cea6"
            strokeWidth="4"
          />
        </g>
        <path
          d="m524 325 3-13 6 13m23 13 5-17 4 17m32-33 3-12 4 12"
          fill="none"
          stroke="#9e955f"
          strokeWidth="3"
        />
      </>
    ),
  },
};

export function RegionLandscape({ region }: { region: RegionId }) {
  const landscape = LANDSCAPES[region];
  return (
    <svg
      className="region-landscape"
      viewBox="0 0 640 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${REGIONS[region].name}: ${landscape.description}`}
    >
      <rect width="640" height="400" fill={landscape.sky} />
      {landscape.art}
    </svg>
  );
}
