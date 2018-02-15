import BottomMenu from './BottomMenu';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';  
import * as treklogActions from "./state/actions";


const mapStateToProps = (state, ownProps) => {
    return {
      active: state.showBottomMenu,
    }
  }

  function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

  const BottomMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
  )(BottomMenu)
  
  export default BottomMenuContainer