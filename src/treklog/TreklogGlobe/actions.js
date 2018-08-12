export const PLACEMARKS_UPDATE = 'PLACEMARKS_UPDATE';

export function updatePlacemarks(placemarks) {
	return {type: PLACEMARKS_UPDATE, placemarks};
}