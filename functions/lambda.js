const React = require('react');
const { renderToString } = require('react-dom/server');
const { ChunkExtractor } = require('@loadable/server');

const { createMemoryHistory } = require('history');
const history = createMemoryHistory();
const { Provider } = require('react-redux');
const { createStore } = require('redux');
const { Router, Route } = require('react-router-dom');
//const firebase = require('firebase');
const _ = require('lodash');
const moment = require('moment');

function getDateComparator(tracks) {
	return function dateComparator(a, b) {
		return moment(tracks[b].date) - moment(tracks[a].date);
	};
}

function getTracks(firebase) {
	return firebase.database().ref('/tracks').once('value')
		.then(tracksInYearRaw => tracksInYearRaw.val())
		.then(tracksPerYear => {
			let trackList = [];
			const years = Object.getOwnPropertyNames(tracksPerYear)
				.sort()
				.reverse();

			years.forEach((year) => {
				const trackCodesInYear = Object.getOwnPropertyNames(tracksPerYear[year])
					.sort(getDateComparator(tracksPerYear[year]));

				trackCodesInYear.forEach((trackCode) => {
					trackList.push(tracksPerYear[year][trackCode]);
				});
			});

			return trackList;
		});
}



const webStats = require('./dist/loadable-stats.web.json');
const { default: App } = require('./dist/server');
const webExtractor = new ChunkExtractor({ stats: webStats });

module.exports = (firebase) => (req, res) => {
	getTracks(firebase)
		.then(tracks => {
			return [_.keyBy(tracks, 'url'), tracks];
		})
		.then(tracks => {
			let track = req.path === '/' ? {} : tracks[0][req.path];
			let preloadedState = {
				showBottomMenu: req.path !== '/',
				animation: {},
				track: track,
				tracks: tracks[0],
				tracksArr: tracks[1],
				showTrackMenu: req.path === '/',
				showLoader: false
			};
			
			let store = createStore((state, action) => state, preloadedState);
			const jsx = webExtractor.collectChunks(<Provider store={store}>
				<Router history={history}>
					<Route component={App} />
				</Router>
			</Provider>);

			const html = renderToString(jsx);
			res.set('content-type', 'text/html');
			res.set('cache-control', 'public, max-age=3600');
			res.status(200).send(`<!DOCTYPE html>
				<html lang="en">
				<head>
				<meta http-equiv="X-UA-Compatible" content="IE=Edge">
				<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no">
				<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css">
				<link rel="preload" href="/1.css" as="style">
				<link rel="preload" href="/2.css" as="style">
				${webExtractor.getLinkTags()}
				${webExtractor.getStyleTags()}
				</head>
				<body class="dimmable dimmer">
				<div id="root">${html}</div>
				${webExtractor.getScriptTags()}
				</body>
				</html>`);
		});
};