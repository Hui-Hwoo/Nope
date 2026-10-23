import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const packageJson = require("./package.json");

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: true,
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve(),
            commonjs(),
            // JS pass only — declarations are produced by the dts config below.
            typescript({
                tsconfig: "./tsconfig.json",
                declaration: false,
                declarationDir: undefined,
                emitDeclarationOnly: false,
                outDir: undefined,
            }),
            terser(),
        ],
        external: ["react", "react-dom", "styled-components", "d3-geo"],
    },
    {
        input: "src/index.ts",
        output: [{ file: packageJson.types, format: "es" }],
        plugins: [dts.default()],
    },
];
