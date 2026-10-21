import React from 'react';
import { EdgeNode } from '../types';

interface EdgeNodeMarkerProps {
  node: EdgeNode;
  onClick: (node: EdgeNode) => void;
  onToggleStatus?: (nodeId: string) => void;
}

export const EdgeNodeMarker: React.FC<EdgeNodeMarkerProps> = ({ node, onClick }) => {
  const isOnline = node.status === 'online';
  const isSyncing = node.status === 'syncing';
  const isOffline = node.status === 'offline';

  const primaryColor = isOnline ? '#C084FC' : isSyncing ? '#FACC15' : '#F43F5E';
  const glowColor = isOnline
    ? 'rgba(192, 132, 252, 0.55)'
    : isSyncing
    ? 'rgba(250, 204, 21, 0.6)'
    : 'rgba(244, 63, 94, 0.6)';

  const hexPoints = [
    [0, -18],
    [15.6, -9],
    [15.6, 9],
    [0, 18],
    [-15.6, 9],
    [-15.6, -9],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className="cursor-pointer group"
      onClick={() => onClick(node)}
    >
      {!isOffline && (
        <>
          <circle
            r="18"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1.2"
            opacity="0.75"
          >
            <animate
              attributeName="r"
              values="18;48"
              dur={isSyncing ? '1.5s' : '3s'}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.75;0"
              dur={isSyncing ? '1.5s' : '3s'}
              repeatCount="indefinite"
            />
          </circle>
          <circle
            r="18"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1"
            opacity="0.4"
          >
            <animate
              attributeName="r"
              values="18;64"
              dur={isSyncing ? '1.5s' : '3s'}
              begin={isSyncing ? '0.7s' : '1.4s'}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.55;0"
              dur={isSyncing ? '1.5s' : '3s'}
              begin={isSyncing ? '0.7s' : '1.4s'}
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      <circle
        r="22"
        fill="#260F38"
        stroke={primaryColor}
        strokeWidth="1.5"
        strokeOpacity="0.5"
        style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
      />

      <polygon
        points={hexPoints}
        fill="#210C32"
        stroke={primaryColor}
        strokeWidth="2.2"
        className="transition-transform duration-200 group-hover:scale-110"
      />

      <polygon
        points={[
          [0, -9],
          [7.8, -4.5],
          [7.8, 4.5],
          [0, 9],
          [-7.8, 4.5],
          [-7.8, -4.5],
        ]
          .map(([px, py]) => `${px},${py}`)
          .join(' ')}
        fill={primaryColor}
        opacity={isOffline ? 0.35 : 0.9}
      />

      <circle r="2.5" fill="#ffffff" opacity={isOffline ? 0.4 : 0.95} />

      <g transform="translate(0, 30)">
        <rect
          x="-38"
          y="-11"
          width="76"
          height="22"
          rx="11"
          fill="#1F0A2E"
          stroke={primaryColor}
          strokeWidth="1.2"
          fillOpacity="0.95"
        />
        <text
          textAnchor="middle"
          y="3.5"
          fill="#ffffff"
          fontSize="9.5"
          fontWeight="600"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="0.08em"
        >
          {node.code}
        </text>
        <circle
          cx="28"
          cy="-1"
          r="2.5"
          fill={primaryColor}
          className={!isOffline ? 'animate-pulse' : ''}
        />
      </g>
    </g>
  );
};
