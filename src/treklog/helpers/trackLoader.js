import firebase from "firebase";
import moment from "moment";

export function getTrackLoader(url, tracks, actions) {
    return () => loadTrack(url, tracks, actions);
}

export function loadTrack(url, tracks, actions) {
    if(Object.keys(tracks).length === 0) {
        return null;
    }
    actions.animationReset();
    actions.showTreklogLoader();
    actions.fetchTrackStarted();
    actions.hideTrackMenu();
    let track = tracks[url];
    return getPoints(track.geoJsonPath)
        .then((geoJsonPoints) => {
            track.geoJsonPoints = geoJsonPoints;
            actions.fetchTrackFinished(track);
            actions.hideTreklogLoader();
        });
}

export function getPoints(geoJsonPath) {
    const storage = firebase.storage();
    return storage.ref(geoJsonPath)
        .getDownloadURL()
        .then((url) => {
            const geoJsonReq = new Request(url);
            return fetch(geoJsonReq)
        })
        .then((geoJsonFile) => geoJsonFile.json());
}

function getDateComparator(tracks) {
    return function dateComparator(a, b) {
        return moment(tracks[b].date) - moment(tracks[a].date);
    }
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
            })
        
            return trackList;
        });
}