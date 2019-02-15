import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import buildModuleUrl from 'cesium/Source/Core/buildModuleUrl';
import 'cesium/Source/Widgets/widgets.css';

import reducer from './treklog/state/reducers';
import App from './App';

let store = createStore(reducer);

buildModuleUrl.setBaseUrl('/cesium/');

ReactDOM.render(
	<Provider store={store}>
		<Router>
			<Route component={App} />
		</Router>
	</Provider>, document.getElementById('root'));