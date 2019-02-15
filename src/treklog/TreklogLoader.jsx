import React, {Component} from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

import './styles/TreklogLoader.css';

export default class TreklogLoader extends Component {

	render() {
		return (

			<Dimmer className='treklogLoader' active={this.props.active}>
				<Loader size='massive'>Ładowanie</Loader>
			</Dimmer>

		);
	}
}