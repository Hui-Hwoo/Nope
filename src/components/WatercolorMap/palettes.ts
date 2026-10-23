// Named watercolor ramps (light → dark). Pass one to <WatercolorMap palette={...} />.
// These are plain string[]s — the component takes a `palette` prop, it does NOT
// render any color picker. Build your own switcher in app code if you want one.
export const WATERCOLOR_PALETTES = {
    blue: ["#eff5fc", "#dce9f8", "#c6dcf3", "#accbed", "#92b9e6", "#79a8df", "#639ad9", "#528ed3"],
    green: ["#eef7f0", "#dbefe0", "#c3e4cb", "#a6d6b3", "#88c89a", "#6cba81", "#55ac6b", "#459a5b"],
    yellow: ["#fdf8e6", "#faefc3", "#f6e29a", "#f0d26e", "#e7bf49", "#d9a92f", "#c2901f", "#a67714"],
    mono: ["#f5f5f6", "#e6e6e8", "#d4d4d8", "#bcbcc2", "#9d9da4", "#7c7c83", "#5a5a60", "#3f3f45"],
} as const;

export type WatercolorPaletteName = keyof typeof WATERCOLOR_PALETTES;
