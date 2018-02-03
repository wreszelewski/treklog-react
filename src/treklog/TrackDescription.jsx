import React, {Component} from 'react'
import { Icon, Label, Popup } from 'semantic-ui-react'
import './styles/TrackDescription.css'
import { formatSeconds } from './helpers/time'

export default class TrackDescription extends Component {

  render() {
        return (    
        
        <div id="trackDescription" className="trackDescription">
            <h1 id="trackName">{this.props.track.name}</h1><h2 id="trackDesc">{this.props.track.description}</h2>
            <div className="trackStats">
                <Popup
                    trigger={
                        <Label className="singleStat">
                            <Icon name="wait" /><span>{formatSeconds(this.props.track.duration / 1000)}</span>
                        </Label>
                    }
                    content="Czas trwania"
                    position="top center"
                />
                <Popup
                    trigger={
                        <Label className="singleStat">
                            <Icon name="resize horizontal" /><span>{this.props.track.distance / 1000}km</span>
                        </Label>
                    }
                    content="Dystans"
                    position="top center"
                />
                <Popup
                    trigger={
                        <Label className="heightStat">
                            <Icon name="long arrow up" /><span>{this.props.track.ascent}m</span>
                        </Label>
                    }
                    content="Suma podejść"
                    position="top center"
                />
                <Popup
                    trigger={
                        <Label className="heightStat">
                            <Icon name="long arrow down" /><span>{this.props.track.descent}m</span>
                        </Label>
                    }
                    content="Suma zejść"
                    position="top center"
                />
                <Popup
                    trigger={
                        <Label className="heightStat">
                            <Icon name="angle double up" /><span>{this.props.track.maxAltitude}m</span>
                        </Label>
                    }
                    content="Najwyższy punkt"
                    position="top center"
                />
                <Popup
                    trigger={
                        <Label className="heightStat">
                            <Icon name="angle double down" /><span>{this.props.track.minAltitude}m</span>
                        </Label>
                    }
                    content="Najniższy punkt"
                    position="top center"
                />
            </div>
        </div>
    
    );
  }
}