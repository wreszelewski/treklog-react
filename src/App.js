import React, { Component } from 'react';

import loadable from '@loadable/component';

class EmptyComponent extends Component {
	render() {
		return (
			<div></div>
		);
	}
}

function detectWebGLContext () {
	var canvas = document.createElement('canvas');
	var gl = canvas.getContext('webgl')
      || canvas.getContext('experimental-webgl');
	if (gl && gl instanceof WebGLRenderingContext) {
		return true;
	} else {
		return false;
	}
}

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
import { keyBy } from 'lodash';
import config from 'config';

class App extends Component {


	constructor(props) {
		super(props);
		this.state = {
			treklogGlobeComponent: EmptyComponent
		};
	}

	loadTreklogGlobe = () => {
		const TreklogGlobeComponent = loadable(() => new Promise((resolve, reject) => {
			if(detectWebGLContext()) {
				resolve(import('treklog/TreklogGlobe/TreklogGlobeComponent'));
			} else {
				resolve(EmptyComponent);
			}
		}));
		this.setState(Object.assign({}, this.state, {treklogGlobeComponent: TreklogGlobeComponent}));
		window.removeEventListener('click', this.loadTreklogGlobe);
	}
	componentDidMount() {
		if(this.props.location.pathname !== '/') {
			this.loadTreklogGlobe();
		} else {
			window.addEventListener('click', this.loadTreklogGlobe);
		}
	}

	componentDidUpdate() {

		if(this.props.location.pathname !== '/') {
			getTracks()
				.then(tracks => keyBy(tracks, 'url'))
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
				<this.state.treklogGlobeComponent track={this.props.track} placemarks={this.props.placemarks} fallback={<div></div>} location={this.props.location}/>
				<TopMenu location={this.props.location}/>
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
		track: state.track
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(App);