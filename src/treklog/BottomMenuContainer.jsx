import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as treklogActions from './state/actions';
import * as actions from 'treklog/TreklogGlobe/actions';
import BottomMenu from './BottomMenu';


const mapStateToProps = (state) => {
	return {
		active: state.showBottomMenu,
		track: state.track,
		cesiumViewer: state.cesiumViewer,
		placemarks: state.placemarks
	};
};

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(treklogActions, dispatch),
		treklogGlobeActions: bindActionCreators(actions, dispatch)
	};
}

const BottomMenuContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(BottomMenu);

export default BottomMenuContainer;