import React, { Component } from 'react';


import CesiumGlobe from "./treklog/CesiumGlobe";
import TrackMenuContainer from "./treklog/TrackMenuContainer"
import TopMenu from "./treklog/TopMenu"
import TreklogLoaderContainer from "./treklog/TreklogLoaderContainer"
import TrackDescriptionContainer from "./treklog/TrackDescriptionContainer"
import BottomMenuContainer from "./treklog/BottomMenuContainer"
import CesiumAttribution from './treklog/CesiumAttribution';
import { loadTrack } from './treklog/helpers/trackLoader.js';
import * as treklogActions from "./treklog/state/actions";
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import { getTracks } from './treklog/helpers/trackLoader';
import _ from 'lodash';


class App extends Component {

    componentWillReceiveProps(nextProps) {
        if(nextProps.location.pathname != '/') {
            
            getTracks()
                .then(tracks => _.keyBy(tracks, 'url'))
                .then(tracks => loadTrack(this.props.location.pathname, tracks, this.props.actions));
        }
    }

    render() {
        return (
            <div>
                <TopMenu />
                <TrackMenuContainer />
                <CesiumGlobe />
                <BottomMenuContainer />
                <CesiumAttribution />
                <TreklogLoaderContainer />
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

function mapStateToProps(state, ownProps) {  
    return {
        tracks: state.tracks
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);