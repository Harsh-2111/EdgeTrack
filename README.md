# EdgeTrack - Smart Campus Resource Tracking

EdgeTrack is a map-first campus resource command centre powered by simulated edge computing nodes. Designed for modern university campuses and research institutes, it tracks critical assets (laboratories, specialized equipment, campus transit, executive rooms, and AV projectors) with sub-100ms response times, offline-first resilience, and an immutable cryptographic audit ledger.

---

## 🎨 Design & Aesthetic Theme

- **Palette**: Deep plum, midnight violet, and rich aubergine surfaces (`#14071F`, `#1F0B2E`, `#290F3B`) with glowing lilac accents (`#DEC7E7`, `#C084FC`).
- **Badges & Accents**: High-contrast yellow badges (`#FACC15`, `#FEF08A`) for resource IDs, active query tags, live telemetry, and system highlights.
- **Surface Styling**: Frosted glass panels with backdrop blur (`backdrop-filter: blur(20px)`), subtle specular borders (`rgba(255, 255, 255, 0.16)`), and rounded corners.
- **Typography**: Space Grotesk for prominent headers, Inter for legible body copy, and JetBrains Mono for telemetry, hashes, latencies, and resource codes.
- **Mobile & Device Responsive**: Fluidly adapts across mobile phones, tablets, and wide desktop screens without content overlap or clipping.

---

## ⚡ Core Architecture & Edge Simulation

### 1. Map-First Command Centre
- Interactive vector campus SVG canvas with distinct physical zones (Library & Admin, Engineering & Labs, Hostels & Sports).
- Smooth dragging, panning, touch support on mobile, and zooming controls with quick view reset.
- Animated dynamic telemetry beams connecting edge nodes to the Central Database with moving data packets.

### 2. Distributed Edge Query Engine
- **Local Edge Hits**: Targeted single-zone queries route directly to the active zone's edge node, returning cached results in 25–120ms.
- **Central DB Fallback & Cache Warmup**: Multi-zone searches or cache misses query the Central DB (240–520ms latency) and automatically populate the local edge cache for subsequent speedups.
- **Visualized Query Hop Route**: Live animated packet pulses travel along `Dashboard -> Router -> Edge Node -> Central DB`.

### 3. Network Partition & Write-Ahead Sync
- Toggle edge nodes between **Online** and **Offline** to simulate network severance.
- In offline partitions, writes are stored in the edge node's local write-ahead queue (`Queued: N`).
- When network connectivity returns, clicking **Sync Now** initiates a transactional replay that commits pending changes to the Central DB and marks records as synchronized.

### 4. Cryptographic SHA-256 Audit Trail
- Every resource mutation generates an immutable, chained audit log entry using client-side SHA-256 hashing.
- Features real-time chain validation (`Verify Chain`).
- Includes a **Tamper** demonstration button that mutates a block in memory to showcase how cryptographic integrity checking immediately flags forged access.
- Filter audit logs by node origin, action, or keyword, and export the entire ledger as a CSV file.

### 5. Role-Based Access Control (RBAC)
- **Admin**: Full access. Can deploy new edge nodes, reallocate partitions, balance workloads across zones, and modify resource states.
- **Staff**: Operational access. Can update resource availability and inspect real-time queries.
- **Auditor**: Compliance inspection. Read-only resource views with full inspection of the cryptographic ledger and chain verification.

### 6. Guided Presentation Demo Tour
- A single-click 6-step guided walkthrough demonstrating edge resolution, Central DB fallback, partition isolation, write-ahead queuing, reconciliation, and ledger verification.

---

## 📱 Device Responsiveness

- **Desktop & Laptop**: Spacious command centre with floating control bars, collapsible legend, pan/zoom tools, and contextual side drawers.
- **Tablet & Mobile**: Adaptive top header bar that avoids layout collisions, touch drag and pinch pan on the SVG canvas, full-width touch-friendly side drawers, and stacked action buttons.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Theme Variables
- **Animations**: Motion (Framer Motion v12)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Cryptography**: Synchronous SHA-256 Hash Chain Implementation

---

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
```
