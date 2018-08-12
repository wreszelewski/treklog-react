import * as actions from './actions';

import _ from 'lodash';

const initialState = {
	showLoader: true,
	showTrackMenu: true,
	showAddTrack: false,
	showBottomMenu: false,
	track: {},
	tracks: {},
	animation: {
		shouldPlay: false,
		shouldReplay: false,
		shouldBeInitialized: false,
		reset: false,
		speed: 300,
		currentTime: 0,
		newTime: null
	}
};

function reducer(state = initialState, action) {
	const minimumDifference = 2;
	switch (action.type) {
	case actions.FETCH_TRACK_STARTED:
		return Object.assign({}, state, {showLoader: true, showMenu: false, showBottomMenu: false});
	case actions.FETCH_TRACK_FINISHED:
		return Object.assign({}, state, {track: action.track, showBottomMenu: true});
	case actions.FETCH_TRACKS_FINISHED:
		return Object.assign({}, state, {tracks: _.keyBy(action.tracks, 'url')});
	case actions.SHOW_ADD_TRACK:
		return Object.assign({}, state, {showAddTrack: true});
	case actions.HIDE_ADD_TRACK:
		return Object.assign({}, state, {showAddTrack: false});
	case actions.SHOW_TRACK_MENU:
		return Object.assign({}, state, {showTrackMenu: true});
	case actions.HIDE_TRACK_MENU:
		return Object.assign({}, state, {showTrackMenu: false});
	case actions.SHOW_TREKLOG_LOADER:
		return Object.assign({}, state, {showLoader: true});
	case actions.HIDE_TREKLOG_LOADER:
		return Object.assign({}, state, {showLoader: false});
	case actions.ANIMATION_PLAY:
		return Object.assign({}, state, {
			animation: {
				reset: false,
				shouldPlay: true,
				shouldReplay: true,
				shouldBeInitialized: true,
				speed: state.animation.speed,
				currentTime: 0
			}
		});
	case actions.ANIMATION_PAUSE:
		return Object.assign({}, state, {
			animation: {
				shouldPlay: false,
				shouldBeInitialized: true,
				speed: state.animation.speed,
				currentTime: 0
			}
		});
	case actions.ANIMATION_STOP:
		return Object.assign({}, state, {
			animation: {
				shouldPlay: false,
				shouldBeInitialized: false,
				speed: state.animation.speed,
				currentTime: 0
			}
		});
	case actions.ANIMATION_RESET:
		return Object.assign({}, state, {
			animation: {
				reset: true,
				shouldPlay: false,
				shouldBeInitialized: false,
				speed: state.animation.speed,
				currentTime: 0
			}
		});
	case actions.ANIMATION_SET_SPEED:
		return Object.assign({}, state, {
			animation: {
				shouldPlay: state.animation.shouldPlay,
				shouldBeInitialized: state.animation.shouldBeInitialized,
				speed: parseInt(action.speed),
				currentTime: 0
			}
		});
	case actions.UPDATE_ANIMATION_PROGRESS:
		return Object.assign({}, state, {
			animation: Object.assign({}, state.animation, {
				currentTime: action.currentRelativeTime,
				time: action.currentTime,
				newTime: null,
				shouldReplay: false
			})
		});
	case actions.ANIMATION_PROGRESS_SET_TIME:
		if (Math.abs(state.animation.currentTime - action.newTime) > minimunDifference) {
			return Object.assign({}, state, {animation: Object.assign({}, state.animation, {newTime: action.newTime})});
		} else {
			return state;
		}
	case actions.CESIUM_VIEWER_CREATED:
		return Object.assign({}, state, {cesiumViewer: action.cesiumViewer});
	default:
		return state;
	}
}

export default reducer;