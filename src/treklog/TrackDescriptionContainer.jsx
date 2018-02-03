import React, {Component} from "react";
import TrackDescription from './TrackDescription';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';  
import * as treklogActions from "./state/actions";


const mapStateToProps = (state, ownProps) => {
    return {
      active: state.showTrackDescription,
      track: state.track 
    }
  }

  function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

  const TrackDescriptionContainer = connect(
    mapStateToProps,
    mapDispatchToProps
  )(TrackDescription)
  
  export default TrackDescriptionContainer