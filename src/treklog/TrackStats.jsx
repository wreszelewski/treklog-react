import React, {Component} from 'react';

import { formatSeconds } from './helpers/time';
import TrackDescriptionLabel from './TrackDescriptionLabel';

import './styles/TrackDescription.css';

const metersInKm = 1000;
const msInSecond = 1000;

export default class TrackStats extends Component {

	getDistance(distance) {
		if(distance) {
			return (this.props.track.distance / metersInKm);
		}
	}

	render() {
		return (
			<div className="trackStats">
				<TrackDescriptionLabel
					icon="wait"
					value={formatSeconds(this.props.track.duration / msInSecond)}
					unit=""
					description="Czas trwania"
				/>
				<TrackDescriptionLabel
					icon="resize horizontal"
					value={this.getDistance(this.props.track.distance)}
					unit="km"
					description="Dystans"
				/>
				<TrackDescriptionLabel
					icon="long arrow up"
					value={this.props.track.ascent}
					unit="m"
					description="Suma podejść"
				/>
				<TrackDescriptionLabel
					icon="long arrow down"
					value={this.props.track.descent}
					unit="m"
					description="Suma zejść"
				/>
				<TrackDescriptionLabel
					icon="angle double up"
					value={this.props.track.maxAltitude}
					unit="m"
					description="Najwyższy punkt"
				/>
				<TrackDescriptionLabel
					icon="angle double down"
					value={this.props.track.minAltitude}
					unit="m"
					description="Najniższy punkt"
				/>
			</div>
		);
	}
}