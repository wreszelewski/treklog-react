import React, {Component} from 'react';
import { Segment, Menu, Icon, Dropdown } from 'semantic-ui-react';
import AnimationProgress from './AnimationProgress';
import './styles/AnimationMenu.css';

export default class AnimationMenu extends Component {

	constructor() {
		super();
		this.state = {
			speed: 1000,
			showSettings: false
		};
	}

	saveSettings() {
		this.setState(Object.assign({}, this.state, {showSettings: false}));
		this.props.actions.animationSetSpeed(this.state.speed);
	}

	componentDidMount() {
		this.props.actions.animationSetSpeed(this.state.speed);
	}

	render() {
		return (

			<Segment id="animationMenu" inverted>
				<div className="movieMenu">
					<Menu size="mini" inverted icon borderless className="menuButtons">
						<Menu.Item name='play' onClick={this.props.actions.animationPlay}>
							<Icon name='play' />
						</Menu.Item>
						<Menu.Item name='pause' onClick={this.props.actions.animationPause}>
							<Icon name='pause' />
						</Menu.Item>
						<Menu.Item name='stop' onClick={this.props.actions.animationStop}>
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
					<AnimationProgress track={this.props.track} animation={this.props.animation} actions={this.props.actions}/>
				</div>
			</Segment>

		);
	}
}