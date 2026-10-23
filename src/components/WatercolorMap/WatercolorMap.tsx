import React, { useMemo, useState } from "react";
import { geoIdentity, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import { WatercolorMapProps } from "./WatercolorMap.types";

// Default light-blue watercolor ramp (overridable via `palette`).
const BLUE = [
    "#eff5fc", "#dce9f8", "#c6dcf3", "#accbed", "#92b9e6",
    "#79a8df", "#639ad9", "#528ed3",
];

// Stable per-region color: hash the region key into the palette.
function hashKey(key: string): number {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
}

/**
 * A fast, dependency-light SVG "watercolor" choropleth map.
 *
 * Renders region polygons with hashed fills + white street strokes, optional
 * road lines, and pins for points of interest. Out-of-bounds pins (bad
 * coordinates) are clamped into view and flagged red so typos are obvious.
 *
 * Uses a planar `geoIdentity` projection with a cos(lat) aspect correction —
 * this avoids the winding-collapse bug `geoMercator` hits on some tract data.
 */
const WatercolorMap: React.FC<WatercolorMapProps> = ({
    regions,
    roads,
    markers = [],
    palette = BLUE,
    width = 900,
    height = 720,
    lat0 = 37.6,
    watercolor = 4,
}) => {
    const [hover, setHover] = useState<number | null>(null);

    // cos(lat) longitude correction so 1°lng ≈ 1°lat visually (planar projection).
    const K = useMemo(() => Math.cos((lat0 * Math.PI) / 180), [lat0]);
    const tx = useMemo(
        () => (lng: number, lat: number): [number, number] => [lng * K, -lat],
        [K],
    );

    const { d, project, rg, rr, bounds } = useMemo(() => {
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
        return { d: path, project: projection, rg, rr, bounds };
    }, [regions, roads, width, height, tx]);

    // Is a projected point inside the map's covered area? (2px tolerance)
    const inBounds = (x: number, y: number) => {
        const [[x0, y0], [x1, y1]] = bounds;
        return x >= x0 - 2 && x <= x1 + 2 && y >= y0 - 2 && y <= y1 + 2;
    };

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

            {/* Pins. Out-of-bounds (bad coords) are clamped into view and flagged red. */}
            {markers.map((h, i) => {
                const p = project(tx(h.lng, h.lat));
                if (!p) return null;
                const [px, py] = p;
                const oob = !inBounds(px, py);
                const x = oob ? Math.max(12, Math.min(width - 12, px)) : px;
                const y = oob ? Math.max(12, Math.min(height - 12, py)) : py;
                const active = hover === i;
                const label = oob ? `⚠ ${h.name} — coords off-map` : h.name;
                const w = Math.max(76, label.length * 7.4 + 20);
                const fill = oob ? "#dc2626" : "#0f172a";
                return (
                    <g
                        key={i}
                        transform={`translate(${x},${y})`}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                        style={{ cursor: "pointer" }}
                    >
                        <circle r={active ? 8 : 6} fill={fill} stroke="#ffffff" strokeWidth={2.5} filter="url(#wc-pinShadow)" />
                        {oob && <circle r={11} fill="none" stroke="#dc2626" strokeWidth={1.5} strokeOpacity={0.6} />}
                        {active && (
                            <g transform={`translate(${-w / 2}, ${-(h.date ? 44 : 34)})`}>
                                <rect width={w} height={h.date ? 34 : 24} rx={8} fill={fill} />
                                <text x={w / 2} y={15} fill="#fff" fontSize={12.5} fontWeight={600} textAnchor="middle">
                                    {label}
                                </text>
                                {h.date && (
                                    <text x={w / 2} y={27} fill={oob ? "#fecaca" : "#93c5c9"} fontSize={9.5} textAnchor="middle">
                                        {oob ? `${h.lat}, ${h.lng}` : h.date}
                                    </text>
                                )}
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

export default WatercolorMap;
