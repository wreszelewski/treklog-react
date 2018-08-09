import React from "react";

import Viewer from "cesium/Source/Widgets/Viewer/Viewer";
import ProviderViewModel from "cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel";
import ArcGisMapServerImageryProvider from "cesium/Source/Scene/ArcGisMapServerImageryProvider";
import MapboxImageryProvider from "cesium/Source/Scene/MapboxImageryProvider";
import CesiumTerrainProvider from "cesium/Source/Core/CesiumTerrainProvider";
import Cartographic from "cesium/Source/Core/Cartographic";
import LabelCollection from "cesium/Source/Scene/LabelCollection";
import PointPrimitiveCollection from "cesium/Source/Scene/PointPrimitiveCollection";
import HorizontalOrigin from "cesium/Source/Scene/HorizontalOrigin";
import LabelStyle from "cesium/Source/Scene/LabelStyle";
import Cartesian3 from "cesium/Source/Core/Cartesian3";
import Cartesian2 from "cesium/Source/Core/Cartesian2";
import Rectangle from "cesium/Source/Core/Rectangle";
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
import Camera from 'cesium/Source/Scene/Camera'
import ScreenSpaceEventHandler from "cesium/Source/Core/ScreenSpaceEventHandler"
import ScreenSpaceEventType from "cesium/Source/Core/ScreenSpaceEventType"
import ReactQueryParams from 'react-query-params';

class CesiumGlobe extends ReactQueryParams {
    state = {
        viewerLoaded : false,
        isPlaying: false,
        animationInitialized: false,
        animation: null,
        animationSpeed: 300,
        isAdmin: this.queryParams.adm
    }

    componentDidMount() {

        if(!this.state.viewerLoaded) {
            var west = -28.0;
            var south = 48.0;
            var east = 69.0;
            var north = 49.0;
            
            var rectangle = Rectangle.fromDegrees(west, south, east, north);
            
            Camera.DEFAULT_VIEW_FACTOR = 0;
            Camera.DEFAULT_VIEW_RECTANGLE = rectangle;
            
            this.scrollHandler = null;
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
                terrainExaggeration: 1.0,
                fullscreenButton: false,
                creditContainer: 'cesiumAttribution'
            });
            this.setState({animation: new AnimationController(this.viewer, this.props.actions, this.state)});
            this.viewer.scene.globe.baseColor = new Color.fromCssColorString('#ce841c'); 
            this.points = this.viewer.scene.primitives.add(new PointPrimitiveCollection());
            this.labels = this.viewer.scene.primitives.add(new LabelCollection());
            this.viewer.terrainProvider = new CesiumTerrainProvider({
                url: 'https://assets.agi.com/stk-terrain/world',
                requestWaterMask: false,
                requestVertexNormals: false
            });
            this.viewer.clock.shouldAnimate = false;
            this.viewer.scene.globe.depthTestAgainstTerrain = true;
        }

        this.setState({viewerLoaded: true});
        this.props.actions.cesiumViewerCreated(this.viewer);
    }

    registerLiveTrackListener(track) {
        firebase.database().ref('/currentLive').on('value', (snapshot) => {
            const currentLiveData = snapshot.val();
            if(currentLiveData.trackUrl === track.url) {
                if(this.viewer.dataSources.get(1)) {
                    const availability = JulianDate.toIso8601(this.viewer.clock.startTime) + '/' + moment(currentLiveData.lastUpdate).toISOString();
                    const pathCarto = [new Cartographic.fromDegrees(currentLiveData.point.latitude, currentLiveData.point.longitude)];
                    sampleTerrainMostDetailed(this.viewer.terrainProvider, pathCarto)
                        .then(altitude => {
                            return this.viewer.dataSources.get(1).process({
                                id: 'path',
                                availability: availability,
                                position: {
                                    cartographicDegrees: [currentLiveData.lastUpdate, currentLiveData.point.latitude, currentLiveData.point.longitude, (altitude[0].height*2)+4]
                                }
                            })
                        })
                        .then(data => {
                            this.viewer.dataSources.get(1).process({
                                id: 'document',
                                clock: {
                                    interval: availability,
                                    currentTime: JulianDate.toIso8601(this.viewer.clock.currentTime),
                                    multiplier: this.viewer.clock.multiplier
        
                                }
                            })
                        }).then(() => {
                            this.viewer.clock.stopTime = JulianDate.fromIso8601(currentLiveData.lastUpdate);
                            this.viewer.clock.shouldAnimate = true;
                        });
                }
            } else {
                firebase.database().ref('/currentLive').off();
            }
        });
    }

    loadTrack(track) {
        if(track.isLive) {
            this.registerLiveTrackListener(track);
        }
        return this.getCesiumTerrainForGeoJson(track.geoJsonPoints).then((altitudeData) => {
            track.czmlAltitude = altitudeData;
            const geoJsonDs = GeoJsonDataSource.load(track.geoJsonPoints, {
                stroke: Color.fromCssColorString('#f4d797'),
                strokeWidth: 50,
                clampToGround: true
            });
            const czmlDoc = czml.fromGeoJson(track.geoJsonPoints, track.czmlAltitude)
            const czmlDs = CzmlDataSource.load(czmlDoc);
            return Promise.all([geoJsonDs, czmlDs]);
        }).then(([geoJsonDs, czmlDs]) => {
            this.viewer.dataSources.removeAll();
            if(this.labels) {
                this.labels.removeAll();
            }
            if(this.points) {
                
                this.points.removeAll();
            }
            const addGeoJson = this.viewer.dataSources.add(geoJsonDs);
            const addCzml = this.viewer.dataSources.add(czmlDs);
            return Promise.all([addGeoJson, addCzml]);
        }).then(([addGeoJson, addCzml]) => {
            addCzml.show = false;
            this.state.animation.initialize(track);
            if(track.initialPosition.position) {
                 const destination = cameraPosition.getDestination(track);
                 const orientation = cameraPosition.getOrientation(track);
                
                 return this.viewer.flyTo(addGeoJson, {
                    maxiumumHeight: 20000,
                    duration: 3,
                    offset: new HeadingPitchRange(0, -1.5707963267948966, 20000)
                }).then(() => {
                    return this.viewer.camera.flyTo({
                        destination,
                        orientation,
                        maxiumumHeight: 20000,
                        duration: 3
                    })
                }).then(() => {
                    if(track.placemarks && track.placemarks.length > 0) {

                        track.placemarks.forEach(placemark => {
    
                            this.points.add({
                                position: new Cartesian3(placemark.x, placemark.y, placemark.z),
                                color: Color.fromCssColorString('#f4d797'),
                                pixelSize: 10.0,
                                outlineColor : Color.BLACK,
                                outlineWidth: 4,
                                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            });
                            this.labels.add({
                                position: new Cartesian3(placemark.x, placemark.y, placemark.z),
                                text: placemark.name,
                                font: '25px Lato, sans-serif',
                                style: LabelStyle.FILL_AND_OUTLINE,
                                fillColor : Color.fromCssColorString('#f4d797'),
                                outlineColor : Color.BLACK,
                                outlineWidth: 2,
                                horizontalOrigin: HorizontalOrigin.CENTER,
                                pixelOffset: new Cartesian2(0,-15),
                                disableDepthTestDistance: Number.POSITIVE_INFINITY
                            });
                        })
                    }

    
                    
                });
            } else {
                return this.viewer.flyTo(addGeoJson, {offset: new HeadingPitchRange(0, -1.57, 4000)});
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
        }
        if(this.state.animation) {
            if(this.state.animation.animationInitialized && nextProps.animation.reset) {
                this.state.animation.reset();
            }
            if(this.state.animation.animationInitialized && !nextProps.animation.shouldBeInitialized) {
                this.state.animation.stop();
                if(this.state.admin) {
                    this.viewer.scene.screenSpaceCameraController.enableZoom = true;
                    this.scrollHandler.destroy();
                }
            }
            if(!this.viewer.clock.shouldAnimate && nextProps.animation.shouldPlay && nextProps.animation.shouldReplay) {
                this.state.animation.play();
                if(this.state.isAdmin) {

                    this.scrollHandler = new ScreenSpaceEventHandler(this.viewer.canvas);
                    this.viewer.scene.screenSpaceCameraController.enableZoom = false;
                                    this.scrollHandler.setInputAction((e) => {
                                        if(e > 0) {
                                            this.viewer.clock.currentTime = JulianDate.addSeconds(this.viewer.clock.currentTime, 60, new JulianDate());
                                            console.log(this.viewer.dataSources.get(1).entities.getById('path').position.getValue(this.viewer.clock.currentTime));
                                            
                                        } else {
                                            this.viewer.clock.currentTime = JulianDate.addSeconds(this.viewer.clock.currentTime, -60, new JulianDate());
                                            console.log(this.viewer.dataSources.get(1).entities.getById('path').position.getValue(this.viewer.clock.currentTime));                                        
                                        }
                                    }, ScreenSpaceEventType.WHEEL);
                }
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
                const provider = new ArcGisMapServerImageryProvider({
                    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
                });
                provider.defaultSaturation = 0.0;
                provider.defaultAlpha = 0.6;
                provider.defaultContrast = 2.8;
                provider.defaultBrightness = 0.8;
                return provider;
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