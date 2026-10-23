# Nope

Notion-style React component library — TypeScript, styled-components, Storybook.

## Install

```bash
npm install nope-ui
# peer deps
npm install react react-dom          # ^18.2 || ^19
npm install d3-geo                   # required by <WatercolorMap>
```

## Components

### `WatercolorMap`

A fast, dependency-light SVG "watercolor" choropleth map. Region polygons with
hashed fills + white street strokes, optional road lines, and pins for points of
interest. Out-of-bounds pins (bad coordinates) are clamped into view and flagged
red, so coordinate typos are obvious at a glance.

Uses a planar `geoIdentity` projection with a `cos(lat)` aspect correction —
avoiding the winding-collapse bug `geoMercator` hits on some tract/boundary data.

![WatercolorMap](./assets/watercolor-map.png)

```tsx
import { WatercolorMap, type WatercolorMarker } from "nope-ui";
import regions from "./data/sf-neighborhoods.json"; // any GeoJSON FeatureCollection

const markers: WatercolorMarker[] = [
  { name: "Cerebral Valley", date: "2024 · Hayes Valley", lat: 37.7765, lng: -122.4256 },
  { name: "AI Tinkerers",    date: "2025 · SoMa",         lat: 37.7785, lng: -122.4056 },
];

<WatercolorMap regions={regions} markers={markers} />;
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `regions` | `FeatureCollection` | — | **Required.** Region polygons (choropleth fills + white strokes). |
| `roads` | `FeatureCollection` | — | Optional road lines. `properties.cls` of `"hwy" \| "major" \| "minor"` sets weight. |
| `markers` | `WatercolorMarker[]` | `[]` | Points of interest. `{ name, date?, lat, lng }`. |
| `palette` | `string[]` | blue ramp | Fill ramp, light → dark. Regions colored by a stable hash of their name. |
| `width` / `height` | `number` | `900` / `720` | SVG viewBox size. |
| `lat0` | `number` | `37.6` | Latitude for the `cos(lat)` aspect correction. |
| `watercolor` | `number` | `4` | Edge-wobble intensity (`feDisplacementMap` scale). `0` disables. |

Region fills are assigned by hashing `properties.name` (falls back to `GEOID` /
`id`), so colors are stable across renders and don't need to be precomputed.

### `Button`

```tsx
import { Button } from "nope-ui";

<Button text="Primary" primary size="medium" onClick={() => {}} />;
```

`primary?` · `disabled?` · `size?: "small" | "medium" | "large"` · `onClick?`

### `Input`

```tsx
import { Input } from "nope-ui";

<Input label="Email" placeholder="you@example.com" error message="Required" />;
```

`label?` · `message?` · `error?` · `success?` · `disabled?` · `placeholder?` · `onChange?`

## Develop

```bash
npm run storybook        # dev @ :6006
npm test                 # jest
npm run build            # rollup → dist/ (cjs + esm + d.ts)
npm run build-storybook  # static storybook
```

Built with [this guide](https://blog.logrocket.com/how-to-build-component-library-react-typescript/).
