import type { FeatureCollection } from "geojson";

/** A single point of interest rendered as a pin. */
export interface WatercolorMarker {
    name: string;
    /** Optional sub-label shown on hover (e.g. date / neighborhood). */
    date?: string;
    lat: number;
    lng: number;
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
     * Defaults to 37.6 (San Francisco Bay Area).
     */
    lat0?: number;
    /** Watercolor edge wobble intensity (feDisplacementMap scale). 0 disables. */
    watercolor?: number;
}
