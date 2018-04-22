import React, {Component} from 'react'
import './styles/TrackDescription.css'
import { Icon, Label, Popup } from 'semantic-ui-react'
import TrackStats from './TrackStats'
import firebase from 'firebase';

export default class TrackDescription extends Component {

  constructor(props) {
      super(props);
      this.state = {
          isLoggedIn: false
        }
      this.saveTrackName = this.saveTrackName.bind(this);
      this.saveDescription = this.saveDescription.bind(this);
      firebase.auth().onAuthStateChanged(user => {
        if(user) {
            this.setState({isLoggedIn: true});
        } else {
            this.setState({isLoggedIn: false});
        }
      })
  }

  getDistance(distance) {
      if(distance) {
          return (this.props.track.distance / 1000);
      }
  }

  saveTrackName(ev) {
      const oldUrl = this.props.track.url;
      const newName = ev.target.value;
      const newUrl = (['/' + oldUrl.split('/')[1], newName]).join('/').toLowerCase();
      let updates = this.props.track;
      updates['name'] = newName;
      updates['url'] = newUrl;
      return Promise.all([firebase.database().ref('tracks' + newUrl).update(updates), firebase.database().ref('tracks' + oldUrl).set(null)]);
      
  }

  saveDescription(ev) {
    let updates = {}
    updates['description'] = ev.target.value;
    return firebase.database().ref('tracks' + this.props.track.url).update(updates);
}

  render() {
        if(this.state.isLoggedIn) {
            return (    
                
                    <div id="trackDescription" className="trackDescription">
                        <input type="text" id="trackName" defaultValue={this.props.track.name} onBlur={this.saveTrackName}/>
                        <input type="text" id="trackDesc" defaultValue={this.props.track.description} onBlur={this.saveDescription} />
                        <TrackStats track={this.props.track} />
                    </div>
                )
        } else {
            return (    
            
                <div id="trackDescription" className="trackDescription">
                    <h1 id="trackName">{this.props.track.name}</h1><h2 id="trackDesc">{this.props.track.description}</h2>
                    <TrackStats track={this.props.track} />
                </div>
            )
        }
  }
}