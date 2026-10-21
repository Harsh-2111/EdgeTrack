import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { CENTRAL_DB_POS } from '../data/mockData';
import { EdgeNodeMarker } from './EdgeNodeMarker';
import { ResourcePin } from './ResourcePin';
import { EdgeNode, Resource } from '../types';

interface CampusMapProps {
  onSelectResource: (res: Resource) => void;
  onSelectNode?: (node: EdgeNode) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  onSelectResource,
  onSelectNode,
}) => {
  const {
    nodes,
    resources,
    zones,
    selectedResourceId,
    hoveredResourceId,
    activeQueryResult,
    activeQueryAnimation,
    floatingLatencyTag,
    zoom,
    pan,
    setZoom,
    setPan,
    toggleNodeStatus,
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startDragPos = useRef({ x: 0, y: 0 });
  const startPanRef = useRef({ x: 0, y: 0 });

  const mapWidth = 1400;
  const mapHeight = 900;

  const clientPos = { x: 700, y: 840 };
  const routerPos = { x: 700, y: 490 };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    startDragPos.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startDragPos.current.x;
    const dy = e.clientY - startDragPos.current.y;
    setPan({
      x: startPanRef.current.x + dx,
      y: startPanRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      startDragPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startPanRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startDragPos.current.x;
    const dy = e.touches[0].clientY - startDragPos.current.y;
    setPan({
      x: startPanRef.current.x + dx,
      y: startPanRef.current.y + dy,
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.5, Math.max(0.65, prev * zoomFactor)));
  };

  const getNodePath = (node: EdgeNode) => {
    const startX = node.x;
    const startY = node.y;
    const endX = CENTRAL_DB_POS.x;
    const endY = CENTRAL_DB_POS.y;

    if (node.id === 'edge-a') {
      return `M ${startX} ${startY} C 460 160, 880 70, ${endX} ${endY}`;
    } else if (node.id === 'edge-b') {
      return `M ${startX} ${startY} C 960 210, 1100 130, ${endX} ${endY}`;
    } else if (node.id === 'edge-c') {
      return `M ${startX} ${startY} C 900 660, 1160 410, ${endX} ${endY}`;
    } else {
      return `M ${startX} ${startY} C 1180 400, 1200 240, ${endX} ${endY}`;
    }
  };

  const getRouterToNodePath = (nodeId: string) => {
    if (nodeId === 'edge-a') {
      return `M ${routerPos.x} ${routerPos.y} C 500 470, 380 390, 280 310`;
    } else if (nodeId === 'edge-c') {
      return `M ${routerPos.x} ${routerPos.y} C 670 560, 650 640, 630 710`;
    } else if (nodeId === 'edge-b') {
      return `M ${routerPos.x} ${routerPos.y} C 760 440, 780 370, 810 290`;
    } else {
      return `M ${routerPos.x} ${routerPos.y} C 900 520, 1050 580, 1160 660`;
    }
  };

  const targetAnimNodeId = activeQueryAnimation?.targetNodeId || 'edge-b';
  const targetNode = nodes.find((n) => n.id === targetAnimNodeId) || nodes[1] || nodes[0];

  const matchedResourceIds = activeQueryResult
    ? new Set(activeQueryResult.results.map((r) => r.id))
    : null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      onWheel={handleWheel}
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#180726] cursor-grab active:cursor-grabbing select-none"
    >
      <svg
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-full preserve-3d"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '50% 50%',
          transition: isDraggingRef.current ? 'none' : 'transform 0.12s ease-out',
        }}
      >
        <defs>
          <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#2E1242"
              strokeWidth="0.8"
              opacity="0.5"
            />
          </pattern>

          <pattern id="lawn-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#DEC7E7" opacity="0.3" />
          </pattern>

          <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="building-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0C0314" floodOpacity="0.45" />
          </filter>
        </defs>

        <rect width={mapWidth} height={mapHeight} fill="#180726" />
        <rect width={mapWidth} height={mapHeight} fill="url(#campus-grid)" />

        <path
          d="M 470 240 Q 560 210, 640 240 T 720 380 Q 640 450, 520 420 Z"
          fill="rgba(192, 132, 252, 0.08)"
          stroke="#C084FC"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        <path
          d="M 470 240 Q 560 210, 640 240 T 720 380 Q 640 450, 520 420 Z"
          fill="url(#lawn-dots)"
        />

        <ellipse
          cx="550"
          cy="310"
          rx="45"
          ry="30"
          fill="#2C123D"
          stroke="#C084FC"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        <circle cx="550" cy="310" r="12" fill="#FACC15" fillOpacity="0.25" />

        <path
          d="M 120 620 C 140 580, 200 590, 210 650 C 220 710, 160 740, 120 710 Z"
          fill="rgba(222, 199, 231, 0.08)"
          stroke="#DEC7E7"
          strokeWidth="1"
          strokeOpacity="0.25"
        />

        <g transform="translate(860, 680)">
          <rect
            x="-75"
            y="-45"
            width="150"
            height="90"
            rx="45"
            fill="#230D33"
            stroke="#FACC15"
            strokeWidth="1.5"
            strokeOpacity="0.45"
          />
          <rect
            x="-55"
            y="-28"
            width="110"
            height="56"
            rx="28"
            fill="#1A0728"
            stroke="#FACC15"
            strokeWidth="1"
            strokeDasharray="4 3"
            strokeOpacity="0.35"
          />
          <rect x="-35" y="-18" width="70" height="36" rx="4" fill="rgba(250, 204, 21, 0.14)" />
        </g>

        <g stroke="#321247" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 40 70 L 1360 70" strokeWidth="6" />
          <path d="M 40 70 L 1360 70" stroke="#4C1C69" strokeWidth="1.5" strokeDasharray="10 8" />

          <path d="M 40 500 L 1360 500" strokeWidth="8" />
          <path d="M 40 500 L 1360 500" stroke="#5C227F" strokeWidth="1.8" strokeDasharray="14 10" />

          <path d="M 40 840 L 1360 840" strokeWidth="6" />

          <path d="M 540 70 L 540 840" strokeWidth="7" />
          <path d="M 1080 70 L 1080 840" strokeWidth="5" />
          <path d="M 220 70 L 220 500" strokeWidth="4" strokeDasharray="4 4" stroke="#43175E" />
        </g>

        <g fill="#F3EAF6" stroke="#D1BBDC" strokeWidth="1" filter="url(#building-shadow)">
          <rect x="110" y="150" width="80" height="60" rx="10" />
          <rect x="120" y="160" width="60" height="40" rx="6" fill="#E6D6EC" />
          <rect x="220" y="140" width="110" height="85" rx="12" />
          <polygon points="275,155 315,182 235,182" fill="#D9C3E2" />
          <rect x="360" y="150" width="120" height="70" rx="10" />
          <rect x="100" y="320" width="140" height="90" rx="14" />
          <circle cx="170" cy="365" r="22" fill="#E2D0E8" stroke="#DEC7E7" strokeWidth="1" />
          <rect x="270" y="380" width="90" height="70" rx="10" />
          <rect x="390" y="370" width="100" height="80" rx="12" />

          <rect x="590" y="130" width="100" height="80" rx="12" />
          <rect x="720" y="120" width="140" height="75" rx="10" />
          <rect x="890" y="140" width="130" height="90" rx="12" />
          <polygon points="610,250 710,250 730,350 590,350" />
          <line x1="660" y1="250" x2="660" y2="350" stroke="#CBB4D7" strokeWidth="1.5" />
          <rect x="760" y="240" width="100" height="90" rx="12" />
          <rect x="890" y="260" width="130" height="80" rx="10" />
          <rect x="620" y="370" width="130" height="70" rx="10" />
          <rect x="780" y="360" width="120" height="85" rx="12" />
          <rect x="930" y="365" width="100" height="75" rx="10" />

          <rect x="220" y="600" width="110" height="50" rx="10" />
          <rect x="220" y="665" width="110" height="50" rx="10" />
          <rect x="355" y="600" width="110" height="50" rx="10" />
          <rect x="355" y="665" width="110" height="50" rx="10" />
          <rect x="490" y="610" width="140" height="100" rx="16" />
          <circle cx="560" cy="660" r="28" fill="#E5D6EA" stroke="#DEC7E7" strokeWidth="1" />
          <rect x="660" y="610" width="160" height="90" rx="14" />
          <rect x="660" y="730" width="130" height="65" rx="10" />
          <rect x="820" y="745" width="100" height="50" rx="8" />
        </g>

        {zones.map((zone) => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              rx="24"
              fill={zone.fillColor}
              stroke={zone.themeColor}
              strokeWidth="2"
              strokeDasharray="9 7"
              strokeOpacity="0.75"
              className="pointer-events-none"
            />
            <g transform={`translate(${zone.x + 24}, ${zone.y + 26})`}>
              <rect
                x="-8"
                y="-15"
                width={zone.name.length * 9 + 88}
                height="24"
                rx="12"
                fill="#200B30"
                fillOpacity="0.94"
                stroke={zone.themeColor}
                strokeWidth="1.2"
                strokeOpacity="0.7"
              />
              <circle cx="2" cy="-3" r="3.5" fill="#FACC15" />
              <text
                x="14"
                y="0.5"
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
                fontFamily="'Space Grotesk', sans-serif"
                letterSpacing="0.08em"
              >
                {zone.code} • {zone.name.toUpperCase()}
              </text>
            </g>
          </g>
        ))}

        <g opacity="0.9">
          <line
            x1={clientPos.x}
            y1={clientPos.y}
            x2={routerPos.x}
            y2={routerPos.y}
            stroke="#C084FC"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {nodes.map((n) => (
            <path
              key={`router-to-${n.id}`}
              d={getRouterToNodePath(n.id)}
              fill="none"
              stroke="#C084FC"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              opacity="0.35"
            />
          ))}

          <g transform={`translate(${clientPos.x}, ${clientPos.y})`}>
            <circle r="14" fill="#240D36" stroke="#FACC15" strokeWidth="2" />
            <circle r="6" fill="#FACC15" className="animate-pulse shadow-[0_0_8px_#FACC15]" />
            <rect
              x="-48"
              y="18"
              width="96"
              height="18"
              rx="9"
              fill="#180726"
              stroke="#FACC15"
              strokeWidth="1.2"
            />
            <text
              textAnchor="middle"
              y="30"
              fill="#FACC15"
              fontSize="8.5"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
            >
              YOU (OPERATOR)
            </text>
          </g>

          <g transform={`translate(${routerPos.x}, ${routerPos.y})`}>
            <polygon
              points="0,-12 12,0 0,12 -12,0"
              fill="#1B072B"
              stroke="#DEC7E7"
              strokeWidth="1.8"
            />
            <circle r="3" fill="#FACC15" />
            <rect
              x="-44"
              y="-28"
              width="88"
              height="16"
              rx="8"
              fill="#180726"
              stroke="#DEC7E7"
              strokeWidth="1"
              opacity="0.95"
            />
            <text
              textAnchor="middle"
              y="-17"
              fill="#DEC7E7"
              fontSize="8"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="600"
            >
              GATEWAY ROUTER
            </text>
          </g>
        </g>

        <g>
          {nodes.map((node) => {
            const isOnline = node.status === 'online';
            const isSyncing = node.status === 'syncing';
            const isOffline = node.status === 'offline';
            const pathData = getNodePath(node);
            const pathColor = isOnline ? '#C084FC' : isSyncing ? '#FACC15' : '#F43F5E';
            const pathId = `link-${node.id}`;

            return (
              <g key={node.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={pathColor}
                  strokeWidth="4"
                  opacity={isOffline ? 0.08 : isSyncing ? 0.45 : 0.22}
                />
                <path
                  id={pathId}
                  d={pathData}
                  fill="none"
                  stroke={pathColor}
                  strokeWidth={isOnline ? '1.8' : isSyncing ? '2.8' : '1.5'}
                  strokeDasharray={isOnline ? '6 6' : isSyncing ? '3 3' : '2 5'}
                  strokeOpacity={isOffline ? 0.4 : 0.85}
                />
                {!isOffline && (
                  <circle r={isSyncing ? 4 : 3} fill={isSyncing ? '#FACC15' : '#ffffff'}>
                    <animateMotion
                      path={pathData}
                      dur={isSyncing ? '1.2s' : '4.2s'}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {isSyncing && (
                  <circle r={6} fill="#FACC15" opacity="0.65">
                    <animateMotion
                      path={pathData}
                      dur="1.2s"
                      begin="0.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </g>

        {activeQueryAnimation && (
          <g filter="url(#packet-glow)">
            <circle r="6" fill="#FACC15">
              <animateMotion
                path={`M ${clientPos.x} ${clientPos.y} L ${routerPos.x} ${routerPos.y}`}
                dur="0.6s"
                repeatCount="indefinite"
              />
            </circle>

            <circle r="7" fill="#C084FC">
              <animateMotion
                path={getRouterToNodePath(targetAnimNodeId)}
                dur="0.8s"
                repeatCount="indefinite"
              />
            </circle>

            {activeQueryAnimation.fellBackToDb && (
              <circle r="7" fill="#FACC15">
                <animateMotion
                  path={getNodePath(targetNode)}
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        )}

        <g transform={`translate(${CENTRAL_DB_POS.x}, ${CENTRAL_DB_POS.y})`}>
          <circle r="36" fill="rgba(250, 204, 21, 0.12)" stroke="#FACC15" strokeWidth="1" strokeDasharray="3 3" />
          <circle
            r="28"
            fill="#1E0A2D"
            stroke="#FACC15"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0 0 14px rgba(250, 204, 21, 0.55))' }}
          />
          {activeQueryAnimation?.fellBackToDb && (
            <circle r="42" fill="none" stroke="#FACC15" strokeWidth="2" opacity="0.85" className="animate-ping" />
          )}
          <g transform="translate(-10, -10)">
            <ellipse cx="10" cy="5" rx="9" ry="3.5" fill="#FACC15" fillOpacity="0.85" />
            <path
              d="M 1 5 L 1 15 C 1 17 19 17 19 15 L 19 5"
              fill="none"
              stroke="#FACC15"
              strokeWidth="1.8"
            />
            <path
              d="M 1 10 C 1 12 19 12 19 10"
              fill="none"
              stroke="#FACC15"
              strokeWidth="1.5"
            />
          </g>
          <rect
            x="-48"
            y="32"
            width="96"
            height="20"
            rx="10"
            fill="#220D32"
            stroke="#FACC15"
            strokeWidth="1.2"
            fillOpacity="0.95"
          />
          <text
            textAnchor="middle"
            y="45.5"
            fill="#FACC15"
            fontSize="9.5"
            fontWeight="700"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="0.06em"
          >
            CENTRAL DB
          </text>
        </g>

        <g>
          {resources.map((res) => {
            const isMatched = matchedResourceIds ? matchedResourceIds.has(res.id) : false;
            const isDimmed = matchedResourceIds !== null && !isMatched;
            const isHoveredExt = hoveredResourceId === res.id;

            return (
              <ResourcePin
                key={res.id}
                resource={res}
                isSelected={res.id === selectedResourceId}
                isHoveredExternally={isHoveredExt}
                isDimmed={isDimmed}
                isMatched={isMatched}
                onClick={onSelectResource}
              />
            );
          })}
        </g>

        <g>
          {nodes.map((node) => {
            const isTargetedInQuery = activeQueryAnimation?.targetNodeId === node.id;
            return (
              <React.Fragment key={node.id}>
                {isTargetedInQuery && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="48"
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="2.5"
                    className="animate-ping"
                  />
                )}
                <EdgeNodeMarker
                  node={node}
                  onClick={(n) => {
                    if (onSelectNode) onSelectNode(n);
                    toggleNodeStatus(n.id);
                  }}
                />
              </React.Fragment>
            );
          })}
        </g>

        {floatingLatencyTag && (() => {
          const node = nodes.find((n) => n.id === floatingLatencyTag.nodeId) || nodes[1];
          return (
            <g transform={`translate(${node.x + 38}, ${node.y - 28})`}>
              <rect
                x="-8"
                y="-13"
                width="74"
                height="24"
                rx="12"
                fill="#200B30"
                stroke="#FACC15"
                strokeWidth="1.5"
                fillOpacity="0.95"
                style={{ filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.65))' }}
              />
              <circle cx="2" cy="-1" r="2.5" fill="#FACC15" />
              <text
                x="12"
                y="2.5"
                fill="#FACC15"
                fontSize="11"
                fontWeight="700"
                fontFamily="'JetBrains Mono', monospace"
              >
                {floatingLatencyTag.latencyMs} ms
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};
