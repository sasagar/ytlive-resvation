module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                productName: "YouTube Reservation",
                appId: "com.kent-and-co.ytlive-reservation",
                win: {
                    target: [
                        {
                            target: 'nsis',
                            arch: ['x64', 'ia32']
                        }
                    ]
                }
            }
        }
    }
}