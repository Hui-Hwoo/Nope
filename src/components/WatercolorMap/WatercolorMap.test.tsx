import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import type { FeatureCollection } from "geojson";

import WatercolorMap from "./WatercolorMap";

// Two tiny square "regions" around SF so the projection has real extent.
const regions: FeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { name: "A" },
            geometry: {
                type: "Polygon",
                coordinates: [[[-122.45, 37.75], [-122.40, 37.75], [-122.40, 37.80], [-122.45, 37.80], [-122.45, 37.75]]],
            },
        },
        {
            type: "Feature",
            properties: { name: "B" },
            geometry: {
                type: "Polygon",
                coordinates: [[[-122.40, 37.75], [-122.35, 37.75], [-122.35, 37.80], [-122.40, 37.80], [-122.40, 37.75]]],
            },
        },
    ],
};

describe("Running Test for Marbella WatercolorMap", () => {
    test("renders an accessible svg with one path per region", () => {
        const { container } = render(<WatercolorMap regions={regions} watercolor={0} />);
        expect(screen.getByRole("img", { name: "Watercolor map" })).toBeInTheDocument();
        // 2 region paths (no roads, no markers)
        expect(container.querySelectorAll("path")).toHaveLength(2);
    });

    test("renders a pin circle for each in-bounds marker", () => {
        const { container } = render(
            <WatercolorMap
                regions={regions}
                markers={[{ name: "Inside", lat: 37.77, lng: -122.42 }]}
                watercolor={0}
            />,
        );
        // marker pin uses a drop-shadow filter — distinct from region paths
        expect(container.querySelectorAll('circle[filter="url(#wc-pinShadow)"]')).toHaveLength(1);
    });

    test("flags an out-of-bounds marker in red", () => {
        const { container } = render(
            <WatercolorMap
                regions={regions}
                markers={[{ name: "FarAway", lat: 10, lng: 10 }]}
                watercolor={0}
            />,
        );
        const pin = container.querySelector('circle[filter="url(#wc-pinShadow)"]');
        expect(pin).toHaveAttribute("fill", "#dc2626");
    });
});
