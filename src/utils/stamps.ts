// Flower stamp definitions as SVG markup
// These are rendered onto the canvas when the user taps/clicks

export interface Stamp {
  id: string;
  name: string;
  emoji: string;
  svg: string;
  size: number;
}

export const FLOWER_STAMPS: Stamp[] = [
  {
    id: 'meskel-daisy',
    name: 'Meskel Daisy',
    emoji: '🌼',
    size: 48,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g transform="translate(50,50)">
        <ellipse cx="0" cy="-25" rx="12" ry="22" fill="#FFD700" stroke="#DAA520" stroke-width="1"/>
        <ellipse cx="0" cy="-25" rx="12" ry="22" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(60)"/>
        <ellipse cx="0" cy="-25" rx="12" ry="22" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(120)"/>
        <ellipse cx="0" cy="-25" rx="12" ry="22" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(180)"/>
        <ellipse cx="0" cy="-25" rx="12" ry="22" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(240)"/>
        <ellipse cx="0" cy="-25" rx="12" ry="22" fill="#FFD700" stroke="#DAA520" stroke-width="1" transform="rotate(300)"/>
        <circle cx="0" cy="0" r="12" fill="#8B4513"/>
      </g>
    </svg>`,
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    emoji: '🌻',
    size: 48,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g transform="translate(50,50)">
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(30)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(60)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(90)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(120)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(150)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(180)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(210)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(240)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(270)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(300)"/>
        <ellipse cx="0" cy="-28" rx="10" ry="20" fill="#FF8C00" stroke="#CC7000" stroke-width="1" transform="rotate(330)"/>
        <circle cx="0" cy="0" r="15" fill="#4A2800"/>
        <circle cx="-4" cy="-4" r="2" fill="#3A1800"/>
        <circle cx="4" cy="-4" r="2" fill="#3A1800"/>
        <circle cx="0" cy="4" r="2" fill="#3A1800"/>
      </g>
    </svg>`,
  },
  {
    id: 'bougainvillea',
    name: 'Bougainvillea',
    emoji: '🌺',
    size: 48,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g transform="translate(50,50)">
        <polygon points="0,-30 12,-10 -12,-10" fill="#DA121A" stroke="#AA0000" stroke-width="1"/>
        <polygon points="0,-30 12,-10 -12,-10" fill="#FF1493" stroke="#CC1177" stroke-width="1" transform="rotate(72)"/>
        <polygon points="0,-30 12,-10 -12,-10" fill="#DA121A" stroke="#AA0000" stroke-width="1" transform="rotate(144)"/>
        <polygon points="0,-30 12,-10 -12,-10" fill="#FF1493" stroke="#CC1177" stroke-width="1" transform="rotate(216)"/>
        <polygon points="0,-30 12,-10 -12,-10" fill="#DA121A" stroke="#AA0000" stroke-width="1" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="8" fill="#FFFACD"/>
      </g>
    </svg>`,
  },
  {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    size: 48,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g transform="translate(50,55)">
        <ellipse cx="0" cy="-20" rx="18" ry="20" fill="#C41E3A"/>
        <ellipse cx="-8" cy="-22" rx="14" ry="18" fill="#E0115F"/>
        <ellipse cx="8" cy="-22" rx="14" ry="18" fill="#E0115F"/>
        <ellipse cx="0" cy="-24" rx="10" ry="14" fill="#FF2D55"/>
        <path d="M0,-8 L0,35" stroke="#228B22" stroke-width="3"/>
        <path d="M0,10 L-15,0" stroke="#228B22" stroke-width="2" fill="none"/>
        <path d="M0,18 L12,8" stroke="#228B22" stroke-width="2" fill="none"/>
      </g>
    </svg>`,
  },
  {
    id: 'leaf',
    name: 'Leaf Branch',
    emoji: '🌿',
    size: 48,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g transform="translate(50,50)">
        <path d="M0,40 Q0,0 -30,-30" stroke="#228B22" stroke-width="2" fill="none"/>
        <ellipse cx="-15" cy="15" rx="12" ry="6" fill="#009A44" transform="rotate(-45 -15 15)"/>
        <ellipse cx="-22" cy="0" rx="10" ry="5" fill="#2E8B57" transform="rotate(-45 -22 0)"/>
        <ellipse cx="-5" cy="28" rx="10" ry="5" fill="#009A44" transform="rotate(-45 -5 28)"/>
        <path d="M0,40 Q0,0 30,-30" stroke="#228B22" stroke-width="2" fill="none"/>
        <ellipse cx="15" cy="15" rx="12" ry="6" fill="#009A44" transform="rotate(45 15 15)"/>
        <ellipse cx="22" cy="0" rx="10" ry="5" fill="#2E8B57" transform="rotate(45 22 0)"/>
        <ellipse cx="5" cy="28" rx="10" ry="5" fill="#009A44" transform="rotate(45 5 28)"/>
      </g>
    </svg>`,
  },
  {
    id: 'small-daisy',
    name: 'Small Daisy',
    emoji: '🏵️',
    size: 32,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g transform="translate(30,30)">
        <ellipse cx="0" cy="-15" rx="6" ry="12" fill="#FFFACD" stroke="#FFD700" stroke-width="0.5"/>
        <ellipse cx="0" cy="-15" rx="6" ry="12" fill="#FFFACD" stroke="#FFD700" stroke-width="0.5" transform="rotate(72)"/>
        <ellipse cx="0" cy="-15" rx="6" ry="12" fill="#FFFACD" stroke="#FFD700" stroke-width="0.5" transform="rotate(144)"/>
        <ellipse cx="0" cy="-15" rx="6" ry="12" fill="#FFFACD" stroke="#FFD700" stroke-width="0.5" transform="rotate(216)"/>
        <ellipse cx="0" cy="-15" rx="6" ry="12" fill="#FFFACD" stroke="#FFD700" stroke-width="0.5" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="6" fill="#FFD700"/>
      </g>
    </svg>`,
  },
];
