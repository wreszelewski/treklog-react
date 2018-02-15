import React, {Component} from "react";
import * as treklogActions from "./state/actions";
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import {Button,Icon} from 'semantic-ui-react';
import './styles/TopMenu.css';


class TopMenu extends Component {

    shareToFb() {
        const appId = '314100332403362';
        const href = encodeURIComponent(window.location.href);
        window.open("https://www.facebook.com/dialog/share?app_id=" + appId + "&display=popup&href=" + href, "pop", "width=600, height=400, scrollbars=no");
        return false;
    }

    render() {
        
        return (
            <div id="topMenu">
                <Button icon size="large" inverted onClick={this.shareToFb}><Icon name="facebook f" />Podziel się</Button>
                <Button size="large" inverted onClick={this.props.actions.showTrackMenu}>Menu</Button>
            </div>
        );
    }
    
}

function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

export default connect(undefined, mapDispatchToProps)(TopMenu);