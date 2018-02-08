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
        ReactDOM.findDOMNode(this.refs['animationProgress']).children[0].children[0].innerHTML = 'A';
    }

    componentDidUpdate() {
        ReactDOM.findDOMNode(this.refs['animationProgress']).children[0].children[0].innerHTML = 'A';
    }

    render() {
        console.log(this.state);
        if(this.state.showMouseLabel) {
            return (    
                <Progress ref="animationProgress" total={this.props.track.duration / 1000} value={300} active={false} precision={10} autoSuccess={false} className="white" onMouseMove={e => this.showMouseLabel(e)} onMouseLeave={e => this.hideMouseLabel(e)} progress>
                        <div id="mouseLabel" style={{left: this.state.leftPosition}}>{this.state.labelText}</div>
                </Progress>
            );
        } else {
            return (    
                <Progress ref="animationProgress" percent={35} active={false} precision={10} autoSuccess={false} className="white" onMouseMove={e => this.showMouseLabel(e)} onMouseLeave={e => this.hideMouseLabel(e)} progress/>
            );
        }
    }
}