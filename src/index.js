import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';




import reducer from './treklog/state/reducers';
import App from './App';

let store = createStore(reducer);

ReactDOM.hydrate(
	<Provider store={store}>
		<Router>
			<Route component={App} />
		</Router>
	</Provider>, document.getElementById('root'));