import React, {Component} from 'react';
import { Segment, Menu, Icon, Dropdown } from 'semantic-ui-react';
import AnimationProgress from './AnimationProgress';
import './styles/AnimationMenu.css';

export default class AnimationMenu extends Component {

	constructor() {
		super();
		this.state = {
			speed: 1000,
			showSettings: false,
			state: 'STOP'
		};
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);
		this.stop = this.stop.bind(this);
	}

	saveSettings() {
		this.setState({showSettings: false});
		this.props.treklogActions.animationUpdate(this.state.state, this.state.speed, this.props.animationProgress);
	}

	play() {
		this.setState({state: 'PLAY'});
		this.props.treklogActions.animationUpdate('PLAY', this.state.speed, this.props.animationProgress);
	}

	pause() {
		this.setState({state: 'PAUSE'});
		this.props.treklogActions.animationUpdate('PAUSE', this.state.speed, this.props.animationProgress);
	}

	stop() {
		this.setState({state: 'STOP'});
		this.props.treklogActions.animationUpdate('STOP', this.state.speed, this.props.animationProgress);
	}

	render() {
		return (

			<Segment id="animationMenu" inverted>
				<div className="movieMenu">
					<Menu size="mini" inverted icon borderless className="menuButtons">
						<Menu.Item name='play' onClick={this.play}>
							<Icon name='play' />
						</Menu.Item>
						<Menu.Item name='pause' onClick={this.pause}>
							<Icon name='pause' />
						</Menu.Item>
						<Menu.Item name='stop' onClick={this.stop}>
							<Icon name='stop' />
						</Menu.Item>
						<Dropdown icon="setting" pointing className="bottom left icon item" open={this.state.showSettings} onClick={() => this.setState(Object.assign({}, this.state, {showSettings: true}))}>
							<Dropdown.Menu className="ui movieOptions">
								<Dropdown.Item className="ui inverted form" onClick={() => true}>
									<div className="inline field">
										<label>Szybkość</label>
										<input id="speed" className="number" type="number" defaultValue={this.state.speed} step="100" onChange={e => {this.setState(Object.assign({}, this.state, {speed: e.target.value }));}}/>
										<label className="unit">[x]</label>
									</div>
									<div className="field">
										<button id="saveSettings" className="ui mini inverted button" onClick={e => {this.saveSettings(); e.stopPropagation();}}>Zapisz</button>
									</div>
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</Menu>
					<AnimationProgress track={this.props.track} progress={this.props.animationProgress} actions={this.props.actions}/>
				</div>
			</Segment>

		);
	}
}