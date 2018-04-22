export const FETCH_TRACK_STARTED = 'FETCH_TRACK_STARTED';
export const FETCH_TRACK_FINISHED = 'FETCH_TRACK_FINISHED';

export const FETCH_TRACKS_FINISHED = 'FETCH_TRACKS_FINISHED';

export const SHOW_TRACK_MENU = 'SHOW_TRACK_MENU';
export const HIDE_TRACK_MENU = 'HIDE_TRACK_MENU';

export const SHOW_TREKLOG_LOADER = 'SHOW_TREKLOG_LOADER';
export const HIDE_TREKLOG_LOADER = 'HIDE_TREKLOG_LOADER';

export const ANIMATION_PLAY = 'ANIMATION_PLAY';
export const ANIMATION_PAUSE = 'ANIMATION_PAUSE';
export const ANIMATION_STOP = 'ANIMATION_STOP';
export const ANIMATION_RESET = 'ANIMATION_RESET';
export const ANIMATION_SET_SPEED = 'ANIMATION_SET_SPEED';

export const UPDATE_ANIMATION_PROGRESS = 'UPDATE_ANIMATION_PROGRESS';
export const ANIMATION_PROGRESS_SET_TIME = 'ANIMATION_PROGRESS_SET_TIME';

export const CESIUM_VIEWER_CREATED = 'CESIUM_VIEWER_CREATED';

export function fetchTrackStarted() {
  return { type: FETCH_TRACK_STARTED }
}

export function fetchTrackFinished(track) {
    return { type: FETCH_TRACK_FINISHED, track}
}

export function fetchTracksFinished(tracks) {
  return { type: FETCH_TRACKS_FINISHED, tracks}
}

export function showTrackMenu() {
  return { type: SHOW_TRACK_MENU };
}

export function hideTrackMenu() {
  return { type: HIDE_TRACK_MENU};
}

export function showTreklogLoader() {
  return { type: SHOW_TREKLOG_LOADER };
}

export function hideTreklogLoader() {
  return { type: HIDE_TREKLOG_LOADER };
}

export function animationPlay() {
  return { type: ANIMATION_PLAY };
}

export function animationPause() {
  return { type: ANIMATION_PAUSE };
}

export function animationStop() {
  return { type: ANIMATION_STOP };
}

export function animationReset() {
  return { type: ANIMATION_RESET };
}

export function animationSetSpeed(speed) {
  return { type: ANIMATION_SET_SPEED, speed };
}

export function updateAnimationProgress(currentRelativeTime, currentTime) {
  return { type: UPDATE_ANIMATION_PROGRESS, currentRelativeTime, currentTime};
}

export function animationProgressSetTime(newTime) {
  return { type: ANIMATION_PROGRESS_SET_TIME, newTime};
}

export function cesiumViewerCreated(cesiumViewer) {
  return { type: CESIUM_VIEWER_CREATED, cesiumViewer};
}