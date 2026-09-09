import { DEFAULT_HOUSE, HOUSE_COLORS, houseInitials } from './houseIdentity';
import type { HouseIdentity } from './houseIdentity';

export function CrestDrawing({
  identity,
  name,
  ink,
}: {
  identity: HouseIdentity;
  name: string;
  ink?: string;
}) {
  return (
    <g
      fill="none"
      stroke={ink ?? HOUSE_COLORS[identity.color]}
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M10 8Q32 0 54 8V35Q54 52 32 61Q10 52 10 35Z" />
      {identity.motif === 'sun' ? (
        <>
          <path d="M21 23a11 11 0 0 1 22 0M18 23H46M32 5V9M17 10l4 4M47 10l-4 4" />
        </>
      ) : identity.motif === 'arch' ? (
        <>
          <path d="M22 25V19a10 10 0 0 1 20 0v6M18 25H46M25 15l-3-3M39 15l3-3M32 9V5" />
        </>
      ) : (
        <>
          <path d="M32 25V11Q43 5 44 12Q43 18 35 16M31 18Q18 19 19 10Q27 8 31 18" />
          <g fill={ink ?? HOUSE_COLORS[identity.color]} stroke="none">
            <circle cx="28" cy="24" r="2.5" />
            <circle cx="36" cy="24" r="2.5" />
            <circle cx="32" cy="29" r="2.5" />
          </g>
        </>
      )}
      <text
        x="32"
        y="46"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="15"
        stroke="none"
        fill={ink ?? HOUSE_COLORS[identity.color]}
        textLength={houseInitials(name, identity).length > 2 ? 29 : undefined}
        lengthAdjust="spacingAndGlyphs"
      >
        {houseInitials(name, identity)}
      </text>
    </g>
  );
}

export function HouseCrest({
  identity = DEFAULT_HOUSE,
  name,
  className = '',
}: {
  identity?: HouseIdentity;
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={`house-crest ${className}`}
      viewBox="0 0 64 66"
      aria-hidden="true"
    >
      <CrestDrawing identity={identity} name={name} />
    </svg>
  );
}
