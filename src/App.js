import React, { Component } from 'react';


import TreklogGlobe from './treklog/TreklogGlobe/TreklogGlobe';
import PlacemarksController from 'treklog/TreklogGlobe/PlacemarksController';
import TrackController from 'treklog/TreklogGlobe/TrackController';
import LiveController from 'treklog/TreklogGlobe/LiveController';
import AddTrackContainer from './treklog/AddTrackContainer';
import TrackMenuContainer from './treklog/TrackMenuContainer';
import TopMenu from './treklog/TopMenu';
import TreklogLoaderContainer from './treklog/TreklogLoaderContainer';
import BottomMenuContainer from './treklog/BottomMenuContainer';
import CesiumAttribution from './treklog/CesiumAttribution';
import { loadTrack } from './treklog/helpers/trackLoader.js';
import * as actions from './treklog/state/actions';
import * as treklogActions from 'treklog/TreklogGlobe/actions';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import { getTracks } from './treklog/helpers/trackLoader';
import _ from 'lodash';
import AnimationController from './treklog/TreklogGlobe/AnimationController';

class App extends Component {

	componentDidUpdate() {
		if(this.props.location.pathname !== '/') {
			getTracks()
				.then(tracks => _.keyBy(tracks, 'url'))
				.then(tracks => {
					if(this.props.location.pathname !== this.props.track.url)
						return loadTrack(this.props.location.pathname, tracks, this.props.actions, this.props.treklogActions);
					return Promise.resolve();
				});
		}
	}

	render() {
		return (
			<div>
				<TreklogGlobe>
					<TrackController track={this.props.track} />
					<LiveController track={this.props.track} />
					<PlacemarksController placemarks={this.props.placemarks} />
					<AnimationController
						track={this.props.track}
						animation={this.props.animation}
						animationUpdateCallback={this.props.treklogActions.animationUpdate}
					/>
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
	return {
		actions: bindActionCreators(actions, dispatch),
		treklogActions: bindActionCreators(treklogActions, dispatch)
	};
}

function mapStateToProps(state, ownProps) {
	return {
		tracks: state.tracks,
		placemarks: state.placemarks,
		track: state.track,
		animation: state.animation
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(App);