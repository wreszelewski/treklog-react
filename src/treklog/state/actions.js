export const FETCH_TRACK_STARTED = 'FETCH_TRACK_STARTED';
export const FETCH_TRACK_FINISHED = 'FETCH_TRACK_FINISHED';

export const SHOW_TRACK_MENU = 'SHOW_TRACK_MENU';
export const HIDE_TRACK_MENU = 'HIDE_TRACK_MENU';

export const SHOW_TREKLOG_LOADER = 'SHOW_TREKLOG_LOADER';
export const HIDE_TREKLOG_LOADER = 'HIDE_TREKLOG_LOADER';

export function fetchTrackStarted() {
  return { type: FETCH_TRACK_STARTED }
}

export function fetchTrackFinished(track) {
    return { type: FETCH_TRACK_FINISHED, track}
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