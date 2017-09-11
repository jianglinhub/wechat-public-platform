/**
 * Created by yong.liu on 2017/4/28.
 */
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
    devtool: 'cheap-module-eval-source-map',

    output: {
        path: helpers.root('webapp'),
        publicPath: '',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [
        new ExtractTextPlugin('[name].css')
    ],

    devServer: {
        host: "0.0.0.0",
        stats: 'minimal',
        proxy: {
            "/api": {
                target: "http://127.0.0.1:3011/",
            }
        }
    }
});