module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: ["> 1%", "last 2 versions", "chrome 86"],
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
    "@vue/cli-plugin-babel/preset",
  ],
};
