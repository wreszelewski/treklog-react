import React, {Component} from 'react'
import { Progress } from 'semantic-ui-react'
import {formatSeconds} from './helpers/time';
import ReactDOM from 'react-dom';
import JulianDate from "cesium/Source/Core/JulianDate"


export default class AnimationProgress extends Component {

    handleItemClick() {
        return;
    }

    state = {
        showMouseLabel: false,
        labelText: '',
        leftPosition: 0
    }

    showMouseLabel(e) {
        const secondsSinceStart = this.getTimeFromAnimationProgress(e);
        const newLabel = formatSeconds(secondsSinceStart);
        const newPosition = e.pageX - (newLabel.length * 4) - 150;
        this.setState({showMouseLabel: true, leftPosition: newPosition, labelText: newLabel});
    }

    hideMouseLabel() {
        console.log("HIDE");
        this.setState({showMouseLabel: false});
    }

    getTimeFromAnimationProgress(e) {
        const boundingRect = ReactDOM.findDOMNode(this.refs['animationProgress']).getBoundingClientRect()
        const width = boundingRect.width;
        const position = e.pageX - boundingRect.left;
        const percent = position / width;
        const secondsSinceStart = percent * (this.props.track.duration / 1000);
        return secondsSinceStart
    }

    componentDidMount() {
        ReactDOM.findDOMNode(this.refs['animationProgress']).children[0].children[0].innerHTML = formatSeconds(this.props.animation.currentTime);
    }

    componentDidUpdate() {
        console.log(this.props.animation);
        ReactDOM.findDOMNode(this.refs['animationProgress']).children[0].children[0].innerHTML = formatSeconds(this.props.animation.currentTime);
    }

    render() {
        console.log(this.state);
        if(this.state.showMouseLabel) {
            return (    
                <Progress ref="animationProgress" total={this.props.track.duration / 1000} value={this.props.animation.currentTime} active={false} precision={10} autoSuccess={false} className="white" onMouseMove={e => this.showMouseLabel(e)} onMouseLeave={e => this.hideMouseLabel(e)} progress>
                        <div id="mouseLabel" style={{left: this.state.leftPosition}}>{this.state.labelText}</div>
                </Progress>
            );
        } else {
            return (    
                <Progress ref="animationProgress" total={this.props.track.duration / 1000} value={this.props.animation.currentTime} active={false} precision={10} autoSuccess={false} className="white" onMouseMove={e => this.showMouseLabel(e)} onMouseLeave={e => this.hideMouseLabel(e)} progress />
            );
        }
    }
}