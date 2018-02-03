import React, {Component} from "react";
import firebase from "firebase";
import config from "../config";
import moment from "moment";
import './styles/TrackMenu.css';
import {Modal,Button} from 'semantic-ui-react';
import Moment from 'react-moment';
import 'moment/locale/pl';
import TrackMenuItem from './TrackMenuItem';

export default class TrackMenu extends Component {

    state = {
        tracks: []
    }

    getDateComparator(tracks) {
        return function dateComparator(a, b) {
            return moment(tracks[b].date) - moment(tracks[a].date);
        }
    }

    getTracks() {
        return firebase.database().ref('/tracks').once('value')
            .then(tracksInYearRaw => tracksInYearRaw.val())
            .then(tracksPerYear => {
                let trackList = [];
                const years = Object.getOwnPropertyNames(tracksPerYear)
                    .sort()
                    .reverse();
            
                years.forEach((year) => {
                    const trackCodesInYear = Object.getOwnPropertyNames(tracksPerYear[year])
                        .sort(this.getDateComparator(tracksPerYear[year]));
            
                    trackCodesInYear.forEach((trackCode) => {
                        trackList.push(tracksPerYear[year][trackCode]);
                    });
                })
            
                return trackList;
            });
    }
    
    handleClose = this.props.actions.hideTrackMenu;

    componentDidMount() {
        this.getTracks().then((tracks) => {
            console.log(tracks);
            this.setState(Object.assign({}, this.state, { tracks }));
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