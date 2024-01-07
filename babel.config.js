module.exports = {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/typescript", { jsxPragma: "h" }],
    ],
    plugins: [["@babel/plugin-transform-react-jsx"]],
};
