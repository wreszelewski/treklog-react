
import ClockRange from 'cesium/Source/Core/ClockRange';
import JulianDate from 'cesium/Source/Core/JulianDate';
import CMath from 'cesium/Source/Core/Math';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';

import cameraPosition from './cameraPosition';
import { getPoints } from './trackLoader';

const geoJsonDataSourceIndex = 0;
const czmlDataSourceIndex = 1;
const flyBackTime = 3200;
const backwardDistance = 3000;
const backwardStep = 50;

export default class AnimationController {
	constructor(viewer, actions) {
		this.viewer = viewer;
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
		this.actions = actions;
		this.geoJsonPath = null;
	}

	initialize(track) {

		if(track.isLive) {
			this.geoJsonPath = track.geoJsonPath;
		} else {
			this.geoJsonPath = null;
		}
		this.viewer.clock.clockRange = ClockRange.CLAMPED;
		this.viewer.clock.shouldAnimate = false;
		this.viewer.clock.currentTime = this.viewer.clock.startTime;
		this.secondsDuration = JulianDate.secondsDifference(this.viewer.clock.stopTime, this.viewer.clock.startTime);
		const dataSource = this.viewer.dataSources.get(czmlDataSourceIndex);
		this.lastPosition = dataSource.entities.getById('path').position.getValue(this.viewer.clock.currentTime);
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
		this.animationInitialized = false;
	}

	start(fly = true) {
		if(!this.animationInitialized) {
			return Promise.resolve().then(() => {
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
		if(this.geoJsonPath) {
			getPoints(this.geoJsonPath).then(trackPoints => {
				this.viewer.dataSources.get(0).load(trackPoints, {
					stroke: Color.fromCssColorString('#f4d797'),
					fill: Color.fromCssColorString('#f4d797'),
					strokeWidth: 20,
					clampToGround: true
				});
			}).then(() => {
				this.viewer.dataSources.get(czmlDataSourceIndex).show = false;
				this.viewer.dataSources.get(geoJsonDataSourceIndex).show = true;
			});
		} else {
			this.viewer.dataSources.get(czmlDataSourceIndex).show = false;
			this.viewer.dataSources.get(geoJsonDataSourceIndex).show = true;
		}
		this.viewer.trackedEntity = null;
		this.viewer.clock.currentTime = this.viewer.clock.startTime;
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
		this.viewer.clock.multiplier = value;
	}

	setTimeFromTimeline() {
		this.start();
	}



	_tickListener() {
		if(this.animationInitialized && this.backward < backwardDistance) {
			this.viewer.clock.currentTime = this.viewer.clock.startTime - this.viewer.clock.multiplier;
			this.viewer.camera.moveBackward(backwardStep);
			this.backward += 50;
		} else {
			const track = this.viewer.dataSources.get(czmlDataSourceIndex);
			this._headingRotation(track);
			const currentTime = this.geoJsonPath ? this.viewer.clock.currentTime : null;
			this.actions.updateAnimationProgress(JulianDate.secondsDifference(this.viewer.clock.currentTime, this.viewer.clock.startTime), currentTime);
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
}

function median(values){
	values.sort(function(a, b){
		return a-b;
	});

	if(values.length === 0) return 0;
	const two = 2;
	const twoFloat = 2.0;
	const one = 1;
	var half = Math.floor(values.length / two);

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