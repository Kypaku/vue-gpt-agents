module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true, // <--- added
        }
    },
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    // exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            plugins: ["@babel/plugin-syntax-nullish-coalescing-operator", '@babel/plugin-proposal-nullish-coalescing-operator', ],
                        },
                    },
                },
            ],
        },
    },
}
