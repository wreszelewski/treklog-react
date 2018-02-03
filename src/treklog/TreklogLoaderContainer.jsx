import React, {Component} from "react";
import TreklogLoader from './TreklogLoader';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';  
import * as treklogActions from "./state/actions";


const mapStateToProps = (state, ownProps) => {
    return {
      active: state.showLoader 
    }
  }

  function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

  const TreklogLoaderContainer = connect(
    mapStateToProps,
    mapDispatchToProps
  )(TreklogLoader)
  
  export default TreklogLoaderContainer