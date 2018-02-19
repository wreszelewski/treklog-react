import React, {Component} from "react";

import Viewer from "cesium/Source/Widgets/Viewer/Viewer";
import ProviderViewModel from "cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel";
import ArcGisMapServerImageryProvider from "cesium/Source/Scene/ArcGisMapServerImageryProvider";
import MapboxImageryProvider from "cesium/Source/Scene/MapboxImageryProvider";
import CesiumTerrainProvider from "cesium/Source/Core/CesiumTerrainProvider";
import Cartographic from "cesium/Source/Core/Cartographic";
import Cartesian3 from "cesium/Source/Core/Cartesian3";
import HeadingPitchRange from "cesium/Source/Core/HeadingPitchRange";
import Color from "cesium/Source/Core/Color";
import sampleTerrainMostDetailed from "cesium/Source/Core/sampleTerrainMostDetailed";
import GeoJsonDataSource from "cesium/Source/DataSources/GeoJsonDataSource"
import CzmlDataSource from "cesium/Source/DataSources/CzmlDataSource"
import { connect } from 'react-redux'
import czml from "./helpers/czml"
import cameraPosition from "./helpers/cameraPosition";
import './styles/CesiumGlobe.css'
import AnimationController from './helpers/AnimationController'
import {bindActionCreators} from 'redux';  
import * as treklogActions from "./state/actions";
import JulianDate from "cesium/Source/Core/JulianDate"
import config from "../config";
import firebase from "firebase";
import moment from "moment";

class CesiumGlobe extends Component {
    state = {
        viewerLoaded : false,
        isPlaying: false,
        animationInitialized: false,
        animation: null,
        animationSpeed: 300
    }

    componentDidMount() {

        if(!this.state.viewerLoaded) {

            this.viewer = new Viewer(this.cesiumContainer, {
                scene3DOnly: true,
                selectionIndicator: false,
                baseLayerPicker: true,
                geocoder: false,
                homeButton: false,
                infoBox: false,
                sceneModePicker: false,
                timeline: false,
                navigationHelpButton: false,
                navigationInstructionsInitiallyVisible: false,
                clockViewModel: null,
                imageryProviderViewModels: this.getImageryProviders(config),
                terrainProviderViewModels: [],
                terrainExaggeration: 2.0,
                fullscreenButton: false,
                creditContainer: 'cesiumAttribution'
            });
            this.setState({animation: new AnimationController(this.viewer, this.props.actions)});
    
            this.viewer.terrainProvider = new CesiumTerrainProvider({
                url: 'https://assets.agi.com/stk-terrain/world',
                requestWaterMask: false,
                requestVertexNormals: false
            });
            this.viewer.clock.shouldAnimate = false;
            this.viewer.scene.globe.depthTestAgainstTerrain = true;
        }

        this.setState({viewerLoaded: true});
    }


    loadTrack(track) {
        console.log(track);
        firebase.database().ref('/currentLive').on('value', (snapshot) => {
            const currentLiveData = snapshot.val();
            console.log(currentLiveData);
            if(this.viewer.dataSources.get(1)) {
                const time = new JulianDate.fromIso8601(currentLiveData.lastUpdate);
                const position = Cartesian3.fromDegrees(currentLiveData.point.longitude, currentLiveData.point.latitude, currentLiveData.point.elevation);
                console.log(this.viewer.clock.startTime);
                const availability = JulianDate.toIso8601(this.viewer.clock.startTime) + '/' + moment(currentLiveData.lastUpdate).toISOString();
                console.log(availability);
                this.viewer.dataSources.get(1).process({
                    id: 'path',
                    position: {
                        availability: availability,
                        cartographicDegrees: [currentLiveData.lastUpdate, currentLiveData.point.latitude, currentLiveData.point.longitude, currentLiveData.point.elevation]
                    }
                }).then(data => {
                    console.log(data);
                    this.viewer.clock.stopTime = JulianDate.fromIso8601(moment(currentLiveData.lastUpdate).subtract(60, 'seconds').toISOString());
                    this.viewer.clock.shouldAnimate = true;
                });
            }
        });
        return this.getCesiumTerrainForGeoJson(track.geoJsonPoints).then((altitudeData) => {
            console.log("LOAD DS")
            track.czmlAltitude = altitudeData;
            const geoJsonDs = GeoJsonDataSource.load(track.geoJsonPoints, {
                stroke: new Color(0.98, 0.75, 0.18),
                fill: new Color(0.98, 0.75, 0.18),
                strokeWidth: 20,
                clampToGround: true
            });
            const czmlDoc = czml.fromGeoJson(track.geoJsonPoints, track.czmlAltitude)
            const czmlDs = CzmlDataSource.load(czmlDoc);
            return Promise.all([geoJsonDs, czmlDs]);
        }).then(([geoJsonDs, czmlDs]) => {
            console.log("DS LOADED");
            this.viewer.dataSources.removeAll();
            const addGeoJson = this.viewer.dataSources.add(geoJsonDs);
            const addCzml = this.viewer.dataSources.add(czmlDs);
            return Promise.all([addGeoJson, addCzml]);
        }).then(([addGeoJson, addCzml]) => {
            console.log("DSES ADDED");
            addCzml.show = false;
            console.log("CZML HIDDEN");
            this.state.animation.initialize(track);
            console.log("ANIMATION INITED");
            if(track.initialPosition.position) {
                console.log("FLAJJ ajaj");                
                 const destination = cameraPosition.getDestination(track);
                 const orientation = cameraPosition.getOrientation(track);
                
                 return this.viewer.camera.flyTo({
                    destination,
                    orientation,
                    maxiumumHeight: 10000
                });
            } else {
                console.log("FLAJJ");
                return this.viewer.flyTo(addGeoJson, {offset: new HeadingPitchRange(0, -1.57, 4000)});
            }
        }); 

    }

    flyToTrack(track) {
        
    }

    getCesiumTerrainForGeoJson(geojson) {
        const pathCartographic = geojson.features[0].geometry.coordinates.map(point => new Cartographic.fromDegrees(point[0], point[1]));
        return sampleTerrainMostDetailed(this.viewer.terrainProvider, pathCartographic);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.track !== nextProps.track) {
            this.loadTrack(nextProps.track);
        }
        if(this.state.animation) {
            if(this.state.animation.animationInitialized && nextProps.animation.reset) {
                this.state.animation.reset();
            }
            if(this.state.animation.animationInitialized && !nextProps.animation.shouldBeInitialized) {
                this.state.animation.stop();
            }
            if(!this.viewer.clock.shouldAnimate && nextProps.animation.shouldPlay && nextProps.animation.shouldReplay) {
                this.state.animation.play();
            }
            if(this.viewer.clock.shouldAnimate && !nextProps.animation.shouldPlay) {
                this.state.animation.pause();
            }
            if(this.viewer.clock.multiplier !== nextProps.animation.speed) {
                this.state.animation.setSpeed(nextProps.animation.speed);

            }

            if(nextProps.animation.newTime) {
                this.viewer.clock.currentTime = JulianDate.addSeconds(this.viewer.clock.startTime, nextProps.animation.newTime, new JulianDate());
            }
            

        }

    }

    componentWillUnmount() {
        if(this.viewer) {
            this.viewer.destroy();
        }
    }
    
    render() {
        const containerStyle = {
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'fixed',
            display : "flex",
            alignItems : "stretch",
        };
 
        const widgetStyle = {
            flexGrow : 2
        }

        return (
            <div className="cesiumGlobeWrapper" style={containerStyle}>
                <div
                    className="cesiumWidget"
                    ref={ element => this.cesiumContainer = element }
                    style={widgetStyle}
                />
            </div>
        );
    }

    getImageryProviders(config) {
        let imageryProviders = [];

        imageryProviders.push(new ProviderViewModel({
            name: "Esri World Imagery",
            tooltip: "Esri World Imagery",
            iconUrl: "/assets/img/baseLayerPicker/esriWorldImagery.png",
            creationFunction: () => {
                return new ArcGisMapServerImageryProvider({
                    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
                });
            }
        }));

        if (config && config.cesium.providers.mapbox.publicAccessToken) {
            imageryProviders.push(new ProviderViewModel({
                name: "Mapbox Satellite",
                tooltip: "Mapbox Satellite",
                iconUrl: "/assets/img/baseLayerPicker/mapboxSatellite.png",
                creationFunction: () => {
                    return new MapboxImageryProvider({
                        mapId: 'mapbox.streets-satellite',
                        accessToken: config.cesium.providers.mapbox.publicAccessToken
                    });
                }
            }));

            imageryProviders.push(new ProviderViewModel({
                name: "Mapbox Topo",
                tooltip: "Mapbox Topo",
                iconUrl: "/assets/img/baseLayerPicker/mapboxTerrain.png",
                creationFunction: () => {
                    return new MapboxImageryProvider({
                        mapId: 'mapbox.run-bike-hike',
                        accessToken: config.cesium.providers.mapbox.publicAccessToken
                    });
                }
            }));
        }

        return imageryProviders;
    }

}

const mapStateToProps = (state) => {
    return {
      track: state.track,
      animation: state.animation
    }
  }

  function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(CesiumGlobe);