import AnimationMenu from './AnimationMenu';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as treklogActions from 'treklog/TreklogGlobe/actions';
import * as actions from 'treklog/state/actions';


function mapDispatchToProps(dispatch) {
	return {
		treklogActions: bindActionCreators(treklogActions, dispatch),
		actions: bindActionCreators(actions, dispatch)
	};
}

function mapStateToProps(state) {
	return {
		animationProgress: state.animation.progress,
		track: state.track
	};
}

const AnimationMenuContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(AnimationMenu);

export default AnimationMenuContainer;