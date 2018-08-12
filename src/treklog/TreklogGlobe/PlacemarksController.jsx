import {Component} from 'react';
import {bindActionCreators} from 'redux';

import LabelCollection from 'cesium/Source/Scene/LabelCollection';
import PolylineCollection from 'cesium/Source/Scene/PolylineCollection';
import HorizontalOrigin from 'cesium/Source/Scene/HorizontalOrigin';
import Material from 'cesium/Source/Scene/Material';
import LabelStyle from 'cesium/Source/Scene/LabelStyle';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import DistanceDisplayCondition from 'cesium/Source/Core/DistanceDisplayCondition';
import Color from 'cesium/Source/Core/Color';

const lineVisibleTo = 20000;
const labelVisibleTo = 30000;
const playVisibleTo = 5000;
const playVisibleFrom = 2000;
const labelHeight = 100;
const visibleFrom = 0;
const placemarkLineExaggeration = 300;
const placemarkLabelExaggeration = 350;

export default class PlacemarksController extends Component {

	constructor(props) {
		super(props);
		this.viewer;
		this.polylines;
		this.labels;
	}

	componentDidUpdate() {
		this.viewer = this.props.cesiumViewer;
		if(!this.viewer) return;
		if(!this.polylines) this.polylines = this.viewer.scene.primitives.add(new PolylineCollection());
		if(!this.labels) this.labels = this.viewer.scene.primitives.add(new LabelCollection());
		this.polylines.removeAll();
		this.labels.removeAll();

		this.props.placemarks.forEach(placemark => {
			this.polylines.add({
				positions: Cartesian3.fromDegreesArrayHeights([
					placemark.longitude, placemark.latitude, placemark.height,
					placemark.longitude, placemark.latitude, placemark.height + placemarkLineExaggeration
				]),
				width: 1,
				material: new Material({
					fabric: {
						type: 'Color',
						uniforms: {
							color: Color.fromCssColorString('#f4d797')
						}
					}
				}),
				distanceDisplayCondition: new DistanceDisplayCondition(visibleFrom, lineVisibleTo)
			});
			this.labels.add({
				position: Cartesian3.fromDegrees(placemark.longitude, placemark.latitude, placemark.height + placemarkLabelExaggeration),
				text: placemark.name,
				font: '20px Lato, sans-serif',
				style: LabelStyle.FILL_AND_OUTLINE,
				fillColor: Color.fromCssColorString('#f4d797'),
				outlineColor: Color.fromCssColorString('#2d200e'),
				outlineWidth: 2,
				horizontalOrigin: HorizontalOrigin.CENTER,
				distanceDisplayCondition: new DistanceDisplayCondition(visibleFrom, labelVisibleTo)
			});
		});
	}

	render() {
		return null;
	}


}