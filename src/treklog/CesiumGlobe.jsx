import React, {Component} from "react";

import Viewer from "cesium/Source/Widgets/Viewer/Viewer";
import ProviderViewModel from "cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel";
import ArcGisMapServerImageryProvider from "cesium/Source/Scene/ArcGisMapServerImageryProvider";
import MapboxImageryProvider from "cesium/Source/Scene/MapboxImageryProvider";
import CesiumTerrainProvider from "cesium/Source/Core/CesiumTerrainProvider";
import Cartographic from "cesium/Source/Core/Cartographic";
import sampleTerrainMostDetailed from "cesium/Source/Core/sampleTerrainMostDetailed";
import GeoJsonDataSource from "cesium/Source/DataSources/GeoJsonDataSource"
import CzmlDataSource from "cesium/Source/DataSources/CzmlDataSource"
import { connect } from 'react-redux'
import czml from "./helpers/czml"
import cameraPosition from "./helpers/cameraPosition";
import './styles/CesiumGlobe.css'
import AnimationController from './helpers/AnimationController'

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
                imageryProviderViewModels: this.getImageryProviders(),
                terrainProviderViewModels: [],
                terrainExaggeration: 2.0,
                fullscreenButton: false,
                creditContainer: 'cesiumAttribution'
            });
            this.state.animation = new AnimationController(this.viewer);
    
            this.viewer.terrainProvider = new CesiumTerrainProvider({
                url: 'https://assets.agi.com/stk-terrain/world',
                requestWaterMask: false,
                requestVertexNormals: false
            });
    
            this.viewer.scene.globe.depthTestAgainstTerrain = true;
        }

        console.log(this.props.track);

        this.state.viewerLoaded = true;
    }

    loadTrack(track) {
        console.log("LOAD TRACK");
        this.viewer.dataSources.removeAll();
        return this.getCesiumTerrainForGeoJson(track.geoJsonPoints).then((altitudeData) => {
            console.log("ALTITUDE");
            track.czmlAltitude = altitudeData;
            const geoJsonDs = GeoJsonDataSource.load(track.geoJsonPoints, {
                stroke: 'red',
                fill: 'red',
                strokeWidth: 40,
                clampToGround: true
            });
            console.log("TU");
            const czmlDoc = czml.fromGeoJson(track.geoJsonPoints, track.czmlAltitude)
            const czmlDs = CzmlDataSource.load(czmlDoc);
            return Promise.all([geoJsonDs, czmlDs]);
        }).then(([geoJsonDs, czmlDs]) => {
            console.log("HERE1");
            const addGeoJson = this.viewer.dataSources.add(geoJsonDs);
            const addCzml = this.viewer.dataSources.add(czmlDs);
            return Promise.all([addGeoJson, addCzml]);
        }).then(([addGeoJson, addCzml]) => {
            addCzml.show = false;
            console.log("HERE2");
            if(track.initialPosition.position) {
                 const destination = cameraPosition.getDestination(track);
                 const orientation = cameraPosition.getOrientation(track);
                
                 return this.viewer.camera.flyTo({
                    destination,
                    orientation,
                    maxiumumHeight: 10000
                });
            } else {
                return this.viewer.flyTo(addGeoJson);
            }
        }); 

    }

    getCesiumTerrainForGeoJson(geojson) {
        const pathCartographic = geojson.features[0].geometry.coordinates.map(point => new Cartographic.fromDegrees(point[0], point[1]));
        return sampleTerrainMostDetailed(this.viewer.terrainProvider, pathCartographic);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.track !== nextProps.track) {
            this.loadTrack(nextProps.track);
            console.log(nextProps);
        }
        console.log(this.state.animation);
        if(this.state.animation) {
            if(this.state.animationInitialized && !nextProps.animation.shouldBeInitialized) {
                this.state.animation.stop();
            }
            if(!this.state.isPlaying && nextProps.animation.shouldPlay) {
                this.state.animation.play();
            }
            if(this.state.isPlaying && !nextProps.animation.shouldPlay) {
                this.state.animation.pause();
            }
            if(this.state.animationSpeed !== nextProps.animation.speed) {
                this.state.animation.setSpeed(nextProps.animation.speed);
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
        console.log("Render");
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

const mapStateToProps = state => {
    return {
      track: state.track,
      animation: state.animation
    }
  }

export default connect(mapStateToProps, undefined)(CesiumGlobe);