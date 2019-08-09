import path from 'path';
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';

import { createMemoryHistory } from 'history';
const history = createMemoryHistory();
import { Provider } from 'react-redux';
import { createStore } from 'redux';
//import reducer from './treklog/state/reducers';
import { Router, Route } from 'react-router-dom';
import firebase from 'firebase';
import config from './config';
import { keyBy } from 'lodash';
import moment from 'moment';
const app = express();

console.log(path.join(__dirname, '../build'));
app.use(express.static(path.join(__dirname, '../build')));

function getDateComparator(tracks) {
	return function dateComparator(a, b) {
		return moment(tracks[b].date) - moment(tracks[a].date);
	};
}

function getTracks() {
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

app.use(express.static(path.join(__dirname, '../dist')));

const nodeStats = '../dist/loadable-stats.json';

const webStats = '../build/loadable-stats.json';

app.get(
	'*',
	(req, res) => {
		const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });
		const { default: App } = nodeExtractor.requireEntrypoint();
		console.log(App);
		const webExtractor = new ChunkExtractor({ statsFile: webStats });
		console.log('Have web');
		getTracks()
			.then(tracks => {
				return [keyBy(tracks, 'url'), tracks];
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

				function reducer(state = preloadedState, actions) { return state; }
				let store = createStore(reducer, preloadedState);
				const jsx = webExtractor.collectChunks(<Provider store={store}>
					<Router history={history}>
						<Route component={App} />
					</Router>
				</Provider>);

				const html = renderToString(jsx);
				console.log(webExtractor.getScriptTags());
				res.set('content-type', 'text/html');
				res.send(`<!DOCTYPE html>
					<html lang="en">
					<head>
					<meta http-equiv="X-UA-Compatible" content="IE=Edge">
					<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no">
					<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css">
					${webExtractor.getLinkTags()}
					${webExtractor.getStyleTags()}
					</head>
					<body class="dimmable dimmer">
					<div id="root">${html}</div>
					${webExtractor.getScriptTags()}
					</body>
					</html>`);
			});
	},
);

let port = 9000;
// eslint-disable-next-line no-console
app.listen(port, () => console.log('Server started http://localhost:9000'));