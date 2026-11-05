"use client";

import { WORLD_MAP_COUNTRIES } from "./worldMapData";

// Geographically verified coordinates for India HQ and international hubs
// Corresponding to Robinson/Miller cylindrical projection (viewBox: 30.767 241.591 784.077 458.627)
const INDIA_HUB = { x: 601.9, y: 472.6, name: "INDIA (HQ)" };

const GLOBAL_MARKERS = [
  { id: "sf", name: "SAN FRANCISCO", x: 135, y: 405, anchor: "end", dx: -6, dy: 3 },
  { id: "nyc", name: "NEW YORK", x: 242, y: 398, anchor: "start", dx: 6, dy: -3 },
  { id: "sao", name: "SÃO PAULO", x: 295, y: 590, anchor: "end", dx: -6, dy: 4 },
  { id: "ldn", name: "LONDON", x: 401, y: 382, anchor: "end", dx: -6, dy: -3 },
  { id: "ber", name: "BERLIN", x: 430, y: 393, anchor: "start", dx: 6, dy: -3 },
  { id: "dxb", name: "DUBAI", x: 534, y: 467, anchor: "end", dx: -6, dy: 3 },
  { id: "sgp", name: "SINGAPORE", x: 659, y: 527, anchor: "start", dx: 6, dy: 4 },
  { id: "tyo", name: "TOKYO", x: 723, y: 404, anchor: "start", dx: 6, dy: 3 },
  { id: "syd", name: "SYDNEY", x: 755, y: 642, anchor: "start", dx: 6, dy: 3 },
];

function getArc(from, to) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const archHeight = Math.min(Math.max(dist * 0.22, 18), 75);
  const cx = mx;
  const cy = my - archHeight;
  return `M ${from.x} ${from.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`;
}

const WorldMapVisual = () => {
  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] flex items-center justify-center bg-[#070707] overflow-hidden select-none">
      <svg
        viewBox="30.767 241.591 784.077 458.627"
        className="w-full h-full object-contain"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Geographically accurate world map showing DesignTouch+ global presence"
        role="img"
      >
        <defs>
          {/* Subtle vignette */}
          <radialGradient
            id="dt-map-vignette"
            cx="50%"
            cy="50%"
            r="60%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#141414" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#070707" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#050505" stopOpacity="1" />
          </radialGradient>

          {/* India HQ radial green glow */}
          <radialGradient
            id="india-hub-glow"
            cx={INDIA_HUB.x}
            cy={INDIA_HUB.y}
            r="55"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.32" />
            <stop offset="45%" stopColor="#22c55e" stopOpacity="0.12" />
            <stop offset="80%" stopColor="#22c55e" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>

          {/* Green-to-Red arc gradients */}
          {GLOBAL_MARKERS.map((m) => (
            <linearGradient
              key={`grad-${m.id}`}
              id={`arc-grad-${m.id}`}
              x1={INDIA_HUB.x}
              y1={INDIA_HUB.y}
              x2={m.x}
              y2={m.y}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.75" />
            </linearGradient>
          ))}
        </defs>

        {/* Background base */}
        <rect x="30" y="241" width="786" height="460" fill="#070707" />
        <rect x="30" y="241" width="786" height="460" fill="url(#dt-map-vignette)" />

        {/* Graticule / coordinate grid lines */}
        <g stroke="#17171a" strokeWidth="0.5" strokeDasharray="3 4">
          <line x1="135" y1="241" x2="135" y2="700" />
          <line x1="240" y1="241" x2="240" y2="700" />
          <line x1="330" y1="241" x2="330" y2="700" />
          <line x1="423" y1="241" x2="423" y2="700" />
          <line x1="520" y1="241" x2="520" y2="700" />
          <line x1="602" y1="241" x2="602" y2="700" />
          <line x1="710" y1="241" x2="710" y2="700" />

          <line x1="30" y1="320" x2="815" y2="320" />
          <line x1="30" y1="400" x2="815" y2="400" />
          <line x1="30" y1="600" x2="815" y2="600" />
        </g>

        {/* Equator line */}
        <line
          x1="30"
          y1="520"
          x2="815"
          y2="520"
          stroke="#222225"
          strokeWidth="0.7"
          strokeDasharray="6 4"
        />

        {/* Realistic World Map: Verified Country Boundaries */}
        <g id="world-countries">
          {WORLD_MAP_COUNTRIES.map((item) => {
            const isIndia = item.id === "in";
            const countryFill = isIndia ? "#14261a" : "#141416";
            const countryStroke = isIndia ? "#22c55e" : "#242428";
            const countryStrokeWidth = isIndia ? 0.8 : 0.45;

            if (item.type === "group") {
              return (
                <g key={item.id} id={item.id}>
                  {item.paths.map((p, idx) => (
                    <path
                      key={`${item.id}-${idx}`}
                      d={p}
                      fill={countryFill}
                      stroke={countryStroke}
                      strokeWidth={countryStrokeWidth}
                      strokeLinejoin="round"
                    />
                  ))}
                </g>
              );
            }

            return (
              <path
                key={item.id}
                id={item.id}
                d={item.d}
                fill={countryFill}
                stroke={countryStroke}
                strokeWidth={countryStrokeWidth}
                strokeLinejoin="round"
              />
            );
          })}
        </g>

        {/* Connection Arcs from India to Global Hubs */}
        <g id="connection-arcs">
          {GLOBAL_MARKERS.map((m) => {
            const arcPath = getArc(INDIA_HUB, m);
            return (
              <path
                key={`arc-${m.id}`}
                d={arcPath}
                fill="none"
                stroke={`url(#arc-grad-${m.id})`}
                strokeWidth="1.1"
                strokeDasharray="2.5 2.5"
                strokeLinecap="round"
                opacity="0.65"
              />
            );
          })}
        </g>

        {/* Global Destination Markers (Red) */}
        <g id="destination-markers">
          {GLOBAL_MARKERS.map((m) => (
            <g key={`marker-${m.id}`}>
              {/* Outer faint red beacon circle */}
              <circle
                cx={m.x}
                cy={m.y}
                r="4.5"
                fill="#ef4444"
                fillOpacity="0.14"
                stroke="#ef4444"
                strokeOpacity="0.45"
                strokeWidth="0.6"
              />
              {/* Inner red dot */}
              <circle cx={m.x} cy={m.y} r="2" fill="#ef4444" />
              {/* City Label */}
              <text
                x={m.x + m.dx}
                y={m.y + m.dy}
                textAnchor={m.anchor}
                fill="#a1a1aa"
                fontSize="5.5"
                fontFamily="monospace"
                fontWeight="700"
                letterSpacing="0.07em"
                className="select-none pointer-events-none"
              >
                {m.name}
              </text>
            </g>
          ))}
        </g>

        {/* India HQ Hub (Restrained Green Marker & Glow) */}
        <g id="india-hq-hub">
          {/* Soft radial green glow */}
          <circle
            cx={INDIA_HUB.x}
            cy={INDIA_HUB.y}
            r="55"
            fill="url(#india-hub-glow)"
          />

          {/* Restrained pulse rings */}
          <circle
            cx={INDIA_HUB.x}
            cy={INDIA_HUB.y}
            r="14"
            fill="none"
            stroke="#22c55e"
            strokeOpacity="0.3"
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
          <circle
            cx={INDIA_HUB.x}
            cy={INDIA_HUB.y}
            r="7"
            fill="none"
            stroke="#22c55e"
            strokeOpacity="0.65"
            strokeWidth="0.8"
          />

          {/* Solid green core */}
          <circle cx={INDIA_HUB.x} cy={INDIA_HUB.y} r="3" fill="#22c55e" />
          <circle cx={INDIA_HUB.x} cy={INDIA_HUB.y} r="1.2" fill="#ffffff" />

          {/* HUD Badge: INDIA (HQ) */}
          <g transform="translate(611, 463)">
            <rect
              x="0"
              y="0"
              width="56"
              height="15"
              rx="2"
              fill="#0b0b0b"
              stroke="#22c55e"
              strokeOpacity="0.7"
              strokeWidth="0.65"
            />
            <circle cx="5.5" cy="7.5" r="1.5" fill="#22c55e" />
            <text
              x="10.5"
              y="10.2"
              fill="#ffffff"
              fontSize="6.2"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.08em"
            >
              INDIA (HQ)
            </text>
          </g>
        </g>

        {/* HUD Telemetry in corners */}
        <g id="hud-telemetry" className="select-none pointer-events-none">
          <g transform="translate(675, 260)">
            <text
              x="0"
              y="0"
              fill="#71717a"
              fontSize="5.2"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.16em"
            >
              {"// GLOBAL PRESENCE"}
            </text>
            <text
              x="0"
              y="8"
              fill="#22c55e"
              fontSize="5.2"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.1em"
            >
              {"ACTIVE HUBS: 10 // WORLDWIDE"}
            </text>
          </g>

          <g transform="translate(42, 690)">
            <text
              x="0"
              y="0"
              fill="#52525b"
              fontSize="5.2"
              fontFamily="monospace"
              letterSpacing="0.12em"
            >
              {"HQ: 20°35'N 78°57'E • WORLDWIDE CLIENT NETWORK"}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default WorldMapVisual;
