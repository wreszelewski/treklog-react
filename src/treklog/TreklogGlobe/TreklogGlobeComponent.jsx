import React, { Component } from 'react';

import TreklogGlobe from './TreklogGlobe';
import PlacemarksController from './PlacemarksController';
import TrackController from './TrackController';
import LiveController from './LiveController';
import AnimationController from './AnimationController';
import buildModuleUrl from 'cesium/Source/Core/buildModuleUrl';
import 'cesium/Source/Widgets/widgets.css';

buildModuleUrl.setBaseUrl('/cesium/');

export default class TreklogGlobeComponent extends Component {

	render() {
		return (
			<TreklogGlobe isAdmin={this.props.location.search === '?adm=1'}>
				<TrackController track={this.props.track} />
				<LiveController track={this.props.track} />
				<PlacemarksController placemarks={this.props.placemarks} />
				<AnimationController/>
			</TreklogGlobe>
		);
	}
}