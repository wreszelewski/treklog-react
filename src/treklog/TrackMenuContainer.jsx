import React, {Component} from "react";
import firebase from "firebase";
import config from "../config";
import moment from "moment";
import './styles/TrackMenu.css';
import {Modal,Button} from 'semantic-ui-react';
import Moment from 'react-moment';
import 'moment/locale/pl';
import TrackMenu from './TrackMenu';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';  
import * as treklogActions from "./state/actions";


const mapStateToProps = (state, ownProps) => {
    return {
      open: state.showTrackMenu 
    }
  }

  function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

  const TrackMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
  )(TrackMenu)
  
  export default TrackMenuContainer
  