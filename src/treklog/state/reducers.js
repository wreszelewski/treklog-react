import {
  FETCH_TRACK_STARTED,
  FETCH_TRACK_FINISHED,
  SHOW_TRACK_MENU,
  HIDE_TRACK_MENU
} from './actions'

const initialState = {
  showLoader: false,
  showTrackMenu: true,
  track: {}
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_TRACK_STARTED:
        return Object.assign({}, state, {showLoader: true, showMenu: false});
    case FETCH_TRACK_FINISHED:
        return Object.assign({}, state, {track: action.track});
    case SHOW_TRACK_MENU:
        return Object.assign({}, state, {showTrackMenu: true});
    case HIDE_TRACK_MENU:
        return Object.assign({}, state, {showTrackMenu: false});
    default:
      return state
  }
}

export default reducer