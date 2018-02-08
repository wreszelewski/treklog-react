import {
  FETCH_TRACK_STARTED,
  FETCH_TRACK_FINISHED,
  FETCH_TRACKS_FINISHED,
  SHOW_TRACK_MENU,
  HIDE_TRACK_MENU,
  SHOW_TREKLOG_LOADER,
  HIDE_TREKLOG_LOADER,
  ANIMATION_PLAY,
  ANIMATION_PAUSE,
  ANIMATION_STOP,
  ANIMATION_RESET,
  ANIMATION_SET_SPEED
} from './actions'

import _ from 'lodash';

const initialState = {
  showLoader: true,
  showTrackMenu: true,
  showBottomMenu: false,
  track: {},
  tracks: {},
  animation: {
      shouldPlay: false,
      shouldBeInitialized: false,
      reset: false,
      speed: 300,
      currentTime: 0
  }
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_TRACK_STARTED:
        return Object.assign({}, state, {showLoader: true, showMenu: false, showBottomMenu: false});
    case FETCH_TRACK_FINISHED:
        return Object.assign({}, state, {track: action.track, showBottomMenu: true});
    case FETCH_TRACKS_FINISHED:
        return Object.assign({}, state, {tracks: _.keyBy(action.tracks, 'url')});
    case SHOW_TRACK_MENU:
        return Object.assign({}, state, {showTrackMenu: true});
    case HIDE_TRACK_MENU:
        return Object.assign({}, state, {showTrackMenu: false});
    case SHOW_TREKLOG_LOADER:
        return Object.assign({}, state, {showLoader: true});
    case HIDE_TREKLOG_LOADER:
        return Object.assign({}, state, {showLoader: false});
    case ANIMATION_PLAY:
        return Object.assign({}, state, {animation: {reset: false, shouldPlay: true, shouldBeInitialized: true, speed: state.animation.speed, currentTime: 0}});
    case ANIMATION_PAUSE:
        return Object.assign({}, state, {animation: {shouldPlay: false, shouldBeInitialized: true, speed: state.animation.speed, currentTime: 0}});
    case ANIMATION_STOP:
        return Object.assign({}, state, {animation: {shouldPlay: false, shouldBeInitialized: false, speed: state.animation.speed, currentTime: 0}});
    case ANIMATION_RESET:
        return Object.assign({}, state, {animation: {reset: true, shouldPlay: false, shouldBeInitialized: false, speed: state.animation.speed, currentTime: 0}});
    case ANIMATION_SET_SPEED:
        return Object.assign({}, state, {animation: {shouldPlay: state.animation.shouldPlay, shouldBeInitialized: state.animation.shouldBeInitialized, speed: parseInt(action.speed), currentTime: 0}})
    default:
      return state
  }
}

export default reducer