'use strict';/*eslint-env node */

const path = require('path');
const fs = require('fs');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
	const hasSlash = path.endsWith('/');
	if (hasSlash && !needsSlash) {
		return path.substr(path, path.length - 1);
	} else if (!hasSlash && needsSlash) {
		return `${path}/`;
	} else {
		return path;
	}
}

const getPublicUrl = appPackageJson =>
	envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
	const publicUrl = getPublicUrl(appPackageJson);
	const servedUrl =
		envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
	return ensureSlash(servedUrl, true);
}

// config after eject: we're in ./config/
module.exports = {
	dotenv: resolveApp('.env'),
	appBuild: resolveApp('build'),
	ssrBuild: resolveApp('functions/dist'),
	appPublic: resolveApp('public'),
	appHtml: resolveApp('public/index.html'),
	appMst: resolveApp('public/indexTemplate.mst'),
	appIndexJs: resolveApp('src/index.js'),
	appIndexNode: resolveApp('src/index-server.js'),
	appPackageJson: resolveApp('package.json'),
	appSrc: resolveApp('src'),
	yarnLockFile: resolveApp('yarn.lock'),
	testsSetup: resolveApp('src/setupTests.js'),
	appNodeModules: resolveApp('node_modules'),
	publicUrl: getPublicUrl(resolveApp('package.json')),
	servedPath: getServedPath(resolveApp('package.json')),
	app: resolveApp('.'),
	appConfig: resolveApp('config'),
	cesiumDebugBuild: resolveApp('node_modules/cesium/Build/CesiumUnminified/'),
	cesiumProdBuild: resolveApp('node_modules/cesium/Build/Cesium/'),
	cesiumSourceFolder: resolveApp('node_modules/cesium/Source/'),
	cesiumDll: resolveApp('distdll/cesiumDll.js')
};