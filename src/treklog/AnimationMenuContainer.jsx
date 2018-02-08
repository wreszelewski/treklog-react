import React, {Component} from "react";
import AnimationMenu from './AnimationMenu';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';  
import * as treklogActions from "./state/actions";

  function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
  }

  function mapStateToProps(state) {
    return {
      animation: state.animation,
      track: state.track
    }
  }

  const AnimationMenuContainer = connect(
   mapStateToProps,
    mapDispatchToProps
  )(AnimationMenu)
  
  export default AnimationMenuContainer