const moment = require('moment');
const geolib = require('geolib');
const toGeoJson = require('togeojson');
const SparkMD5 = require('spark-md5');
const firebase = require('firebase');
const slugify = require('slugify');

export default class TrackCalculator {

	static fromGpx(gpxString) {
		const gpx = (new DOMParser()).parseFromString(gpxString, 'text/xml');
		const geojson = toGeoJson.gpx(gpx);
		const track = new TrackCalculator(geojson);
		return track;
	}

	constructor(originalGeoJson, altitude = []) {
		this.altitude = altitude;
		this.originalGeoJson = originalGeoJson;
		this._originalCoordinates = this._getCoordinates(originalGeoJson);
		this._coordTimes = this._getCoordTimes();
		this._coordinates = this._getCoordinates(this.filteredTrack);
		this.name;
		this.description;
		this.hash = SparkMD5.hash(JSON.stringify(originalGeoJson));
		this.initialPosition = {
			heading: 0,
			pitch: -0.6981317007977318,
			height: 14000
		};
	}

	_getCoordinates(geoJson) {
		let coordinates;
		if(geoJson.features[0].geometry.type === 'LineString') {
			coordinates = geoJson.features[0].geometry.coordinates;
		} else {
			coordinates = [];
			geoJson.features[0].geometry.coordinates.forEach(coordArray => {coordinates = coordinates.concat(coordArray);});
		}
		if(coordinates.length === this.altitude.length) {
			for(let i = 0; i < coordinates.length; i++) {
				if(coordinates[i][2] === undefined) {
					coordinates[i].push(this.altitude[i].height);
				} else {
					coordinates[i][2] = this.altitude[i].height;
				}
			}
		}

		return coordinates;
	}

	_getCoordTimes() {
		if(this.originalGeoJson.features[0].geometry.type === 'LineString') {
			return this.originalGeoJson.features[0].properties.coordTimes;
		} else {
			let coordTimes = [];
			this.originalGeoJson.features[0].properties.coordTimes.forEach(timesArray => {coordTimes = coordTimes.concat(timesArray);});
			return coordTimes;
		}
	}

	get duration() {
		return moment(this._coordTimes[this._coordTimes.length - 1]) - moment(this._coordTimes[0]);
	}

	get url() {
		return '/' + this.date.year() + '/' + slugify(this.name, {lower: true});
	}

	get altitudeStats() {
		const coordinates = this._coordinates;
		if(!coordinates[0][2]) {
			return {
				minAltitude: null,
				maxAltitude: null,
				ascent: null,
				descent: null
			};
		}
		const altitudes = coordinates.map(coordinate => coordinate[2]);
		let minAltitude = altitudes[0];
		let maxAltitude = altitudes[0];
		let ascent = 0;
		let descent = 0;
		let lastAltitude = altitudes[0];

		altitudes.slice(1).forEach((currentAltitude) => {
			if(currentAltitude > maxAltitude) {
				maxAltitude = currentAltitude;
			}
			if(currentAltitude < minAltitude) {
				minAltitude = currentAltitude;
			}
			const altitudeDiff = currentAltitude - lastAltitude;
			const heightThreshold = 8;
			if(Math.abs(altitudeDiff) > heightThreshold) {
				if(altitudeDiff > 0) {
					ascent += altitudeDiff;
				} else {
					descent += Math.abs(altitudeDiff);
				}
				lastAltitude = currentAltitude;
			}
		});

		return {
			minAltitude,
			maxAltitude,
			ascent,
			descent
		};
	}

	get date() {
		return moment(this.originalGeoJson.features[0].properties.time);
	}

	get distance() {
		const coordinates = this._coordinates;
		let lastPoint = getGeolibPoint(coordinates[0]);
		let currentPoint,
			distance = 0,
			currentDistance;
		let distancePoint = lastPoint;
		coordinates.slice(1).forEach((point) => {
			currentPoint = getGeolibPoint(point);
			currentDistance = geolib.getDistance(distancePoint, currentPoint);
			distance += currentDistance;
			distancePoint = currentPoint;
		});
		return distance;
	}

	get originalName() {
		return this.originalGeoJson.features[0].properties.name;
	}

	_getGeoJsonWithoutPoints() {
		return {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {
						name: this.name,
						time: this.originalGeoJson.features[0].properties.time,
						coordTimes: []
					},
					geometry: {
						type: 'LineString',
						coordinates: []
					}
				}
			]
		};
	}

	setName(name) {
		this.name = name;
	}

	setDescription(description) {
		this.description = description;
	}

	get originalGeoJsonPath() {
		return 'originalGpsTracks/' + this.hash + '.geojson';
	}

	get geoJsonPath() {
		return 'gpsTracks/' + this.hash + '.geojson';
	}

	get filteredTrack() {
		let lightGeoJson = this._getGeoJsonWithoutPoints();

		const coordinates = this._originalCoordinates;
		const coordTimes = this._coordTimes;

		this._pushPointToTrack(lightGeoJson, 0);

		let lastPoint = getGeolibPoint(coordinates[0]);
		let lastTimestamp = coordTimes[0];
		let currentPoint, currentDistance, currentSpeed, currentTimeSpan;
		const msInSec = 1000;
		coordinates.slice(1).forEach((point, index) => {
			currentPoint = getGeolibPoint(coordinates[index+1]);
			currentDistance = geolib.getDistance(lastPoint, currentPoint);
			currentTimeSpan = (moment(coordTimes[index+1]) - moment(lastTimestamp)) / msInSec;
			currentSpeed = currentDistance / currentTimeSpan;

			const minDistanceDiff = 25;
			const maxDistanceDiff = 200;
			const artificialPartLength = 50;
			const minSpeed = 0;
			const maxSpeed = 5;
			if(currentDistance > minDistanceDiff && currentSpeed > minSpeed && currentSpeed < maxSpeed) {
				if(currentDistance > maxDistanceDiff) {
					let bearing = geolib.getBearing(lastPoint, currentPoint);
					let steps = currentDistance / artificialPartLength;
					let step = 1;
					let timeStep = currentTimeSpan / steps;
					while(currentDistance > artificialPartLength) {
						let additionalPoint = geolib.computeDestinationPoint(lastPoint, artificialPartLength * step, bearing);
						lightGeoJson.features[0].geometry.coordinates.push([additionalPoint.longitude, additionalPoint.latitude, 0]);
						lightGeoJson.features[0].properties.coordTimes.push(moment(lastTimestamp).add((Math.round(timeStep*step)), 's').toISOString());
						step += 1;
						currentDistance = geolib.getDistance(additionalPoint, currentPoint);
					}
				}
				this._pushPointToTrack(lightGeoJson, index+1);
				lastPoint = currentPoint;
				lastTimestamp = coordTimes[index+1];
			}

		});
		return lightGeoJson;
	}

	_pushPointToTrack(track, index) {
		track.features[0].geometry.coordinates.push(this._originalCoordinates[index]);
		track.features[0].properties.coordTimes.push(this._coordTimes[index]);
	}

	_serialize() {
		let trackToSave = {};

		trackToSave.name = this.name;
		trackToSave.description = this.description;
		trackToSave.date = this.date.toISOString();
		trackToSave.geoJsonPath = this.geoJsonPath;
		trackToSave.originalGeoJsonPath = this.originalGeoJsonPath;
		trackToSave.url = this.url;
		trackToSave.distance = this.distance;
		trackToSave.duration = this.duration;
		trackToSave = Object.assign(trackToSave, this.altitudeStats);
		trackToSave.initialPosition = this.initialPosition;

		return trackToSave;
	}

	store() {
		const data = this._serialize();
		return storeTrack(data, this.filteredTrack, this.originalGeoJson);
	}

}

function storeTrack(data, filteredTrack, originalTrack) {
	const metadata = {
		contentType: 'application/json'
	};
	return storeFile(data.geoJsonPath, filteredTrack, metadata)
		.then(() => {
			return storeFile(data.originalGeoJsonPath, originalTrack, metadata);
		}).then(() => {
			return storeTrackMetadata(data.url, data);
		});
}

function storeFile(path, content, metadata) {
	return firebase.storage().ref().child(path).putString(JSON.stringify(content), 'raw', metadata);
}

function storeTrackMetadata(path, data) {
	return firebase.database().ref('tracks' + path).set(data);
}

function getGeolibPoint(coordinate) {
	return {
		latitude: coordinate[1],
		longitude: coordinate[0]
	};
}