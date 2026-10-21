import React, { useState } from 'react';
import { Resource, ResourceType } from '../types';

interface ResourcePinProps {
  resource: Resource;
  isSelected: boolean;
  isHoveredExternally?: boolean;
  isDimmed?: boolean;
  isMatched?: boolean;
  onClick: (resource: Resource) => void;
}

export const ResourcePin: React.FC<ResourcePinProps> = ({
  resource,
  isSelected,
  isHoveredExternally = false,
  isDimmed = false,
  isMatched = false,
  onClick,
}) => {
  const [isInternalHovered, setIsInternalHovered] = useState(false);
  const isHovered = isInternalHovered || isHoveredExternally;

  const statusColor =
    resource.status === 'Available'
      ? '#C084FC'
      : resource.status === 'In Use'
      ? '#FACC15'
      : '#F43F5E';

  const renderIcon = (type: ResourceType) => {
    switch (type) {
      case 'Lab':
        return (
          <path
            d="M-3 -4 L-3 -2 L-6 4 C-6.5 5 -5.8 6 -4.8 6 L4.8 6 C5.8 6 6.5 5 6 4 L3 -2 L3 -4 Z M-2 -4 L2 -4"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'Projector':
        return (
          <path
            d="M-5 -4 L5 -4 L5 2 L-5 2 Z M-3 4 L3 4 M0 2 L0 4 M-2 -1 L2 -1"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      case 'Vehicle':
        return (
          <path
            d="M-5 2 L-4 -2 L2 -2 L5 0 L5 2 Z M-3 4 A1 1 0 1 0 -3 2 A1 1 0 1 0 -3 4 Z M3 4 A1 1 0 1 0 3 2 A1 1 0 1 0 3 4 Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      case 'Equipment':
        return (
          <path
            d="M-4 -4 L4 -4 L4 4 L-4 4 Z M-2 -2 L2 -2 L2 2 L-2 2 Z M-5 0 L-4 0 M4 0 L5 0 M0 -5 L0 -4 M0 4 L0 5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      case 'Room':
        return (
          <path
            d="M-4 5 L-4 -5 L4 -5 L4 5 M-1 0 A0.8 0.8 0 1 1 -1 0.1"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      default:
        return <circle r="2" fill="#ffffff" />;
    }
  };

  return (
    <g
      transform={`translate(${resource.x}, ${resource.y})`}
      className="cursor-pointer group transition-opacity duration-300"
      opacity={isDimmed ? 0.25 : 1}
      onClick={(e) => {
        e.stopPropagation();
        onClick(resource);
      }}
      onMouseEnter={() => setIsInternalHovered(true)}
      onMouseLeave={() => setIsInternalHovered(false)}
    >
      {isMatched && (
        <circle
          r="16"
          fill="none"
          stroke="#FACC15"
          strokeWidth="1.8"
          opacity="0.85"
        >
          <animate
            attributeName="r"
            values="14;24"
            dur="1.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.9;0"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {(isSelected || isHovered) && (
        <>
          <circle
            r="19"
            fill="none"
            stroke="#FACC15"
            strokeWidth="2"
            strokeDasharray="4 3"
            className="animate-spin"
            style={{ animationDuration: '6s' }}
          />
          <circle
            r="23"
            fill="none"
            stroke="#FACC15"
            strokeWidth="1"
            opacity="0.6"
            className="animate-pulse"
          />
        </>
      )}

      <circle
        r={isHovered ? 15 : 13}
        fill="#260F38"
        stroke={statusColor}
        strokeWidth={isSelected || isHovered ? '2.5' : '1.8'}
        style={{
          filter:
            isSelected || isHovered
              ? 'drop-shadow(0 0 12px #FACC15)'
              : `drop-shadow(0 0 6px ${statusColor}70)`,
        }}
        className="transition-all duration-150"
      />

      <circle r={isHovered ? 13 : 11} fill={statusColor} fillOpacity="0.28" />

      <g className="transition-transform duration-150 group-hover:scale-110">
        {renderIcon(resource.type)}
      </g>

      <circle
        cx="9"
        cy="-9"
        r="2.5"
        fill={statusColor}
        stroke="#210A30"
        strokeWidth="1"
      />

      {isHovered && (
        <g transform="translate(0, -22)" className="pointer-events-none z-30">
          <rect
            x="-65"
            y="-24"
            width="130"
            height="24"
            rx="6"
            fill="#1A0626"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1"
            fillOpacity="0.96"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))' }}
          />
          <polygon points="0,0 -4,-4 4,-4" fill="#1A0626" />
          <circle cx="-54" cy="-12" r="2.5" fill={statusColor} />
          <text
            x="-46"
            y="-8"
            fill="#ffffff"
            fontSize="9"
            fontWeight="500"
            fontFamily="'Inter', sans-serif"
          >
            {resource.name.length > 17
              ? resource.name.slice(0, 16) + '…'
              : resource.name}
          </text>
        </g>
      )}
    </g>
  );
};
