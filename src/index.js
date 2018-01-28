import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import "cesium/Source/Widgets/widgets.css";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './treklog/state/reducers';

import buildModuleUrl from "cesium/Source/Core/buildModuleUrl";

let store = createStore(reducer);

buildModuleUrl.setBaseUrl('./cesium/');

ReactDOM.render(
<Provider store={store}>
    <App />
</Provider>, document.getElementById('root'));