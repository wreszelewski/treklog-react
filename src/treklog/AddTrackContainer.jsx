import './styles/TrackMenu.css';
import AddTrack from './AddTrack';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';  
import * as treklogActions from "./state/actions";


const mapStateToProps = (state, ownProps) => {
    return {
      open: state.showAddTrack
    }
  }

  function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

  const AddTrackContainer = connect(
    mapStateToProps,
    mapDispatchToProps
  )(AddTrack)
  
  export default AddTrackContainer
  