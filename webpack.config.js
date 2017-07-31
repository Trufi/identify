const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    devtool: 'eval-source-map',
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        disableHostCheck: true
    }
};
