import React, {Component} from "react";
import firebase from "firebase";
import config from "../config";
import Moment from 'react-moment';
import 'moment/locale/pl';
import * as treklogActions from "./state/actions";
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';  

class TrackMenuItem extends Component {
    
    loadTrack() {
        this.props.actions.showTreklogLoader();
        this.props.actions.fetchTrackStarted();
        this.props.actions.hideTrackMenu();
        this.getPoints(this.props.track.geoJsonPath)
            .then((geoJsonPoints) => {
                this.props.track.geoJsonPoints = geoJsonPoints;
                this.props.actions.fetchTrackFinished(this.props.track);
                this.props.actions.hideTreklogLoader();
            });
    }

    getPoints(geoJsonPath) {
        const storage = firebase.storage();
        return storage.ref(geoJsonPath)
            .getDownloadURL()
            .then((url) => {
                const geoJsonReq = new Request(url);
                return fetch(geoJsonReq)
            })
            .then((geoJsonFile) => geoJsonFile.json());
    }

    render() {
        
        return (
            <div className="item" key={this.props.track.url} onClick={this.loadTrack.bind(this)}>
                <div className="content">
                    <div className="header">{this.props.track.name} - <Moment locale="pl" calendar={true}>{this.props.track.date}</Moment></div>
                    <div className="description">{this.props.track.description}</div>
                </div>
            </div>
        );
    }
    
}

function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

export default connect(undefined, mapDispatchToProps)(TrackMenuItem);