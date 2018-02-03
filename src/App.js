import React, { Component } from 'react';


import CesiumGlobe from "./treklog/CesiumGlobe";
import TrackMenuContainer from "./treklog/TrackMenuContainer"
import TopMenu from "./treklog/TopMenu"
import TreklogLoaderContainer from "./treklog/TreklogLoaderContainer"
import TrackDescriptionContainer from "./treklog/TrackDescriptionContainer"
import BottomMenuContainer from "./treklog/BottomMenuContainer"
import CesiumAttribution from './treklog/CesiumAttribution';

class App extends Component {
    render() {
        return (
            <div>
                <TopMenu />
                <TrackMenuContainer />
                <CesiumGlobe />
                <BottomMenuContainer />
                <CesiumAttribution />
                <TreklogLoaderContainer />
            </div>
        );
    }
}

export default App;