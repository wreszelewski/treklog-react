import React, {Component} from 'react';
import {Button} from 'semantic-ui-react';

import AnimationMenuContainer from './AnimationMenuContainer';
import TrackDescriptionContainer from './TrackDescriptionContainer';
import BottomMenuButtons from './BottomMenuButtons';

import './styles/BottomMenu.css';

export default class BottomMenu extends Component {

	constructor() {
		super();
		this.state = {
			showDescription: true
		};
	}

	toggleDescription() {
		this.setState({showDescription: !this.state.showDescription});
	}

	render() {
		if(this.props.active) {
			if(this.state.showDescription) {
				return (
					<div className="bottomMenu">
						<AnimationMenuContainer />
						<TrackDescriptionContainer />
						<div className="bottomMenuButtons">
							<BottomMenuButtons track = {this.props.track} cesiumViewer={this.props.cesiumViewer} placemarks={this.props.placemarks} actions={this.props.treklogGlobeActions}/>
							<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.toggleDescription.bind(this)}>Zwiń opis</Button>
						</div>
					</div>

				);
			} else {
				return (
					<div className="bottomMenu">
						<AnimationMenuContainer />
						<div className="bottomMenuButtons">
							<BottomMenuButtons track = {this.props.track} cesiumViewer={this.props.cesiumViewer} placemarks={this.props.placemarks} actions={this.props.treklogGlobeActions}/>
							<Button inverted size="small" style={{marginRight: '10px', marginLeft: '10px', marginTop: '5px'}} onClick={this.toggleDescription.bind(this)}>Pokaż opis</Button>
						</div>
					</div>

				);
			}
		} else {
			return null;
		}
	}
}