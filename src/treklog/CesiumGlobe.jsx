import React from "react";

import Viewer from "cesium/Source/Widgets/Viewer/Viewer";
import ProviderViewModel from "cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel";
import ArcGisMapServerImageryProvider from "cesium/Source/Scene/ArcGisMapServerImageryProvider";
import MapboxImageryProvider from "cesium/Source/Scene/MapboxImageryProvider";
import CesiumTerrainProvider from "cesium/Source/Core/CesiumTerrainProvider";
import Cartographic from "cesium/Source/Core/Cartographic";
import LabelCollection from "cesium/Source/Scene/LabelCollection";
import PointPrimitiveCollection from "cesium/Source/Scene/PointPrimitiveCollection";
import PolylineCollection from "cesium/Source/Scene/PolylineCollection";
import HorizontalOrigin from "cesium/Source/Scene/HorizontalOrigin";
import Material from "cesium/Source/Scene/Material";
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
import JulianDate from "cesium/Source/Core/JulianDate";
import NearFarScalar from "cesium/Source/Core/NearFarScalar";
import config from "../config";
import firebase from "firebase";
import moment from "moment";
import Camera from 'cesium/Source/Scene/Camera'
import ScreenSpaceEventHandler from "cesium/Source/Core/ScreenSpaceEventHandler"
import ScreenSpaceEventType from "cesium/Source/Core/ScreenSpaceEventType"
import DistanceDisplayCondition from "cesium/Source/Core/DistanceDisplayCondition"
import ReactQueryParams from 'react-query-params';
import Ion from 'cesium/Source/Core/Ion';
import IonResource from 'cesium/Source/Core/IonResource';

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
            Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMmM2MmM5MS1mZGNhLTRkNzctYjRhMy0zOWM1ZmZiMTJkMzIiLCJpZCI6NzUzNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0OTY1MzA4NX0._D5ndgqqSkliHUz8ZH-NNH4ML1WPhV0yNICqjIzv5w0';
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
            this.polylines = this.viewer.scene.primitives.add(new PolylineCollection());
            this.labels = this.viewer.scene.primitives.add(new LabelCollection());
            this.viewer.terrainProvider = new CesiumTerrainProvider({
				url: IonResource.fromAssetId(1)
			})
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
                strokeWidth: 5,
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
            if(this.polylines) {
                
                this.polylines.removeAll();
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
    
                            this.polylines.add({
                                positions: Cartesian3.fromDegreesArrayHeights([
                                  placemark.longitude, placemark.latitude, placemark.height,
                                  placemark.longitude, placemark.latitude, placemark.height + 300  
                                ]),
                                width: 1,
                                material: new Material({
                                    fabric : {
                                        type : 'Color',
                                        uniforms : {
                                            color : Color.fromCssColorString('#faedd1')
                                        }
                                    }
                                }),
                                distanceDisplayCondition: new DistanceDisplayCondition(0, 20000)
                            });
                            this.labels.add({
                                position: Cartesian3.fromDegrees(placemark.longitude, placemark.latitude, placemark.height + 350),
                                text: placemark.name,
                                font: '20px Lato, sans-serif',
                                style: LabelStyle.FILL_AND_OUTLINE,
                                fillColor : Color.fromCssColorString('#faedd1'),
                                outlineColor : Color.fromCssColorString('#2d200e'),
                                outlineWidth: 2,
                                horizontalOrigin: HorizontalOrigin.CENTER,
                                distanceDisplayCondition: new DistanceDisplayCondition(0, 30000)
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
                for(let i = 0; i < this.labels.length; i++) {
                    this.labels.get(i).distanceDisplayCondition = new DistanceDisplayCondition(0, 30000);
                }
                for(let i = 0; i < this.polylines.length; i++) {
                    this.polylines.get(i).distanceDisplayCondition = new DistanceDisplayCondition(0, 30000);
                }
                if(this.state.admin) {
                    this.viewer.scene.screenSpaceCameraController.enableZoom = true;
                    this.scrollHandler.destroy();
                }
            }
            if(!this.viewer.clock.shouldAnimate && nextProps.animation.shouldPlay && nextProps.animation.shouldReplay) {
                this.state.animation.play();
                for(let i = 0; i < this.labels.length; i++) {
                    this.labels.get(i).distanceDisplayCondition = new DistanceDisplayCondition(1900, 5000);
                }
                for(let i = 0; i < this.polylines.length; i++) {
                    this.polylines.get(i).distanceDisplayCondition = new DistanceDisplayCondition(2000, 5000);
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