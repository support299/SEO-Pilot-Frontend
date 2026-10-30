import { useEffect, useRef, useState } from "react";
import type { GridPoint } from "@/types/localVisibility";

type GridMapProps = {
  points: GridPoint[];
  size: number;
  radiusMiles?: number;
  radiusKm?: number;
  centerLatitude?: number;
  centerLongitude?: number;
  businessName?: string;
};

const TILE_SIZE = 256;

function latLngToWorld(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  const y = (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function getDistanceAndBearing(
  centerLat: number,
  centerLng: number,
  targetLat: number,
  targetLng: number
): { distanceMiles: number; direction: string } {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((targetLat - centerLat) * Math.PI) / 180;
  const dLng = ((targetLng - centerLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((centerLat * Math.PI) / 180) * Math.cos((targetLat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMiles = Math.round(R * c * 10) / 10;

  if (distanceMiles < 0.05) {
    return { distanceMiles: 0, direction: "at office" };
  }

  const y = Math.sin(dLng) * Math.cos((targetLat * Math.PI) / 180);
  const x =
    Math.cos((centerLat * Math.PI) / 180) * Math.sin((targetLat * Math.PI) / 180) -
    Math.sin((centerLat * Math.PI) / 180) * Math.cos((targetLat * Math.PI) / 180) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
  const index = Math.round(brng / 45) % 8;
  return { distanceMiles, direction: directions[index] ?? "North" };
}

function computeOptimalZoom(width: number, radiusMiles: number, centerLat: number): number {
  if (width <= 0) return 12;
  const cosLat = Math.max(0.1, Math.cos((centerLat * Math.PI) / 180));
  // Diameter of search grid in degrees longitude
  const deltaLng = (2.4 * radiusMiles) / (69.17 * cosLat);
  const targetPx = width * 0.72;
  const scale = (targetPx * 360) / (deltaLng * 256);
  const zoom = Math.round(Math.log2(scale));
  return Math.max(9, Math.min(16, zoom));
}

function rankClasses(point: Pick<GridPoint, "rank" | "failed">) {
  if (point.failed) return "border-dashed border-neutral-400 bg-surface text-neutral-600";
  if (point.rank === null) return "border-neutral-300 bg-neutral-200 text-neutral-700";
  if (point.rank <= 3) return "border-emerald-700 bg-emerald-600 text-white shadow-emerald-900/30";
  if (point.rank <= 10) return "border-amber-500 bg-amber-400 text-neutral-950 shadow-amber-900/20";
  return "border-orange-600 bg-orange-500 text-white shadow-orange-900/30";
}

function rankLabel(point: GridPoint) {
  if (point.failed) return "–";
  return point.rank === null ? "20+" : String(point.rank);
}

function movement(point: GridPoint) {
  if (point.failed || point.previous_rank === null || point.rank === null) return null;
  return point.previous_rank - point.rank; // positive = moved up
}

function getTileUrl(style: "streets" | "detailed" | "satellite", z: number, x: number, y: number): string {
  if (style === "detailed") {
    // ESRI World Street Map uses {z}/{y}/{x}
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
  }
  if (style === "satellite") {
    // ESRI World Imagery uses {z}/{y}/{x}
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  }
  // OpenStreetMap Standard uses {z}/{x}/{y} — completely free, open-source, no API key
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

export function GridMap({
  points,
  size,
  radiusMiles,
  radiusKm,
  centerLatitude,
  centerLongitude,
  businessName,
}: GridMapProps) {
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [mapStyle, setMapStyle] = useState<"streets" | "detailed" | "satellite">("streets");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 560, height: 500 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const miles = radiusMiles ?? (radiusKm ? Math.round((radiusKm / 1.609344) * 10) / 10 : 5);

  const centerLat =
    centerLatitude ?? (points.length > 0 ? points.reduce((acc, p) => acc + p.latitude, 0) / points.length : 29.7604);
  const centerLng =
    centerLongitude ?? (points.length > 0 ? points.reduce((acc, p) => acc + p.longitude, 0) / points.length : -95.3698);

  const defaultZoom = computeOptimalZoom(containerSize.width, miles, centerLat);
  const [userZoom, setUserZoom] = useState<number | null>(null);
  const currentZoom = userZoom ?? defaultZoom;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 560,
          height: containerRef.current.clientHeight || 500,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const active = points.find((point) => `${point.row}-${point.col}` === activeKey) ?? null;
  const moved = active ? movement(active) : null;
  const activeDistance = active ? getDistanceAndBearing(centerLat, centerLng, active.latitude, active.longitude) : null;

  // Web Mercator tile calculation
  const halfW = containerSize.width / 2;
  const halfH = containerSize.height / 2;
  const centerWorld = latLngToWorld(centerLat, centerLng, currentZoom);

  const minWorldX = centerWorld.x - halfW - panOffset.x;
  const maxWorldX = centerWorld.x + halfW - panOffset.x;
  const minWorldY = centerWorld.y - halfH - panOffset.y;
  const maxWorldY = centerWorld.y + halfH - panOffset.y;

  const minTileX = Math.floor(minWorldX / TILE_SIZE);
  const maxTileX = Math.floor(maxWorldX / TILE_SIZE);
  const minTileY = Math.floor(minWorldY / TILE_SIZE);
  const maxTileY = Math.floor(maxWorldY / TILE_SIZE);
  const maxTileIndex = Math.pow(2, currentZoom);

  const tiles: { key: string; x: number; y: number; left: number; top: number }[] = [];
  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      if (ty >= 0 && ty < maxTileIndex) {
        const wrappedX = ((tx % maxTileIndex) + maxTileIndex) % maxTileIndex;
        tiles.push({
          key: `${currentZoom}-${wrappedX}-${ty}`,
          x: wrappedX,
          y: ty,
          left: Math.round(tx * TILE_SIZE - minWorldX),
          top: Math.round(ty * TILE_SIZE - minWorldY),
        });
      }
    }
  }

  // Radius circle calculation
  const cosLat = Math.max(0.1, Math.cos((centerLat * Math.PI) / 180));
  const deltaLngRadius = miles / (69.17 * cosLat);
  const eastWorld = latLngToWorld(centerLat, centerLng + deltaLngRadius, currentZoom);
  const radiusPx = Math.abs(eastWorld.x - centerWorld.x);
  const officeScreenX = halfW + panOffset.x;
  const officeScreenY = halfH + panOffset.y;

  function handlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  }

  function resetView() {
    setPanOffset({ x: 0, y: 0 });
    setUserZoom(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Controls: View mode & Map layer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              viewMode === "map"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Map view
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              viewMode === "grid"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Grid view
          </button>
        </div>

        {viewMode === "map" ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Map layer:</span>
            <button
              type="button"
              onClick={() => setMapStyle("streets")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium border transition ${
                mapStyle === "streets"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => setMapStyle("detailed")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium border transition ${
                mapStyle === "detailed"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              Detailed
            </button>
            <button
              type="button"
              onClick={() => setMapStyle("satellite")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium border transition ${
                mapStyle === "satellite"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              Satellite
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main visualization container */}
        <div>
          {viewMode === "map" ? (
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative h-[500px] sm:h-[540px] w-full overflow-hidden rounded-2xl border border-border bg-slate-100 shadow-inner select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {/* Map Tile Layer */}
              <div className="pointer-events-none absolute inset-0">
                {tiles.map((tile) => (
                  <img
                    key={tile.key}
                    src={getTileUrl(mapStyle, currentZoom, tile.x, tile.y)}
                    alt=""
                    loading="eager"
                    className="absolute h-[256px] w-[256px] max-w-none transition-opacity duration-150"
                    style={{ left: tile.left, top: tile.top }}
                  />
                ))}
              </div>

              {/* Radius Circle Overlay from Office */}
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/60 bg-primary/10 transition-all duration-75"
                style={{
                  left: officeScreenX,
                  top: officeScreenY,
                  width: radiusPx * 2,
                  height: radiusPx * 2,
                }}
              >
                {/* Distance Badge on top perimeter of radius */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/40 bg-surface/95 px-2 py-0.5 text-[11px] font-semibold text-primary shadow-xs">
                  {miles} mi search radius
                </div>
              </div>

              {/* Central Office Pin */}
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                style={{ left: officeScreenX, top: officeScreenY }}
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white shadow-lg ring-2 ring-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                  </svg>
                </div>
                <span className="mt-1 rounded border border-border bg-surface/95 px-1.5 py-0.5 text-[10px] font-bold text-foreground shadow-xs whitespace-nowrap">
                  {businessName || "Office"}
                </span>
              </div>

              {/* Grid Spots (Colored Ranking Pins) */}
              {points.map((point) => {
                const pointWorld = latLngToWorld(point.latitude, point.longitude, currentZoom);
                const px = halfW + (pointWorld.x - centerWorld.x) + panOffset.x;
                const py = halfH + (pointWorld.y - centerWorld.y) + panOffset.y;
                const key = `${point.row}-${point.col}`;
                const isSelected = activeKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveKey(key)}
                    style={{ left: px, top: py }}
                    title={`Point row ${point.row + 1}, col ${point.col + 1}: Rank #${rankLabel(point)}`}
                    aria-label={`Grid point row ${point.row + 1}, col ${point.col + 1}: Rank ${rankLabel(point)}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 cursor-pointer items-center justify-center rounded-full border-2 text-xs sm:text-sm font-bold shadow-md transition hover:scale-115 hover:z-40 ${rankClasses(
                      point
                    )} ${isSelected ? "scale-120 ring-4 ring-primary ring-offset-2 z-40" : ""}`}
                  >
                    {rankLabel(point)}
                  </button>
                );
              })}

              {/* Map Floating Badges & Controls */}
              <div className="pointer-events-none absolute top-3 left-3 z-30 flex flex-col gap-1.5">
                <div className="rounded-lg border border-border/80 bg-surface/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-xs">
                  {miles} mi radius · {size}×{size} grid ({points.length} spots)
                </div>
              </div>

              <div className="absolute top-3 right-3 z-30 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setUserZoom((z) => Math.min(16, (z ?? defaultZoom) + 1))}
                  title="Zoom In"
                  aria-label="Zoom In"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface/95 text-base font-bold text-foreground shadow-sm transition hover:bg-surface active:scale-95"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setUserZoom((z) => Math.max(9, (z ?? defaultZoom) - 1))}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface/95 text-base font-bold text-foreground shadow-sm transition hover:bg-surface active:scale-95"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  title="Reset view to office"
                  aria-label="Reset view to office"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface/95 text-xs font-semibold text-muted shadow-sm transition hover:text-foreground active:scale-95"
                >
                  ⌖
                </button>
              </div>

              {/* Attribution */}
              <div className="pointer-events-none absolute bottom-1 right-2 z-20 text-[10px] text-muted/80">
                {mapStyle === "streets" ? "© OpenStreetMap contributors" : "© Esri, Maxar, Earthstar Geographics"}
              </div>
            </div>
          ) : (
            /* Abstract Grid View (fallback) */
            <div className="mx-auto w-full max-w-[520px] rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.15em] text-muted">North</p>
              <div
                className="mt-2 grid gap-2 sm:gap-3"
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              >
                {points.map((point) => {
                  const key = `${point.row}-${point.col}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveKey(key)}
                      aria-label={`Grid point row ${point.row + 1}, column ${point.col + 1}: ${rankLabel(point)}`}
                      className={`flex aspect-square items-center justify-center rounded-full border-2 text-sm font-semibold transition hover:scale-105 ${rankClasses(
                        point
                      )} ${activeKey === key ? "ring-2 ring-primary ring-offset-2" : ""}`}
                    >
                      {rankLabel(point)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-3 text-center text-xs text-muted">
            Each colored circle is a Google Maps search spot up to {miles} miles from your office. The number is where
            your business ranks there.
          </p>

          <Legend />
        </div>

        {/* Spot Detail & Competitor List Panel */}
        <div className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-xs">
          {active ? (
            <>
              <div className="border-b border-border pb-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-foreground">
                    {active.failed
                      ? "Check failed"
                      : active.rank === null
                      ? "Not in top 20 here"
                      : `Ranks #${active.rank} here`}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${rankClasses(
                      active
                    )}`}
                  >
                    #{rankLabel(active)}
                  </span>
                </div>

                {moved !== null && moved !== 0 ? (
                  <p className={`mt-1 text-xs font-semibold ${moved > 0 ? "text-success" : "text-danger"}`}>
                    {moved > 0 ? "↑" : "↓"} {Math.abs(moved)} {Math.abs(moved) === 1 ? "place" : "places"} since previous
                    scan
                  </p>
                ) : null}

                {activeDistance ? (
                  <p className="mt-1.5 text-xs font-medium text-foreground">
                    📍{" "}
                    {activeDistance.distanceMiles === 0
                      ? "At your office location"
                      : `${activeDistance.distanceMiles} miles ${activeDistance.direction} of office`}
                  </p>
                ) : null}

                <p className="mt-0.5 text-[11px] text-muted">
                  Coords: {active.latitude.toFixed(4)}, {active.longitude.toFixed(4)}
                </p>
              </div>

              {active.top_results.length > 0 ? (
                <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">Top rankings at this spot</p>
                  <ol className="mt-2 space-y-2">
                    {active.top_results.map((result) => (
                      <li
                        key={`${result.rank}-${result.title}`}
                        className="rounded-lg border border-border/60 bg-background/60 p-2 text-xs transition hover:bg-background"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-foreground">#{result.rank}</span>
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">{result.title}</span>
                        </div>
                        {result.rating ? (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                            <span className="text-amber-500">★ {result.rating}</span>
                            <span>({result.reviews ?? 0} reviews)</span>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="mt-4 text-xs text-muted">No competitor details recorded for this spot.</p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-2xl">🗺️</span>
              <p className="mt-2 text-sm font-medium text-foreground">Select a spot on the map</p>
              <p className="mt-1 max-w-[200px] text-xs text-muted">
                Click any numbered circle to view search rankings, competitors, and distance from your office.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items: { label: string; className: string }[] = [
    { label: "1–3 (Top 3)", className: "bg-emerald-600" },
    { label: "4–10 (First page)", className: "bg-amber-400" },
    { label: "11–20", className: "bg-orange-500" },
    { label: "20+ (Not in top 20)", className: "bg-neutral-300" },
  ];
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-xs">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted">
          <span className={`h-3 w-3 rounded-full ${item.className} shadow-2xs`} />
          {item.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <span className="h-3 w-3 rounded-full border border-dashed border-primary bg-primary/20" />
        Office radius
      </span>
    </div>
  );
}
