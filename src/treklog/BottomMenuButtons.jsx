import React, {Component} from 'react'
import {Button} from 'semantic-ui-react';
import TrackCalculator from './helpers/trackCalculator'

import './styles/BottomMenu.css';

import firebase from 'firebase';

export default class BottomMenuButtons extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false
        }
        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                this.setState({
                    isLoggedIn: true
                })
            } else {
                this.setState({
                    isLoggedIn: false
                })
            }
        })
    }

    recalculateTrack() {
        const trackCalc = new TrackCalculator(this.props.track.originalGeoJsonPoints, this.props.track.czmlAltitude);
        const altitudeStats = trackCalc.altitudeStats
        let updates = {}
        updates['duration'] = trackCalc.duration;
        updates['distance'] = trackCalc.distance;
        updates['ascent'] = Math.round(altitudeStats.ascent);
        updates['descent'] = Math.round(altitudeStats.descent);
        updates['maxAltitude'] = Math.round(altitudeStats.maxAltitude);
        updates['minAltitude'] = Math.round(altitudeStats.minAltitude);
        return firebase.database().ref('tracks' + this.props.track.url).update(updates);
    }


    setInitialPosition() {
        const initialPosition = {
            position: {
                x: this.props.cesiumViewer.camera.position.x,
                y: this.props.cesiumViewer.camera.position.y,
                z: this.props.cesiumViewer.camera.position.z
            },
            heading: this.props.cesiumViewer.camera.heading,
            pitch: this.props.cesiumViewer.camera.pitch,
            roll: this.props.cesiumViewer.camera.roll
        }
        let updates = {};
        updates['initialPosition'] = initialPosition;
        firebase.database().ref('tracks' + this.props.track.url).update(updates);
    }

    setSocialImage() {
        const socialFilePath = this.props.track.url;
        this.props.cesiumViewer.render();
        const socialImageRaw = this.props.cesiumViewer.canvas.toDataURL();
    
    
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 472;
    
        var ctx = canvas.getContext('2d');
        const credits = Array.from(document.getElementsByClassName('cesium-credit-text')).reduce((acc, val) => {
            return acc + (val.innerHTML + '. ');
        }, '');
    
        
        const creditsRows = this._splitCredits(credits);
        const svgRowsArr = creditsRows.map(row => '<tspan x="0" dy="1.0em">' + row + '</tspan>'); 
        var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + this.props.cesiumViewer.canvas.width + '" height="200">' +
        '<style><![CDATA[' +
        'tspan{font-size:8px;fill:white;font-family:sans-serif;}' +
        ']]></style>' +
                   '<text x="0" y="0">' +
                   svgRowsArr.join('') +
                   '</text>' +
                   '</svg>';
        var img = new Image();
        var img2 = new Image();
        var svg = "data:image/svg+xml," + data
        
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 900, 472);
          img2.onload = () => {
              ctx.drawImage(img2, 0, canvas.height-(creditsRows.length * 10));  
              //DOMURL.revokeObjectURL(url);
              return this._storeSocialImageAndMeta(socialFilePath, canvas.toDataURL());
          }
          img2.src = svg;
        }
        
        img.src = socialImageRaw;
    
        
    }

    _splitCredits(credits) {
        const splittedCredits = credits.split(' ');
        const limit = 250;
        let letters = 0;
        let rows = [];
        let row = [];
        splittedCredits.forEach(function(word) {
            if(letters + word.length < limit) {
                row.push(word);
                letters += word.length + 1;
            } else {
                rows.push(row);
                row = [word];
                letters = word.length;
            }
        });
        rows.push(row);
        const strRows = rows.map(row => row.join(' '));
        return strRows
    } 

    _storeSocialImageAndMeta(path, data) {
        const imgPath = '/socialImages' + path + '.jpg';
        const metadata = {
            contentType: 'image/jpeg',
        };      
        firebase.storage().ref().child(imgPath).putString(data, 'data_url', metadata).then((image) => {
            let updates = {};
            updates['socialImage'] = image.downloadURL;
            return firebase.database().ref('tracks' + path).update(updates);
        });
    }

    render() {
        if(this.state.isLoggedIn) {
                return (    
                    <div className="buttons">
                    <Button inverted size="small" style={{marginRight: "10px", marginLeft: "10px", marginTop: "5px"}} onClick={this.setSocialImage.bind(this)}>Ustaw obrazek</Button>
                    <Button inverted size="small" style={{marginRight: "10px", marginLeft: "10px", marginTop: "5px"}} onClick={this.setInitialPosition.bind(this)}>Ustaw pozycję</Button>
                    <Button inverted size="small" style={{marginRight: "10px", marginLeft: "10px", marginTop: "5px"}} onClick={this.recalculateTrack.bind(this)}>Przelicz trasę</Button>
                    <Button inverted size="small" style={{marginRight: "10px", marginLeft: "10px", marginTop: "5px"}}>Zakończ live</Button>
                    </div>
                )
            } else {
                return null
            }
  }
}