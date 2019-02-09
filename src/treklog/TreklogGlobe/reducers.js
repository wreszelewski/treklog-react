import * as actions from './actions';

const initialState = {
	placemarks: [],
	animation: {
		state: 'STOP',
		speed: 1000,
		progress: 0
	}
};

function reducer(state = initialState, action) {
	switch(action.type) {
	case actions.PLACEMARKS_UPDATE:
		return Object.assign({}, state, {placemarks: action.placemarks || []});
	case actions.ANIMATION_UPDATE:
		return Object.assign({}, state, {
			animation: {
				state: action.state || state.animation.state,
				speed: action.speed || state.animation.speed,
				progress: action.progress
			}
		});

	default:
		return state;
	}
}

export default reducer;