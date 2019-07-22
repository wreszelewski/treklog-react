'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const publicPath = './';

const publicUrl = '';

const env = getClientEnvironment(publicUrl);


module.exports = {

	entry: [
		paths.appIndexNode
	],
	output: {
		filename: 'server.js',
		publicPath: publicPath,
		libraryTarget: 'commonjs2'
	},
	resolve: {

		modules: ['node_modules', paths.appNodeModules, paths.appSrc].concat(

			process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
		),

		extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
		alias: {

			'react-native': 'react-native-web'
		},
		plugins: [

			new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
		]
	},
	module: {
		unknownContextCritical: false,
		unknownContextRegExp: /^.\/.*$/,
		strictExportPresence: true,
		rules: [
			// TODO: Disable require.ensure as it's not a standard language feature.
			// We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
			// { parser: { requireEnsure: false } },

			// First, run the linter.
			// It's important to do this before Babel processes the JS.
			{
				test: /\.(js|jsx|mjs)$/,
				enforce: 'pre',
				use: [
					{
						options: {
							formatter: eslintFormatter,
							eslintPath: require.resolve('eslint')

						},
						loader: require.resolve('eslint-loader')
					}
				],
				include: paths.appSrc
			},
			{
				// "oneOf" will traverse all following loaders until one will
				// match the requirements. When no loader matches it will fall
				// back to the "file" loader at the end of the loader list.
				oneOf: [
					// "url" loader works like "file" loader except that it embeds assets
					// smaller than specified limit in bytes as data URLs to avoid requests.
					// A missing `test` is equivalent to a match.
					{
						test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
						loader: require.resolve('url-loader'),
						options: {
							limit: 10000,
							name: 'static/media/[name].[hash:8].[ext]'
						}
					},
					// Process JS with Babel.
					{
						test: /\.(js|jsx|mjs)$/,
						include: paths.appSrc,
						loader: require.resolve('babel-loader'),
						query: {

							// This is a feature of `babel-loader` for webpack (not Babel itself).
							// It enables caching results in ./node_modules/.cache/babel-loader/
							// directory for faster rebuilds.
							cacheDirectory: true,
							plugins: ['syntax-dynamic-import', '@loadable/babel-plugin'],
							presets: [
								'@babel/preset-env',
								'@babel/preset-react'
							]
						}
					},
					// "postcss" loader applies autoprefixer to our CSS.
					// "css" loader resolves paths in CSS and adds assets as dependencies.
					// "style" loader turns CSS into JS modules that inject <style> tags.
					// In production, we use a plugin to extract that CSS to a file, but
					// in development "style" loader enables hot editing of CSS.
					{
						test: /\.css$/,
						loader: require.resolve('css-loader/locals')
					},
					// "file" loader makes sure those assets get served by WebpackDevServer.
					// When you `import` an asset, you get its (virtual) filename.
					// In production, they would get copied to the `build` folder.
					// This loader doesn't use a "test" so it will catch all modules
					// that fall through the other loaders.
					{
						// Exclude `js` files to keep "css" loader working as it injects
						// it's runtime that would otherwise processed through "file" loader.
						// Also exclude `html` and `json` extensions so they get processed
						// by webpacks internal loaders.
						exclude: [/\.js$/, /\.html$/, /\.json$/],
						loader: require.resolve('file-loader'),
						options: {
							name: 'static/media/[name].[hash:8].[ext]'
						}
					}
				]
			}
			// ** STOP ** Are you adding a new loader?
			// Make sure to add the new loader(s) before the "file" loader.
		]
	},
	plugins: [
		// Makes some environment variables available in index.html.
		// The public URL is available as %PUBLIC_URL% in index.html, e.g.:
		// <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
		// In development, this will be an empty string.
		// Generates an `index.html` file with the <script> injected.

		new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
		// Add module names to factory functions so they appear in browser profiler.
		new webpack.NamedModulesPlugin(),
		// Makes some environment variables available to the JS code, for example:
		// if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
		new webpack.DefinePlugin(env.stringified),
		// This is necessary to emit hot updates (currently CSS only):
		new webpack.HotModuleReplacementPlugin(),
		// Watcher doesn't work well if you mistype casing in a path so we use
		// a plugin that prints an error when you attempt to do this.
		// See https://github.com/facebookincubator/create-react-app/issues/240
		new CaseSensitivePathsPlugin(),
		// If you require a missing module and then `npm install` it, you still have
		// to restart the development server for Webpack to discover it. This plugin
		// makes the discovery automatic so you don't have to restart.
		// See https://github.com/facebookincubator/create-react-app/issues/186
		new WatchMissingNodeModulesPlugin(paths.appNodeModules),
		// Moment.js is an extremely popular library that bundles large locale files
		// by default due to how Webpack interprets its code. This is a practical
		// solution that requires the user to opt into importing specific locales.
		// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
		// You can remove this if you don't use Moment.js:
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new LoadablePlugin()
	],
	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node: {
		dgram: 'empty',
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
		child_process: 'empty'
	},
	// Turn off performance hints during development because we don't do any
	// splitting or minification in interest of speed. These warnings become
	// cumbersome.
	performance: {
		hints: false
	},
	mode: 'production',
	target: 'node'
};
