import React, { useEffect, useMemo, useState } from "react";
import { geoIdentity, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import { WatercolorMapProps, WatercolorMarker } from "./WatercolorMap.types";
import { WATERCOLOR_PALETTES } from "./palettes";

// Stable per-region color: hash the region key into the palette.
function hashKey(key: string): number {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
}

// Mean latitude of a FeatureCollection, for the cos(lat) aspect correction.
function meanLat(fc: FeatureCollection): number {
    let min = Infinity;
    let max = -Infinity;
    const scan = (c: any): void => {
        if (typeof c[0] === "number") {
            if (c[1] < min) min = c[1];
            if (c[1] > max) max = c[1];
        } else {
            for (const x of c) scan(x);
        }
    };
    for (const f of fc.features) scan((f.geometry as any).coordinates);
    return Number.isFinite(min) ? (min + max) / 2 : 0;
}

/**
 * A fast, dependency-light SVG "watercolor" choropleth map.
 *
 * Renders region polygons with hashed fills + white street strokes, optional
 * road lines, and pins for points of interest. Markers whose coordinates fall
 * outside the mapped area are silently dropped (end users see nothing); the
 * `onOutOfBounds` callback + a dev-only console.warn surface them to developers.
 * The in-map warning badge is opt-in (`showOutOfBoundsWarning`) for debugging.
 *
 * Uses a planar `geoIdentity` projection with a cos(lat) aspect correction. The
 * correction latitude is auto-derived from the region bounds, so the component
 * works for any city without configuration. This also avoids the winding-collapse
 * bug `geoMercator` hits on some tract/boundary data.
 */
const WatercolorMap: React.FC<WatercolorMapProps> = ({
    regions,
    roads,
    markers = [],
    palette = WATERCOLOR_PALETTES.blue as unknown as string[],
    width = 900,
    height = 720,
    lat0,
    watercolor = 4,
    onOutOfBounds,
    showOutOfBoundsWarning = false,
}) => {
    const [hover, setHover] = useState<number | null>(null);

    const { d, project, rg, rr, tx, bounds } = useMemo(() => {
        // Auto-derive the aspect-correction latitude from the data when not given.
        const lat = lat0 ?? meanLat(regions);
        const K = Math.cos((lat * Math.PI) / 180);
        const tx = (lng: number, latDeg: number): [number, number] => [lng * K, -latDeg];

        const warp = (c: any): any =>
            typeof c[0] === "number" ? tx(c[0], c[1]) : c.map(warp);
        const warpFC = (fc?: FeatureCollection) =>
            fc
                ? {
                      ...fc,
                      features: fc.features.map((f) => ({
                          ...f,
                          geometry: {
                              ...f.geometry,
                              coordinates: warp((f.geometry as any).coordinates),
                          },
                      })),
                  }
                : undefined;
        const rg = warpFC(regions)!;
        const rr = warpFC(roads);
        const projection = geoIdentity().fitExtent(
            [
                [14, 14],
                [width - 14, height - 14],
            ],
            rg as any,
        );
        const path = geoPath(projection);
        const bounds = path.bounds(rg as any) as [[number, number], [number, number]];
        return { d: path, project: projection, rg, rr, tx, bounds };
    }, [regions, roads, width, height, lat0]);

    // Is a projected point inside the map's covered area? (2px tolerance)
    const inBounds = (x: number, y: number) => {
        const [[x0, y0], [x1, y1]] = bounds;
        return x >= x0 - 2 && x <= x1 + 2 && y >= y0 - 2 && y <= y1 + 2;
    };

    // Split markers into on-map (drawn) and off-map (dropped + warned).
    const { onMap, offMap } = useMemo(() => {
        const onMap: { h: WatercolorMarker; i: number; x: number; y: number }[] = [];
        const offMap: WatercolorMarker[] = [];
        markers.forEach((h, i) => {
            const p = project(tx(h.lng, h.lat));
            if (!p) {
                offMap.push(h);
                return;
            }
            const [x, y] = p;
            if (inBounds(x, y)) onMap.push({ h, i, x, y });
            else offMap.push(h);
        });
        return { onMap, offMap };
    }, [markers, project, tx, bounds]);

    // Surface out-of-bounds markers to the DEVELOPER only — never to end users.
    // Fire the callback always; console.warn only outside production.
    useEffect(() => {
        if (offMap.length === 0) return;
        const isProd =
            typeof process !== "undefined" && process.env && process.env.NODE_ENV === "production";
        if (!isProd) {
            const names = offMap.map((m) => `${m.name} (${m.lat}, ${m.lng})`).join(", ");
            // eslint-disable-next-line no-console
            console.warn(`[WatercolorMap] ${offMap.length} marker(s) off-map, not shown: ${names}`);
        }
        onOutOfBounds?.(offMap);
    }, [offMap, onOutOfBounds]);

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            role="img"
            aria-label="Watercolor map"
            style={{ display: "block", background: "#ffffff" }}
        >
            <defs>
                {watercolor > 0 && (
                    <filter id="wc-filter" x="-3%" y="-3%" width="106%" height="106%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.016 0.02"
                            numOctaves={2}
                            seed={7}
                            result="n"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="n"
                            scale={watercolor}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                )}
                <filter id="wc-pinShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.35" />
                </filter>
            </defs>

            {/* Region fills (choropleth) + white street/boundary strokes. */}
            <g filter={watercolor > 0 ? "url(#wc-filter)" : undefined}>
                {rg.features.map((f, i) => (
                    <path
                        key={i}
                        d={d(f) ?? undefined}
                        fill={palette[hashKey(String(f.properties?.name ?? f.properties?.GEOID ?? (f as any).id ?? i)) % palette.length]}
                        stroke="#ffffff"
                        strokeWidth={1.8}
                        strokeLinejoin="round"
                    />
                ))}
            </g>

            {/* Road layer (outside the watercolor filter, kept crisp). */}
            {rr && (
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {rr.features.map((f, i) => {
                        const cls = f.properties?.cls;
                        if (cls === "minor") return null;
                        return (
                            <path
                                key={`c${i}`}
                                d={d(f) ?? undefined}
                                stroke="#8a909c"
                                strokeOpacity={0.28}
                                strokeWidth={cls === "hwy" ? 4 : 2}
                            />
                        );
                    })}
                    {rr.features.map((f, i) => {
                        const cls = f.properties?.cls;
                        const w = cls === "hwy" ? 2.4 : cls === "major" ? 1.2 : 0.6;
                        return <path key={`w${i}`} d={d(f) ?? undefined} stroke="#ffffff" strokeWidth={w} />;
                    })}
                </g>
            )}

            {/* Pins — only on-map markers are drawn. */}
            {onMap.map(({ h, i, x, y }) => {
                const active = hover === i;
                const w = Math.max(76, h.name.length * 7.4 + 20);
                return (
                    <g
                        key={i}
                        transform={`translate(${x},${y})`}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                        style={{ cursor: "pointer" }}
                    >
                        <circle r={active ? 8 : 6} fill="#0f172a" stroke="#ffffff" strokeWidth={2.5} filter="url(#wc-pinShadow)" />
                        {active && (
                            <g transform={`translate(${-w / 2}, ${-(h.date ? 44 : 34)})`}>
                                <rect width={w} height={h.date ? 34 : 24} rx={8} fill="#0f172a" />
                                <text x={w / 2} y={15} fill="#fff" fontSize={12.5} fontWeight={600} textAnchor="middle">
                                    {h.name}
                                </text>
                                {h.date && (
                                    <text x={w / 2} y={27} fill="#93c5c9" fontSize={9.5} textAnchor="middle">
                                        {h.date}
                                    </text>
                                )}
                            </g>
                        )}
                    </g>
                );
            })}

            {/* Built-in warning badge for dropped (off-map) markers. */}
            {showOutOfBoundsWarning && offMap.length > 0 && (
                <g transform={`translate(${width - 14}, 14)`} style={{ pointerEvents: "none" }}>
                    <rect x={-176} y={0} width={176} height={26} rx={13} fill="#fef2f2" stroke="#fecaca" strokeWidth={1} />
                    <circle cx={-160} cy={13} r={4} fill="#dc2626" />
                    <text x={-148} y={17} fill="#b91c1c" fontSize={12} fontWeight={600}>
                        {offMap.length} pin{offMap.length > 1 ? "s" : ""} off-map (hidden)
                    </text>
                </g>
            )}
        </svg>
    );
};

export default WatercolorMap;
