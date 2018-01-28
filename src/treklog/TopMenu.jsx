import React, {Component} from "react";
import firebase from "firebase";
import config from "../config";
import Moment from 'react-moment';
import 'moment/locale/pl';
import * as treklogActions from "./state/actions";
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import {Button,Icon} from 'semantic-ui-react';
import './styles/TopMenu.css';


class TopMenu extends Component {
    
    loadTrack() {
        this.props.actions.fetchTrackStarted();
        this.getPoints(this.props.track.geoJsonPath)
            .then((geoJsonPoints) => {
                this.props.track.geoJsonPoints = geoJsonPoints;
                this.props.actions.fetchTrackFinished(this.props.track);
            });
    }

    render() {
        
        return (
            <div id="topMenu">
                <Button icon size="large" inverted><Icon name="facebook f" />Podziel się</Button>
                <Button size="large" inverted onClick={this.props.actions.showTrackMenu}>Menu</Button>
            </div>
        );
    }
    
}

function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

export default connect(undefined, mapDispatchToProps)(TopMenu);