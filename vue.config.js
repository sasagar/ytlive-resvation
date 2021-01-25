module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: false,
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
          icon: "./src/assets/icon.png",
          runAfterFinish: false,
        },
      },
    },
  },
};
