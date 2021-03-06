module.exports = {
  publicPath: "./",
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      customFileProtocol: "./",
      nodeIntegration: false,
      mainProcessWatch: [
        "src/backend-modules/google.js",
        "src/backend-modules/electronMenu.js",
        "auto-update.js",
      ],
      builderOptions: {
        productName: "YouTube Reservation",
        appId: "com.kent-and-co.ytlive-reservation",
        win: {
          target: [
            {
              target: "nsis",
              arch: ["x64", "ia32"],
            },
          ],
          publish: {
            provider: "github",
            releaseType: "release",
            vPrefixedTagName: true,
          },
          icon: "./src/assets/icon.png",
        },
      },
    },
  },
  configureWebpack: {
    devtool: "source-map",
    performance: {
      maxEntrypointSize: 500000,
      maxAssetSize: 500000,
    },
  },
};
