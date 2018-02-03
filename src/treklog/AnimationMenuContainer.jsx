import React, {Component} from "react";
import AnimationMenu from './AnimationMenu';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';  
import * as treklogActions from "./state/actions";

  function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

  const AnimationMenuContainer = connect(
   undefined,
    mapDispatchToProps
  )(AnimationMenu)
  
  export default AnimationMenuContainer