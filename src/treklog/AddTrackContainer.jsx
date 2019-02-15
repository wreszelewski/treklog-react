import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import AddTrack from './AddTrack';
import * as treklogActions from './state/actions';

import './styles/TrackMenu.css';

const mapStateToProps = (state) => {
	return {
		open: state.showAddTrack
	};
};

function mapDispatchToProps(dispatch) {
	return {actions: bindActionCreators(treklogActions, dispatch)};
}

const AddTrackContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(AddTrack);

export default AddTrackContainer;
