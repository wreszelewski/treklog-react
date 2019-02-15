import firebase from 'firebase';
import moment from 'moment';

export function getTrackLoader(url, tracks, actions) {
	return () => loadTrack(url, tracks, actions);
}

export function loadTrack(url, tracks, actions, treklogActions) {
	if(Object.keys(tracks).length === 0) {
		return null;
	}
	actions.showTreklogLoader();
	actions.fetchTrackStarted();
	actions.hideTrackMenu();
	treklogActions.animationReset();
	let track = tracks[url];
	if(!track.originalGeoJsonPath) {
		track.originalGeoJsonPath = track.geoJsonPath;
	}
	return Promise.all([getPoints(track.geoJsonPath), getPoints(track.originalGeoJsonPath)])
		.then(([geoJsonPoints, originalGeoJsonPoints]) => {
			track.geoJsonPoints = geoJsonPoints;
			track.originalGeoJsonPoints = originalGeoJsonPoints;
			actions.fetchTrackFinished(track);
			treklogActions.updatePlacemarks(track.placemarks);
			actions.hideTreklogLoader();
		});
}

export function getPoints(geoJsonPath) {
	const storage = firebase.storage();
	return storage.ref(geoJsonPath)
		.getDownloadURL()
		.then((url) => {
			const geoJsonReq = new Request(url);
			return fetch(geoJsonReq);
		})
		.then((geoJsonFile) => geoJsonFile.json());
}

function getDateComparator(tracks) {
	return function dateComparator(a, b) {
		return moment(tracks[b].date) - moment(tracks[a].date);
	};
}

export function getTracks() {
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