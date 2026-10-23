import React from "react";
import { Meta, StoryObj } from "@storybook/react-vite";
import WatercolorMap from "./WatercolorMap";
import type { WatercolorMarker } from "./WatercolorMap.types";
import type { FeatureCollection } from "geojson";
import sfHoods from "./fixtures/sf-hoods.json";
import sfRoads from "./fixtures/sf-roads.json";

const meta: Meta<typeof WatercolorMap> = {
    component: WatercolorMap,
    title: "Marbella/WatercolorMap",
    argTypes: {
        watercolor: { control: { type: "range", min: 0, max: 10, step: 1 } },
    },
};
export default meta;

type Story = StoryObj<typeof WatercolorMap>;

const PALETTES: Record<string, string[]> = {
    blue: ["#eff5fc", "#dce9f8", "#c6dcf3", "#accbed", "#92b9e6", "#79a8df", "#639ad9", "#528ed3"],
    green: ["#eef7f0", "#dbefe0", "#c3e4cb", "#a6d6b3", "#88c89a", "#6cba81", "#55ac6b", "#459a5b"],
    yellow: ["#fdf8e6", "#faefc3", "#f6e29a", "#f0d26e", "#e7bf49", "#d9a92f", "#c2901f", "#a67714"],
    mono: ["#f5f5f6", "#e6e6e8", "#d4d4d8", "#bcbcc2", "#9d9da4", "#7c7c83", "#5a5a60", "#3f3f45"],
};

const MARKERS: WatercolorMarker[] = [
    { name: "Marina Makers", date: "2024 · Marina", lat: 37.803, lng: -122.436 },
    { name: "Cerebral Valley", date: "2024 · Hayes Valley", lat: 37.7765, lng: -122.4256 },
    { name: "AI Tinkerers", date: "2025 · SoMa", lat: 37.7785, lng: -122.4056 },
    { name: "Mission Build Night", date: "2025 · Mission", lat: 37.7599, lng: -122.4148 },
];

const regions = sfHoods as unknown as FeatureCollection;
const roads = sfRoads as unknown as FeatureCollection;

export const SanFrancisco: Story = {
    args: { regions, roads, markers: MARKERS, palette: PALETTES.blue, watercolor: 4 },
    render: (args) => <div style={{ width: 880 }}><WatercolorMap {...args} /></div>,
};

export const Green: Story = {
    args: { ...SanFrancisco.args, palette: PALETTES.green },
    render: SanFrancisco.render,
};

export const Mono: Story = {
    args: { ...SanFrancisco.args, palette: PALETTES.mono },
    render: SanFrancisco.render,
};

// A deliberately-wrong coordinate (San Jose) is flagged red & clamped on-screen.
export const OutOfBoundsWarning: Story = {
    args: {
        ...SanFrancisco.args,
        markers: [...MARKERS, { name: "Typo", date: "bad coord", lat: 37.3382, lng: -121.8863 }],
    },
    render: SanFrancisco.render,
};
