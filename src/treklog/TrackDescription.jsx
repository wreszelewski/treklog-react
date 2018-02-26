import React, {Component} from 'react'
import { Icon, Label, Popup } from 'semantic-ui-react'
import './styles/TrackDescription.css'
import { formatSeconds } from './helpers/time'
import TrackDescriptionLabel from './TrackDescriptionLabel'

export default class TrackDescription extends Component {

  getDistance(distance) {
      if(distance) {
          return (this.props.track.distance / 1000);
      }
  }

  render() {
        return (    
        
            <div id="trackDescription" className="trackDescription">
                <h1 id="trackName">{this.props.track.name}</h1><h2 id="trackDesc">{this.props.track.description}</h2>
                <div className="trackStats">
                    <TrackDescriptionLabel
                        icon="wait"
                        value={formatSeconds(this.props.track.duration / 1000)}
                        unit=""
                        description="Czas trwania"
                    />
                    <TrackDescriptionLabel
                        icon="resize horizontal"
                        value={this.getDistance(this.props.track.distance)}
                        unit="km"
                        description="Dystans"
                    />
                    <TrackDescriptionLabel
                        icon="long arrow up"
                        value={this.props.track.ascent}
                        unit="m"
                        description="Suma podejść"
                    />
                    <TrackDescriptionLabel
                        icon="long arrow down"
                        value={this.props.track.descent}
                        unit="m"
                        description="Suma zejść"
                    />
                    <TrackDescriptionLabel
                        icon="angle double up"
                        value={this.props.track.maxAltitude}
                        unit="m"
                        description="Najwyższy punkt"
                    />
                    <TrackDescriptionLabel
                        icon="angle double down"
                        value={this.props.track.minAltitude}
                        unit="m"
                        description="Najniższy punkt"
                    />
                </div>
            </div>
        )
  }
}