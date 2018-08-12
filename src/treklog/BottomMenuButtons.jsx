import React, {Component} from 'react';
import {Button} from 'semantic-ui-react';
import firebase from 'firebase';

import PointPrimitiveCollection from 'cesium/Source/Scene/PointPrimitiveCollection';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import LabelCollection from 'cesium/Source/Scene/LabelCollection';
import PolylineCollection from 'cesium/Source/Scene/PolylineCollection';
import DistanceDisplayCondition from 'cesium/Source/Core/DistanceDisplayCondition';
import HorizontalOrigin from 'cesium/Source/Scene/HorizontalOrigin';
import Material from 'cesium/Source/Scene/Material';
import LabelStyle from 'cesium/Source/Scene/LabelStyle';

import TrackCalculator from './helpers/trackCalculator';

import './styles/BottomMenu.css';


export default class BottomMenuButtons extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoggedIn: false,
			addPointMode: false,
			pointName: 'Nowy punkt',
			pointLatitude: 0,
			pointLongitude: 0,
			pointHeight: 0
		};

		this.polylines = this.props.cesiumViewer.scene.primitives.add(new PolylineCollection());
		this.labels = this.props.cesiumViewer.scene.primitives.add(new LabelCollection());
		this.points = this.props.cesiumViewer.scene.primitives.add(new PointPrimitiveCollection());
		this.pointIndex = 0;
		firebase.auth().onAuthStateChanged(user => {
			if(user) {
				this.setState({
					isLoggedIn: true
				});
			} else {
				this.setState({
					isLoggedIn: false
				});
			}
		});
	}

	recalculateTrack() {
		const trackCalc = new TrackCalculator(this.props.track.originalGeoJsonPoints, this.props.track.czmlAltitude);
		const altitudeStats = trackCalc.altitudeStats;
		let updates = {};
		updates['duration'] = trackCalc.duration;
		updates['distance'] = trackCalc.distance;
		updates['ascent'] = Math.round(altitudeStats.ascent);
		updates['descent'] = Math.round(altitudeStats.descent);
		updates['maxAltitude'] = Math.round(altitudeStats.maxAltitude);
		updates['minAltitude'] = Math.round(altitudeStats.minAltitude);
		return firebase.storage().ref(this.props.track.geoJsonPath).putString(JSON.stringify(trackCalc.filteredTrack), undefined, {
			contentType: 'application/json'
		}).then(() => {
			return firebase.database().ref('tracks' + this.props.track.url).update(updates);
		});

	}


	setInitialPosition() {
		const initialPosition = {
			position: {
				x: this.props.cesiumViewer.camera.position.x,
				y: this.props.cesiumViewer.camera.position.y,
				z: this.props.cesiumViewer.camera.position.z
			},
			heading: this.props.cesiumViewer.camera.heading,
			pitch: this.props.cesiumViewer.camera.pitch,
			roll: this.props.cesiumViewer.camera.roll
		};
		let updates = {};
		updates['initialPosition'] = initialPosition;
		firebase.database().ref('tracks' + this.props.track.url).update(updates);
	}

	setSocialImage() {
		const socialFilePath = this.props.track.url;
		this.props.cesiumViewer.render();
		const socialImageRaw = this.props.cesiumViewer.canvas.toDataURL();


		const canvas = document.createElement('canvas');
		canvas.width = 900;
		canvas.height = 472;

		var ctx = canvas.getContext('2d');
		const credits = Array.from(document.getElementsByClassName('cesium-credit-text')).reduce((acc, val) => {
			return acc + (val.innerHTML + '. ');
		}, '');


		const creditsRows = this._splitCredits(credits);
		const svgRowsArr = creditsRows.map(row => '<tspan x="0" dy="1.0em">' + row + '</tspan>');
		var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + this.props.cesiumViewer.canvas.width + '" height="200">' +
		'<style><![CDATA[' +
		'tspan{font-size:8px;fill:white;font-family:sans-serif;}' +
		']]></style>' +
		'<text x="0" y="0">' +
		svgRowsArr.join('') +
		'</text>' +
		'</svg>';
		var img = new Image();
		var img2 = new Image();
		var svg = 'data:image/svg+xml,' + data;

		img.onload = () => {
			const width = 900;
			const height = 472;
			const creditRowHeight = 10;
			ctx.drawImage(img, 0, 0, width, height);
			img2.onload = () => {
				ctx.drawImage(img2, 0, canvas.height-(creditsRows.length * creditRowHeight));
				//DOMURL.revokeObjectURL(url);
				return this._storeSocialImageAndMeta(socialFilePath, canvas.toDataURL());
			};
			img2.src = svg;
		};

		img.src = socialImageRaw;

	}

	_splitCredits(credits) {
		const additionalSpace = 1;
		const splittedCredits = credits.split(' ');
		const limit = 250;
		let letters = 0;
		let rows = [];
		let row = [];
		splittedCredits.forEach(function(word) {
			if(letters + word.length < limit) {
				row.push(word);
				letters += word.length + additionalSpace;
			} else {
				rows.push(row);
				row = [word];
				letters = word.length;
			}
		});
		rows.push(row);
		const strRows = rows.map(row => row.join(' '));
		return strRows;
	}

	_storeSocialImageAndMeta(path, data) {
		const imgPath = '/socialImages' + path + '.jpg';
		const metadata = {
			contentType: 'image/jpeg'
		};
		firebase.storage().ref().child(imgPath).putString(data, 'data_url', metadata).then((image) => {
			let updates = {};
			updates['socialImage'] = image.downloadURL;
			return firebase.database().ref('tracks' + path).update(updates);
		});
	}

	finishLive() {
		const trackCalc = new TrackCalculator(this.props.track.originalGeoJsonPoints, this.props.track.czmlAltitude);
		const altitudeStats = trackCalc.altitudeStats;
		let updates = {};
		updates['isLive'] = false;
		updates['geoJsonPoints'] = {};
		updates['originalGeoJsonPoints'] = {};
		updates['originalGeoJsonPath'] = trackCalc.originalGeoJsonPath;
		updates['geoJsonPath'] = trackCalc.geoJsonPath;

		return firebase.storage().ref(this.props.track.geoJsonPath).getDownloadURL()
			.then(path => {
				const geoJsonReq = new Request(path);
				return fetch(geoJsonReq);
			}).then(geojsonFile => geojsonFile.blob())
			.then(geojsonFile => {
				return Promise.all([
					firebase.storage().ref(trackCalc.originalGeoJsonPath).put(geojsonFile),
					firebase.storage().ref(trackCalc.geoJsonPath).put(geojsonFile)
				]);
			}).then(() => {
				return Promise.all([
					firebase.database().ref('tracks' + this.props.track.url).update(updates),
					firebase.database().ref('currentLive').set({})
				]);

			});

	}

	setAddPointMode() {
		this.pointIndex = 0;
		const pointPosition = this.props.track.geoJsonPoints.features[0].geometry.coordinates[this.pointIndex];
		this.setState({
			addPointMode: true,
			pointLongitude: pointPosition[0],
			pointLatitude: pointPosition[1],
			pointHeight: pointPosition[2]
		});
		this.currentPoint = this.points.add({
			position: Cartesian3.fromDegrees(pointPosition[0], pointPosition[1], pointPosition[2]),
			pixelSize: 20.0,
			color: Color.BLACK,
			disableDepthTestDistance: Number.POSITIVE_INFINITY
		});

		this.scrollHandler = new ScreenSpaceEventHandler(this.props.cesiumViewer.canvas);
		this.props.cesiumViewer.scene.screenSpaceCameraController.enableZoom = false;
		this.scrollHandler.setInputAction((e) => {
			if(e > 0) {
				const padding = 1;
				if(this.pointIndex < this.props.track.geoJsonPoints.features[0].geometry.coordinates.length - padding) {
					this.pointIndex += 1;
				}

			} else {
				if(this.pointIndex > 0) {
					this.pointIndex -= 1;
				}
			}
			const pointPosition = this.props.track.geoJsonPoints.features[0].geometry.coordinates[this.pointIndex];
			this.currentPoint.position = Cartesian3.fromDegrees(pointPosition[0], pointPosition[1], pointPosition[2]);
			this.setState({
				pointLatitude: pointPosition[0],
				pointLongitude: pointPosition[1],
				pointHeight: pointPosition[2]
			});
		}, ScreenSpaceEventType.WHEEL);

	}

	leaveAddPointMode() {
		this.setState({addPointMode: false});
		this.points.removeAll();
		this.props.cesiumViewer.scene.screenSpaceCameraController.enableZoom = true;

	}

	addPoint() {

		const polylineLength = 300;
		const labelVerticalOffset = 350;
		const visibleFrom = 0;
		const lineVisibleTo = 20000;
		const labelVisibleTo = 30000;

		let placemarks = this.props.track.placemarks || [];

		this.polylines.add({
			positions: Cartesian3.fromDegreesArrayHeights([
				this.state.pointLatitude, this.state.pointLongitude, this.state.pointHeight,
				this.state.pointLatitude, this.state.pointLongitude, this.state.pointHeight + polylineLength
			]),
			width: 1,
			material: new Material({
				fabric : {
					type : 'Color',
					uniforms : {
						color : Color.fromCssColorString('#f4d797')
					}
				}
			}),
			distanceDisplayCondition: new DistanceDisplayCondition(visibleFrom, lineVisibleTo)
		});
		this.labels.add({
			position: Cartesian3.fromDegrees(this.state.pointLatitude, this.state.pointLongitude, this.state.pointHeight + labelVerticalOffset),
			text: this.state.pointName,
			font: '20px Lato, sans-serif',
			style: LabelStyle.FILL_AND_OUTLINE,
			fillColor : Color.fromCssColorString('#f4d797'),
			outlineColor : Color.fromCssColorString('#2d200e'),
			outlineWidth: 2,
			horizontalOrigin: HorizontalOrigin.CENTER,
			distanceDisplayCondition: new DistanceDisplayCondition(visibleFrom, labelVisibleTo)
		});
		placemarks.push({
			longitude: this.state.pointLatitude,
			latitude: this.state.pointLongitude,
			height: this.state.pointHeight,
			name: this.state.pointName
		});
		const updates = {placemarks: placemarks};
		this.setState({pointName: 'Nowy punkt'});
		return firebase.database().ref('tracks' + this.props.track.url).update(updates);
	}

	updatePointName(ev) {
		this.setState({pointName: ev.target.value});
	}

	updatePointLongitude(ev) {
		this.setState({pointLongitude: parseFloat(ev.target.value)});
		this.currentPoint.position = Cartesian3.fromDegrees(parseFloat(this.state.pointLatitude), parseFloat(this.state.pointLongitude), parseFloat(this.state.pointHeight));
	}

	updatePointLatitude(ev) {
		this.setState({pointLatitude: parseFloat(ev.target.value)});
		this.currentPoint.position = Cartesian3.fromDegrees(parseFloat(this.state.pointLatitude), parseFloat(this.state.pointLongitude), parseFloat(this.state.pointHeight));
	}

	updatePointHeight(ev) {
		this.setState({pointHeight: parseFloat(ev.target.value)});
		this.currentPoint.position = Cartesian3.fromDegrees(parseFloat(this.state.pointLatitude), parseFloat(this.state.pointLongitude), parseFloat(this.state.pointHeight));
	}

	render() {
		if(this.state.isLoggedIn) {
			if(this.state.addPointMode) {
				return (
					<div className="buttons">
						<input type="text" className="textInput" value={this.state.pointLongitude} onChange={this.updatePointLongitude.bind(this)}/>
						<input type="text" className="textInput" value={this.state.pointLatitude} onChange={this.updatePointLatitude.bind(this)}/>
						<input type="text" className="textInput" value={this.state.pointHeight} onChange={this.updatePointHeight.bind(this)}/>
						<input type="text" className="textInput" id="pointName" value={this.state.pointName} onChange={this.updatePointName.bind(this)}/>
						<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.addPoint.bind(this)}>Dodaj punkt</Button>
						<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.leaveAddPointMode.bind(this)}>Opuść dodawanie punktu</Button>
					</div>
				);
			} else {
				return (
					<div className="buttons">
						<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.setAddPointMode.bind(this)}>Dodawanie punktu</Button>
						<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.setSocialImage.bind(this)}>Ustaw obrazek</Button>
						<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.setInitialPosition.bind(this)}>Ustaw pozycję</Button>
						<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.recalculateTrack.bind(this)}>Przelicz trasę</Button>
						<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.finishLive.bind(this)}>Zakończ live</Button>
					</div>
				);
			}
		} else {
			return null;
		}
	}
}