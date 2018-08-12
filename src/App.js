import React, { Component } from 'react';


import TreklogGlobe from './treklog/TreklogGlobe/TreklogGlobe';
import PlacemarksController from 'treklog/TreklogGlobe/PlacemarksController';
import AddTrackContainer from './treklog/AddTrackContainer';
import TrackMenuContainer from './treklog/TrackMenuContainer';
import TopMenu from './treklog/TopMenu';
import TreklogLoaderContainer from './treklog/TreklogLoaderContainer';
import BottomMenuContainer from './treklog/BottomMenuContainer';
import CesiumAttribution from './treklog/CesiumAttribution';
import { loadTrack } from './treklog/helpers/trackLoader.js';
import * as treklogActions from './treklog/state/actions';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import { getTracks } from './treklog/helpers/trackLoader';
import _ from 'lodash';

class App extends Component {

	componentDidUpdate(nextProps) {
		if(nextProps.location.pathname !== '/') {

			getTracks()
				.then(tracks => _.keyBy(tracks, 'url'))
				.then(tracks => {
					if(this.props.location.pathname !== this.props.track.url)
						return loadTrack(this.props.location.pathname, tracks, this.props.actions);
					return Promise.resolve();
				});
		}
	}

	render() {
		return (
			<div>
				<TreklogGlobe>
					<PlacemarksController placemarks={this.props.placemarks} />
				</TreklogGlobe>
				<TopMenu />
				<AddTrackContainer/>
				<TrackMenuContainer />
				<BottomMenuContainer />
				<CesiumAttribution />
				<TreklogLoaderContainer />
			</div>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {actions: bindActionCreators(treklogActions, dispatch)};
}

function mapStateToProps(state, ownProps) {
	return {
		tracks: state.tracks,
		placemarks: state.placemarks,
		track: state.track
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(App);