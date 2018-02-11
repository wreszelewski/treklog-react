import React, {Component} from "react";
import firebase from "firebase";
import config from "../config";
import moment from "moment";
import './styles/TrackMenu.css';
import {Modal,Button} from 'semantic-ui-react';
import Moment from 'react-moment';
import 'moment/locale/pl';
import TrackMenuItem from './TrackMenuItem';
import { getTracks } from './helpers/trackLoader';

export default class TrackMenu extends Component {

    state = {
        tracks: []
    }

    
    
    handleClose = this.props.actions.hideTrackMenu;

    componentDidMount() {
        getTracks().then((tracks) => {
            this.setState(Object.assign({}, this.state, { tracks }));
            this.props.actions.fetchTracksFinished(tracks);
            this.props.actions.hideTreklogLoader();
        });
    }

    render() {

        return (
            <Modal className="trackMenu" basic size="small" open={this.props.open} onClose={this.handleClose}>
                <div className="content">
                    <h1>Treklog</h1>
                    <div id="trackListContainer">
                        <div id="trackList" className="ui link divided items">
                        {this.state.tracks.map(track =>
                            <TrackMenuItem key={track.url} track={track} />
                        )}
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }

}