import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as treklogActions from './state/actions';
import BottomMenu from './BottomMenu';


const mapStateToProps = (state) => {
	return {
		active: state.showBottomMenu,
		track: state.track,
		cesiumViewer: state.cesiumViewer
	};
};

function mapDispatchToProps(dispatch) {
	return {actions: bindActionCreators(treklogActions, dispatch)};
}

const BottomMenuContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(BottomMenu);

export default BottomMenuContainer;