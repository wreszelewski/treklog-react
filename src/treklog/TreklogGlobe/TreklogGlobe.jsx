import React from 'react';
import ReactQueryParams from 'react-query-params';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
import ProviderViewModel from 'cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel';
import ArcGisMapServerImageryProvider from 'cesium/Source/Scene/ArcGisMapServerImageryProvider';
import MapboxImageryProvider from 'cesium/Source/Scene/MapboxImageryProvider';
import CesiumTerrainProvider from 'cesium/Source/Core/CesiumTerrainProvider';
import LabelCollection from 'cesium/Source/Scene/LabelCollection';
import PolylineCollection from 'cesium/Source/Scene/PolylineCollection';
import Rectangle from 'cesium/Source/Core/Rectangle';
import Color from 'cesium/Source/Core/Color';
import JulianDate from 'cesium/Source/Core/JulianDate';
import Camera from 'cesium/Source/Scene/Camera';

import * as treklogActions from 'treklog/state/actions';
import config from 'config';

import * as actions from './actions';

import 'treklog/styles/CesiumGlobe.css';

class TreklogGlobe extends ReactQueryParams {

	constructor(props) {
		super(props);
		this.state = {
			viewerLoaded: false,
			isPlaying: false,
			animationInitialized: false,
			animation: null,
			animationSpeed: 300,
			isAdmin: this.queryParams.adm
		};
	}

	componentDidMount() {

		var west = -28.0;
		var south = 48.0;
		var east = 69.0;
		var north = 49.0;
		var rectangle = Rectangle.fromDegrees(west, south, east, north);

		if (!this.state.viewerLoaded) {


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
				imageryProviderViewModels: getImageryProviders(config),
				terrainProviderViewModels: [],
				terrainExaggeration: 1.0,
				fullscreenButton: false,
				creditContainer: 'cesiumAttribution'
			});
			this.viewer.scene.globe.baseColor = new Color.fromCssColorString('#ce841c');
			this.polylines = this.viewer.scene.primitives.add(new PolylineCollection());
			this.labels = this.viewer.scene.primitives.add(new LabelCollection());
			this.viewer.terrainProvider = new CesiumTerrainProvider({
				url: 'https://assets.agi.com/stk-terrain/world',
				requestWaterMask: false,
				requestVertexNormals: false
			});
			this.viewer.clock.shouldAnimate = false;
			this.viewer.scene.globe.depthTestAgainstTerrain = true;
		}

		this.setState({ viewerLoaded: true });
		this.props.actions.cesiumViewerCreated(this.viewer);
	}

	componentWillUnmount() {
		if (this.viewer) {
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
			display: 'flex',
			alignItems: 'stretch'
		};

		const widgetStyle = {
			flexGrow: 2
		};
		const children = React.Children.map(this.props.children, child => {
			return React.cloneElement(child, {cesiumViewer: this.viewer});
		});
		return (
			<div>
				<div className="cesiumGlobeWrapper" style={containerStyle}>
					<div
						className="cesiumWidget"
						ref={element => this.cesiumContainer = element}
						style={widgetStyle}
					/>
					{children}
				</div>
			</div>
		);
	}

}
function getImageryProviders(config) {
	let imageryProviders = [];

	imageryProviders.push(new ProviderViewModel({
		name: 'Esri World Imagery',
		tooltip: 'Esri World Imagery',
		iconUrl: '/assets/img/baseLayerPicker/esriWorldImagery.png',
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
			name: 'Mapbox Satellite',
			tooltip: 'Mapbox Satellite',
			iconUrl: '/assets/img/baseLayerPicker/mapboxSatellite.png',
			creationFunction: () => {
				return new MapboxImageryProvider({
					mapId: 'mapbox.streets-satellite',
					accessToken: config.cesium.providers.mapbox.publicAccessToken
				});
			}
		}));

		imageryProviders.push(new ProviderViewModel({
			name: 'Mapbox Topo',
			tooltip: 'Mapbox Topo',
			iconUrl: '/assets/img/baseLayerPicker/mapboxTerrain.png',
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


const mapStateToProps = (state) => {
	return {
		track: state.track,
		animation: state.animation
	};
};

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(treklogActions, dispatch),
		treklogGlobeActions: bindActionCreators(actions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(TreklogGlobe);