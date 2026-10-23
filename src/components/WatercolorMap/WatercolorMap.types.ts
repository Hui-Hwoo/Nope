import type { FeatureCollection } from "geojson";

/** A single point of interest rendered as a pin. */
export interface WatercolorMarker {
    name: string;
    /** Optional sub-label shown on hover (e.g. date / neighborhood). */
    date?: string;
    lat: number;
    lng: number;
}

/**
 * A reusable "city pack" — the data needed to render one city, decoupled from
 * the component. Add a new city by producing one of these (two GeoJSON files +
 * a label); no component code changes required. See the README data recipe.
 */
export interface CityMap {
    /** Stable id, e.g. "sf", "nyc". */
    id: string;
    /** Human label, e.g. "San Francisco". */
    label: string;
    /** Region polygons (neighborhoods / districts / tracts). */
    regions: FeatureCollection;
    /** Optional road lines. `properties.cls`: "hwy" | "major" | "minor". */
    roads?: FeatureCollection;
    /**
     * Optional latitude for the cos(lat) aspect correction. Omit to let the
     * component auto-derive it from the region bounds (recommended).
     */
    lat0?: number;
}

export interface WatercolorMapProps {
    /** Region polygons (choropleth fills + white "street" strokes). */
    regions: FeatureCollection;
    /**
     * Optional road lines (LineString / MultiLineString). Each feature may carry
     * `properties.cls` of "hwy" | "major" | "minor" to control weight.
     */
    roads?: FeatureCollection;
    /** Points of interest rendered as pins. */
    markers?: WatercolorMarker[];
    /** Fill ramp, light → dark. Regions are colored by a stable hash of their name. */
    palette?: string[];
    width?: number;
    height?: number;
    /**
     * Latitude used for the cos(lat) aspect correction (planar projection).
     * Omit to auto-derive from the region bounds — works for any city.
     */
    lat0?: number;
    /** Watercolor edge wobble intensity (feDisplacementMap scale). 0 disables. */
    watercolor?: number;
    /**
     * Markers whose coordinates fall outside the mapped area are NOT drawn.
     * When any are dropped, this fires with the offending markers so the app
     * can surface its own message. Also logged via console.warn.
     */
    onOutOfBounds?: (markers: WatercolorMarker[]) => void;
    /**
     * Show a small built-in "⚠ N off-map" badge when markers are dropped.
     * Defaults to true. Set false if you render your own warning via
     * `onOutOfBounds`.
     */
    showOutOfBoundsWarning?: boolean;
}
