import {Component} from 'react';
import moment from 'moment';
import firebase from 'firebase';

import JulianDate from 'cesium/Source/Core/JulianDate';
import Cartographic from 'cesium/Source/Core/Cartographic';
import sampleTerrainMostDetailed from 'cesium/Source/Core/sampleTerrainMostDetailed';

export default class LiveController extends Component {

	constructor(props) {
		super(props);
		this.viewer;
		this.trackUrl = '';
	}

	componentDidUpdate() {
		this.viewer = this.props.cesiumViewer;
		if(!this.viewer) return;
		if(this.props.track.url && this.trackUrl !== this.props.track.url && this.props.track.isLive) {
			this.trackUrl = this.props.track.url;
			this.registerLiveTrackListener(this.props.track);
		}

	}

	registerLiveTrackListener(track) {

		const czmlDataSourceId = 1;
		const heightOffset = 4;
		firebase.database().ref('/currentLive').on('value', (snapshot) => {
			const currentLiveData = snapshot.val();
			if (currentLiveData.trackUrl === track.url) {
				if (this.viewer.dataSources.get(czmlDataSourceId)) {
					const availability = JulianDate.toIso8601(this.viewer.clock.startTime) + '/' + moment(currentLiveData.lastUpdate).toISOString();
					const pathCarto = [new Cartographic.fromDegrees(currentLiveData.point.latitude, currentLiveData.point.longitude)];
					sampleTerrainMostDetailed(this.viewer.terrainProvider, pathCarto)
						.then(altitude => {
							return this.viewer.dataSources.get(czmlDataSourceId).process({
								id: 'path',
								availability: availability,
								position: {
									cartographicDegrees: [currentLiveData.lastUpdate, currentLiveData.point.latitude, currentLiveData.point.longitude, altitude[0].height + heightOffset]
								}
							});
						})
						.then(() => {
							this.viewer.dataSources.get(czmlDataSourceId).process({
								id: 'document',
								clock: {
									interval: availability,
									currentTime: JulianDate.toIso8601(this.viewer.clock.currentTime),
									multiplier: this.viewer.clock.multiplier

								}
							});
						}).then(() => {
							this.viewer.clock.stopTime = JulianDate.fromIso8601(currentLiveData.lastUpdate);
							this.viewer.clock.shouldAnimate = true;
						});
				}
			} else {
				firebase.database().ref('/currentLive').off();
			}
		});
	}

	render() { return null; }


}