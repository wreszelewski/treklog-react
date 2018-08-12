import * as actions from './actions';

const initialState = {
	placemarks: []
};

function reducer(state = initialState, action) {
	switch(action.type) {
	case actions.PLACEMARKS_UPDATE:
		return Object.assign({}, state, {placemarks: action.placemarks || []});
	default:
		return state;
	}
}

export default reducer;