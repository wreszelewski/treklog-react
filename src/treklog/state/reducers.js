import * as actions from './actions';
import treklogGlobeReducer from '../TreklogGlobe/reducers';
import _ from 'lodash';

const initialState = {
	showLoader: true,
	showTrackMenu: true,
	showAddTrack: false,
	showBottomMenu: false,
	track: {},
	tracks: {},
	tracksArr: [],
	animation: {
		state: 'STOP',
		speed: 1000,
		progress: 0
	},
	animationProgress: 0,
	placemarks: []
};

function reducer(state = initialState, action) {
	switch (action.type) {
	case actions.FETCH_TRACK_STARTED:
		return Object.assign({}, state, {showLoader: true, showMenu: false, showBottomMenu: false});
	case actions.FETCH_TRACK_FINISHED:
		return Object.assign({}, state, {track: action.track, showBottomMenu: true});
	case actions.FETCH_TRACKS_FINISHED:
		return Object.assign({}, state, {tracks: _.keyBy(action.tracks, 'url'), tracksArr: action.tracks});
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
	case actions.CESIUM_VIEWER_CREATED:
		return Object.assign({}, state, {cesiumViewer: action.cesiumViewer});
	case actions.UPDATE_ANIMATION_PROGRESS:
		return Object.assign({}, state, {animationProgress: action.progress});
	default:
		return treklogGlobeReducer(state, action);
	}
}

export default reducer;