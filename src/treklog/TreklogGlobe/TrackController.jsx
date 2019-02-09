import {Component} from 'react';
import * as Promise from 'bluebird';

import Color from 'cesium/Source/Core/Color';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource';
import CzmlDataSource from 'cesium/Source/DataSources/CzmlDataSource';
import HeadingPitchRange from 'cesium/Source/Core/HeadingPitchRange';
import Cartographic from 'cesium/Source/Core/Cartographic';
import sampleTerrainMostDetailed from 'cesium/Source/Core/sampleTerrainMostDetailed';

import czml from 'treklog/helpers/czml';
import cameraPosition from 'treklog/helpers/cameraPosition';

const heading = 0;
const pitch = -1.5707963267948966;
const range = 20000;

export default class TrackController extends Component {

	constructor(props) {
		super(props);
		this.viewer;
		this.trackUrl = '';
		this.loadTrack.bind(this);
	}

	componentDidUpdate() {
		this.viewer = this.props.cesiumViewer;
		if(!this.viewer) return;
		if(this.props.track.url && this.trackUrl !== this.props.track.url) {
			this.trackUrl = this.props.track.url;
			this.loadTrack(this.props.track);
		}

	}

	loadTrack(track) {
		return this.getCesiumTerrainForGeoJson(track.geoJsonPoints).then((altitudeData) => {
			track.czmlAltitude = altitudeData;
			const geoJsonDs = GeoJsonDataSource.load(track.geoJsonPoints, {
				stroke: Color.fromCssColorString('#f4d797'),
				strokeWidth: 5,
				clampToGround: true
			});
			const czmlDoc = czml.fromGeoJson(track.geoJsonPoints, track.czmlAltitude);
			const czmlDs = CzmlDataSource.load(czmlDoc);
			return Promise.all([geoJsonDs, czmlDs]);
		}).then(([geoJsonDs, czmlDs]) => {
			this.viewer.dataSources.removeAll();
			const addGeoJson = this.viewer.dataSources.add(geoJsonDs);
			const addCzml = this.viewer.dataSources.add(czmlDs);
			return Promise.all([addGeoJson, addCzml]);
		}).then(([addGeoJson, addCzml]) => {
			addCzml.show = false;

			if (track.initialPosition.position) {
				const destination = cameraPosition.getDestination(track);
				const orientation = cameraPosition.getOrientation(track);

				return this.viewer.flyTo(addGeoJson, {
					maxiumumHeight: 20000,
					duration: 3,
					offset: new HeadingPitchRange(heading, pitch, range)
				}).then(() => {
					const flightDuration = 3000;
					return Promise.delay(flightDuration).then(() => {
						this.viewer.camera.flyTo({
							destination,
							orientation,
							maxiumumHeight: 20000,
							duration: 3
						});
					});
				});
			} else {
				const range = 4000;
				return this.viewer.flyTo(addGeoJson, { offset: new HeadingPitchRange(heading, pitch, range) });
			}
		});

	}

	getCesiumTerrainForGeoJson(geojson) {
		const pathCartographic = geojson.features[0].geometry.coordinates.map(point => new Cartographic.fromDegrees(point[0], point[1]));
		return sampleTerrainMostDetailed(this.viewer.terrainProvider, pathCartographic);
	}

	render() { return null; }


}