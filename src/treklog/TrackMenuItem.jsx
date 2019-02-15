import React, {Component} from 'react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import { Link } from 'react-router-dom';
import 'moment/locale/pl';

import * as treklogActions from './state/actions';

class TrackMenuItem extends Component {

	render() {

		return (
			<Link className="item" key={this.props.track.url} to={this.props.track.url}>
				<div>
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