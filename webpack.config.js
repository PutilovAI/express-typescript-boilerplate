const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');

const CONFIG_ENV = process.env.CONFIG_ENV || 'prod';
const NODE_ENV = process.env.NODE_ENV || 'production';
const IS_DEVELOPMENT = NODE_ENV === 'development';

const pathResolve = dir => path.resolve(__dirname, dir);

const config = {
    entry: './src/index.ts',
    mode: NODE_ENV,
    target: 'node',
    output: {
        path: pathResolve('build'),
        filename: 'app.js'
    },
    resolve: {
        modules: [
            'node_modules',
            pathResolve('src')
        ],
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'ts-loader',
                ]
            }
        ]
    },
    plugins: [],
    externals: [],
    watch: IS_DEVELOPMENT
};

if (IS_DEVELOPMENT) {
    config.externals.push(nodeExternals());

    config.plugins.push(new WebpackShellPlugin({
        onBuildEnd: [`yarn build-run_${CONFIG_ENV}`]
    }));
}

module.exports = config;
