import React, {Component} from 'react';
import {Redirect} from 'react-router';
import {Modal, Button} from 'semantic-ui-react';

import TrackCalculator from './helpers/trackCalculator';

import './styles/TrackMenu.css';

export default class AddTrack extends Component {

	constructor(props) {
		super(props);
		this.handleClose = this.props.actions.hideAddTrack;
		this.showLoader = this.props.actions.showTreklogLoader;
		this.hideLoader = this.props.actions.hideTreklogLoader;

		this.state = {
			trackName: '',
			trackDescription: '',
			redirect: false
		};
	}

	loadFile(ev) {
		const selectedFile = ev.target.files[0];
		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result;
			const track = TrackCalculator.fromGpx(text);
			if(this.state.trackName === '') {
				this.setState({trackName: track.originalName});
			}
		};

		reader.readAsText(selectedFile, 'utf-8');
	}

	saveTrack() {
		this.showLoader();
		const selectedFile = document.getElementById('input').files[0];
		const reader = new FileReader();

		reader.onload = () => {
			const text = reader.result;
			const track = TrackCalculator.fromGpx(text);
			track.setName(this.state.trackName);
			track.setDescription(this.state.trackDescription);
			track.store()
				.then(() => {
					this.setState({trackUrl: track.url, redirect: true});
				});
		};

		reader.readAsText(selectedFile, 'utf-8');
	}

	updateTrackName(ev) {
		this.setState({trackName: ev.target.value});
	}

	updateTrackDescription(ev) {
		this.setState({trackDescription: ev.target.value});
	}

	render() {
		if(this.state.redirect) {
			return (
				<Redirect to={this.state.trackUrl} push={true}/>
			);
		}
		return (
			<Modal basic size="small" open={this.props.open} onClose={this.handleClose}>
				<div className="trackMenu content">
					<h1>Dodaj trasę</h1>
					<div className="ui inverted form">
						<div className="field">
							<label>Pliki gpx</label>
							<input type="file" id="input" onChange={this.loadFile.bind(this)}/>
						</div>
						<div className="field">
							<label>Nazwa</label>
							<input type="text" id="trackName" value={this.state.trackName} onChange={this.updateTrackName.bind(this)}/>
						</div>
						<div className="field">
							<label>Opis</label>
							<input type="text" id="trackDescription" value={this.state.trackDescription} onChange={this.updateTrackDescription.bind(this)}/>
						</div>
						<Button inverted onClick={this.saveTrack.bind(this)}>Dodaj</Button>
					</div>
				</div>
			</Modal>
		);
	}

}