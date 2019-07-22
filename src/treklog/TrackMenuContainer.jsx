import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import TrackMenu from './TrackMenu';
import * as treklogActions from './state/actions';


import './styles/TrackMenu.css';

const mapStateToProps = (state) => {
	return {
		open: state.showTrackMenu,
		tracks: state.tracksArr
	};
};

function mapDispatchToProps(dispatch) {
	return {actions: bindActionCreators(treklogActions, dispatch)};
}

const TrackMenuContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(TrackMenu);

export default TrackMenuContainer;
