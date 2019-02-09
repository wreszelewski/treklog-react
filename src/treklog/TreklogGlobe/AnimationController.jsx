import {Component} from 'react';

import ClockRange from 'cesium/Source/Core/ClockRange';
import JulianDate from 'cesium/Source/Core/JulianDate';
import CMath from 'cesium/Source/Core/Math';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';

import cameraPosition from '../helpers/cameraPosition';

const geoJsonDataSourceIndex = 0;
const czmlDataSourceIndex = 1;
const flyBackTime = 3200;
const backwardDistance = 3000;
const backwardStep = 50;
const msPerSecond = 1000;

export default class AnimationController extends Component {
	constructor(props) {
		super(props);
		this.viewer = this.props.cesiumViewer;
		this.trackUrl = '';
		this.playerState = 'STOP';
		this.playSpeed = 0;
		this.animationProgressUpdate;
		this.animationInitialized = false;
		this.headings = [];
		this.lastHeading = 0;
		this.angle = 0;
		this.angleToApply = 0;
		this.angleApplied = 0;
		this.backward = 5000;
		this.removeEventListener = null;
		this.initialOrientation = null;
		this.initialDestination = null;
		this.secondsDuration = 0;
		this.actions = this.props.callbacks;
		this.geoJsonPath = null;
	}

	componentDidUpdate() {
		this.viewer = this.props.cesiumViewer;
		this.animationProgressUpdate = this.props.animationUpdateCallback;
		if(!this.viewer) return;
		if(this.props.track.url && this.props.track.url !== this.trackUrl) {
			this.trackUrl = this.props.track.url;
			this.reset();
			this.initialize(this.props.track);
		}
		if(this.playerState !== this.props.animation.state) {
			this.playerState = this.props.animation.state;
			if(this.props.animation.state === 'PLAY') {
				this.play();
			} else if (this.props.animation.state === 'PAUSE') {
				this.pause();
			} else if (this.props.animation.state === 'STOP') {
				this.stop();
			} else if (this.props.animation.state === 'RESET') {
				this.reset();
			}
		}

		if(this.viewer.clock.multiplier !== this.props.animation.speed) {
			this.setSpeed(this.props.animation.speed);
		}

		if(this.currentProgress !== this.props.animation.progress) {
			this.currentProgress = this.props.animation.progress;
			this.setTimeFromTimeline(this.props.animation.progress);
		}
	}

	initialize(track) {

		if(track.isLive) {
			this.geoJsonPath = track.geoJsonPath;
		} else {
			this.geoJsonPath = null;
		}
		this.viewer.clock.clockRange = ClockRange.CLAMPED;
		this.viewer.clock.shouldAnimate = false;
		this.viewer.trackedEntity = null;
		this.viewer.clock.currentTime = this.viewer.clock.startTime;
		this.secondsDuration = track.duration / msPerSecond;
		this.initialDestination = cameraPosition.getDestination(track);
		this.initialOrientation = cameraPosition.getOrientation(track);
	}

	reset() {
		this.viewer.clock.shouldAnimate = false;
		if(this.removeEventListener) {
			this.removeEventListener();
			this.removeEventListener = null;
		}
		this.angleToApply = 0;
		this.angleApplied = 0;
		this.lastHeading = 0;
		this.headings = [];
		this.viewer.trackedEntity = null;
		this.animationInitialized = false;
		if(this.animationProgressUpdate) {
			this.animationProgressUpdate(undefined, undefined, 0);
		}
	}

	start(fly = true) {
		if(!this.animationInitialized) {
			return Promise.resolve().then(() => {
				const dataSource = this.viewer.dataSources.get(czmlDataSourceIndex);
				this.lastPosition = dataSource.entities.getById('path').position.getValue(this.viewer.clock.currentTime);
				this.viewer.dataSources.get(geoJsonDataSourceIndex).show = false;
				this.viewer.dataSources.get(czmlDataSourceIndex).show = true;
				const track = this.viewer.dataSources.get(czmlDataSourceIndex);
				this.lastHeading = calculateMovementHeading(track, this.viewer);

				if(fly) {
					this.viewer.flyTo(track.entities.getById('path'));
				}
			}).then(() => {
				return new Promise(resolve => {
					setTimeout(() => {
						this.animationInitialized = true;
						this.viewer.trackedEntity = this.viewer.dataSources.get(czmlDataSourceIndex).entities.getById('path');
						this.backward = 0;
						this.viewer.clock.currentTime = this.viewer.clock.startTime - this.viewer.clock.multiplier;
						resolve();
					}, flyBackTime);
				});
			});
		} else {
			return Promise.resolve();
		}
	}

	play() {
		return this.start().then(() => {
			if(JulianDate.equals(this.viewer.clock.currentTime, this.viewer.clock.stopTime)) {
				this.viewer.clock.currentTime = this.viewer.clock.startTime;
			}
			if(!this.removeEventListener) {
				this.removeEventListener = this.viewer.clock.onTick.addEventListener(this._tickListener.bind(this));
			}
			this.viewer.clock.shouldAnimate = true;
		});
	}

	pause() {
		this.viewer.clock.shouldAnimate = false;
	}

	stop() {
		this.reset();

		this.viewer.dataSources.get(czmlDataSourceIndex).show = false;
		this.viewer.dataSources.get(geoJsonDataSourceIndex).show = true;

		if(this.initialDestination && this.initialOrientation) {
			return this.viewer.camera.flyTo({
				destination: this.initialDestination,
				orientation: this.initialOrientation,
				maximumHeight: 3000
			});
		} else {
			return this.viewer.flyTo(this.viewer.dataSources.get(0));
		}
	}

	setSpeed(value) {
		this.viewer.clock.multiplier = parseInt(value);
	}

	setTimeFromTimeline(progress) {
		this.viewer.clock.currentTime = JulianDate.addSeconds(this.viewer.clock.startTime, progress * this.secondsDuration, new JulianDate());
	}



	_tickListener() {
		if(this.animationInitialized && this.backward < backwardDistance) {
			this.viewer.clock.currentTime = this.viewer.clock.startTime - this.viewer.clock.multiplier;
			this.viewer.camera.moveBackward(backwardStep);
			this.backward += 50;
		} else {
			const track = this.viewer.dataSources.get(czmlDataSourceIndex);
			this._headingRotation(track);
			if(this.props.animation.state && this.animationProgressUpdate) {
				this.animationProgressUpdate(undefined, undefined, JulianDate.secondsDifference(this.viewer.clock.currentTime, this.viewer.clock.startTime) / this.secondsDuration);
			}
		}
	}

	_headingRotation(track) {
		const heading = calculateMovementHeading(track, this.viewer);
		if(heading) {
			this.headings.push(heading);
		}

		if(Math.abs(this.angleApplied) < Math.abs(this.angleToApply)) {
			this.viewer.camera.rotateRight(this.angle);
			this.angleApplied += this.angle;
		} else {
			const headingToApply = median(this.headings);
			this.angleToApply = this.lastHeading - headingToApply;
			if(Math.abs(this.angleToApply) > (CMath.PI + CMath.PI_OVER_TWO)) {
				if(this.angleToApply < 0) {
					this.angleToApply = CMath.TWO_PI + this.angleToApply;
				} else {
					this.angleToApply = this.angleToApply - CMath.TWO_PI;
				}
			}
			const secsPerMin = 60;
			this.angle = this.angleToApply / secsPerMin;
			this.headings = [];
			this.angleApplied = 0;
			this.lastHeading = headingToApply;
		}
	}

	render() { return null; }
}

function median(values){
	values.sort(function(a, b){
		return a-b;
	});

	if(values.length === 0) return 0;
	const two = 2;
	const twoFloat = 2.0;
	const one = 1;
	const half = Math.floor(values.length / two);

	if (values.length % two)
		return values[half];
	else
		return (values[half - one] + values[half]) / twoFloat;
}

function calculateMovementHeading(track, viewer) {
	const clockStepMultiplier = 300;
	const currentPosition = track.entities.getById('path').position.getValue(viewer.clock.currentTime);
	const nextPosition = track.entities.getById('path').position.getValue(viewer.clock.currentTime + viewer.clock.clockStep*clockStepMultiplier);
	if(!Cartesian3.equals(currentPosition, nextPosition)) {
		const vector = Cartesian3.subtract(currentPosition, nextPosition, new Cartesian3());
		const headingRaw = Math.atan2(vector.y, vector.x) - CMath.PI_OVER_TWO;
		return CMath.TWO_PI - CMath.zeroToTwoPi(headingRaw);
	}
	return null;
}