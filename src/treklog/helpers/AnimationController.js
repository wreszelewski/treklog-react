
import cameraPosition from './cameraPosition';
import ClockRange from "cesium/Source/Core/ClockRange"
import JulianDate from "cesium/Source/Core/JulianDate"
import CMath from "cesium/Source/Core/Math"
import Cartesian3 from "cesium/Source/Core/Cartesian3"
import { getPoints } from './trackLoader';
import Color from "cesium/Source/Core/Color";


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
        this.geoJsonPath = null
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
        const dataSource = this.viewer.dataSources.get(1)
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
                this.viewer.dataSources.get(0).show = false;
                this.viewer.dataSources.get(1).show = true;
                const track = this.viewer.dataSources.get(1);
                this.lastHeading = calculateMovementHeading(track, this.viewer);            
                
                if(fly) {
                    this.viewer.flyTo(track.entities.getById('path'));
                }
            }).then(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        this.animationInitialized = true;
                        this.viewer.trackedEntity = this.viewer.dataSources.get(1).entities.getById('path');
                        this.backward = 0;
                        this.viewer.clock.currentTime = this.viewer.clock.startTime - this.viewer.clock.multiplier;
                        resolve();
                    }, 3200)
                })
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
                    stroke: new Color(0.98, 0.75, 0.18),
                    fill: new Color(0.98, 0.75, 0.18),
                    strokeWidth: 20,
                    clampToGround: true
                });
            }).then(() => {
                this.viewer.dataSources.get(1).show = false;
                this.viewer.dataSources.get(0).show = true
            });
        } else {
            this.viewer.dataSources.get(1).show = false;
            this.viewer.dataSources.get(0).show = true;
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
        if(this.animationInitialized && this.backward < 3000) {
            this.viewer.clock.currentTime = this.viewer.clock.startTime - this.viewer.clock.multiplier;
            this.viewer.camera.moveBackward(50);
            this.backward += 50;
        } else {
            const track = this.viewer.dataSources.get(1);
            this._headingRotation(track);
            const currentTime = this.geoJsonPath ? this.viewer.clock.currentTime : null
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
            this.angle = this.angleToApply / 60;
            this.headings = [];
            this.angleApplied = 0;
            this.lastHeading = headingToApply;
        }
    }
}

function median(values){
    values.sort(function(a,b){
    return a-b;
  });

  if(values.length === 0) return 0

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}

function calculateMovementHeading(track, viewer) {
    const currentPosition = track.entities.getById('path').position.getValue(viewer.clock.currentTime);
    const nextPosition = track.entities.getById('path').position.getValue(viewer.clock.currentTime + viewer.clock.clockStep*300);
    if(!Cartesian3.equals(currentPosition, nextPosition)) {
        const vector = Cartesian3.subtract(currentPosition, nextPosition, new Cartesian3());
        const headingRaw = Math.atan2(vector.y, vector.x) - CMath.PI_OVER_TWO;
        return CMath.TWO_PI - CMath.zeroToTwoPi(headingRaw);
    }
    return null;
}