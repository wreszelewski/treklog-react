import React, { Component } from 'react';


import CesiumGlobe from "./treklog/CesiumGlobe";
import TrackMenuContainer from "./treklog/TrackMenuContainer"
import TopMenu from "./treklog/TopMenu"



class App extends Component {
    render() {
        return (
            <div>
                <TopMenu />
                <TrackMenuContainer />
                <CesiumGlobe />
            </div>
        );
    }
}

export default App;