import React, {Component} from 'react';
import { Progress } from 'semantic-ui-react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import {formatSeconds} from './helpers/time';

const msPerSecond = 1000;

export default class AnimationProgress extends Component {

	constructor() {
		super();
		this.state = {
			showMouseLabel: false,
			labelText: '',
			leftPosition: 0
		};
	}

	showMouseLabel(e) {
		const percent = this.getAnimationProgress(e);
		const secondsSinceStart = percent * (this.props.track.duration / msPerSecond);
		const newLabel = formatSeconds(secondsSinceStart);
		const lengthScale = 4;
		const lengthOffset = 150;
		const newPosition = e.pageX - (newLabel.length * lengthScale) - lengthOffset;
		this.setState({showMouseLabel: true, leftPosition: newPosition, labelText: newLabel});
	}

	hideMouseLabel() {
		this.setState({showMouseLabel: false});
	}

	getAnimationProgress(e) {
		const boundingRect = ReactDOM.findDOMNode(this.refs['animationProgress']).getBoundingClientRect();
		const width = boundingRect.width;
		const position = e.pageX - boundingRect.left;
		const percent = position / width;
		return percent;
	}

	setTimeFromAnimationProgress(e) {
		this.props.actions.updateAnimationProgress(this.getAnimationProgress(e));
	}

	componentDidMount() {
		ReactDOM.findDOMNode(this.refs['animationProgress']).children[0].children[0].innerHTML = formatSeconds(this.props.progress * this.props.track.duration / msPerSecond) || '';
	}

	componentDidUpdate() {
		ReactDOM.findDOMNode(this.refs['animationProgress']).children[0].children[0].innerHTML = formatSeconds(this.props.progress * this.props.track.duration / msPerSecond) || '';
	}

	render() {
		const percent = 100;
		if(this.props.track.duration) {
			if(this.state.showMouseLabel) {
				return (
					<Progress ref="animationProgress" percent={this.props.progress*percent} active={false} precision={10} autoSuccess={false} className="white" onClick={e => this.setTimeFromAnimationProgress(e)} onMouseMove={e => this.showMouseLabel(e)} onMouseLeave={e => this.hideMouseLabel(e)} progress>
						<div id="mouseLabel" style={{left: this.state.leftPosition}}>{this.state.labelText}</div>
					</Progress>
				);
			} else {
				return (
					<Progress ref="animationProgress" percent={this.props.progress*percent} active={false} precision={10} autoSuccess={false} className="white" onClick={e => this.setTimeFromAnimationProgress(e)} onMouseMove={e => this.showMouseLabel(e)} onMouseLeave={e => this.hideMouseLabel(e)} progress />
				);
			}
		} else {
			return (
				<Progress ref="animationProgress" total={100} value={100} active={false} precision={10} autoSuccess={false} className="white" progress />
			);
		}
	}
}