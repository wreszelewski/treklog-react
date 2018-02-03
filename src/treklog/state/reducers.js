import {
  FETCH_TRACK_STARTED,
  FETCH_TRACK_FINISHED,
  SHOW_TRACK_MENU,
  HIDE_TRACK_MENU,
  SHOW_TREKLOG_LOADER,
  HIDE_TREKLOG_LOADER
} from './actions'

const initialState = {
  showLoader: true,
  showTrackMenu: true,
  showBottomMenu: false,
  track: {}
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_TRACK_STARTED:
        return Object.assign({}, state, {showLoader: true, showMenu: false, showBottomMenu: false});
    case FETCH_TRACK_FINISHED:
        return Object.assign({}, state, {track: action.track, showBottomMenu: true});
    case SHOW_TRACK_MENU:
        return Object.assign({}, state, {showTrackMenu: true});
    case HIDE_TRACK_MENU:
        return Object.assign({}, state, {showTrackMenu: false});
    case SHOW_TREKLOG_LOADER:
        return Object.assign({}, state, {showLoader: true});
    case HIDE_TREKLOG_LOADER:
        return Object.assign({}, state, {showLoader: false});
    default:
      return state
  }
}

export default reducer