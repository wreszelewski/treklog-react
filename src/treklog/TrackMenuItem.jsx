import React, {Component} from "react";
import firebase from "firebase";
import config from "../config";
import Moment from 'react-moment';
import 'moment/locale/pl';
import * as treklogActions from "./state/actions";
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import { Link } from 'react-router-dom'
import { getTrackLoader } from './helpers/trackLoader'

class TrackMenuItem extends Component {
    
    render() {
        
        return (
            <Link key={this.props.track.url} to={this.props.track.url}>
                <div className="item">
                    <div className="content">
                        <div className="header">{this.props.track.name} - <Moment locale="pl" calendar={true}>{this.props.track.date}</Moment></div>
                        <div className="description">{this.props.track.description}</div>
                    </div>
                </div>
            </Link>
        );
    }
    
}

function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

function mapStateToProps(state) {  
    return {tracks: state.tracks};
}

export default connect(mapStateToProps, mapDispatchToProps)(TrackMenuItem);