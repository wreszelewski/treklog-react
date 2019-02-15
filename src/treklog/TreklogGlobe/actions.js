export const PLACEMARKS_UPDATE = 'PLACEMARKS_UPDATE';

export const ANIMATION_UPDATE = 'ANIMATION_UPDATE';

export const ANIMATION_PROGRESS_UPDATE = 'ANIMATION_PROGRESS_UPDATE';

export function updatePlacemarks(placemarks) {
	return {type: PLACEMARKS_UPDATE, placemarks};
}

export function animationUpdate(state, speed, progress) {
	return {
		type: ANIMATION_UPDATE,
		state,
		speed,
		progress
	};
}

export function animationReset() {
	return {
		type: ANIMATION_UPDATE,
		state: 'RESET',
		progress: 0
	};
}