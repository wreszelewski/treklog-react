import React, {Component} from "react";
import * as treklogActions from "./state/actions";
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import {Button,Icon} from 'semantic-ui-react';
import './styles/TopMenu.css';
import firebase from 'firebase';
import ReactQueryParams from 'react-query-params';

class TopMenu extends ReactQueryParams {


    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            isAdmin: this.queryParams.adm
        }
        firebase.auth().onAuthStateChanged((user) => {
            if(user) {
                this.setState({isLoggedIn: true})
            } else {
                this.setState({isLoggedIn: false})
            }
        })
        this.login = this.login.bind(this);
    }

    shareToFb() {
        const appId = '314100332403362';
        const href = encodeURIComponent(window.location.href);
        window.open("https://www.facebook.com/dialog/share?app_id=" + appId + "&display=popup&href=" + href, "pop", "width=600, height=400, scrollbars=no");
        return false;
    }

    login() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
            firebase.auth().signInWithPopup(provider);
        })        
    }

    logout() {
        firebase.auth().signOut();
    }

    render() {
        
            if(this.state.isLoggedIn) {
                return(<div id="topMenu">
                <Button size="large" inverted onClick={this.login}>Dodaj</Button>
                <Button size="large" inverted onClick={this.logout}>Wyloguj</Button>
                <Button icon size="large" inverted onClick={this.shareToFb}><Icon name="facebook f" />Podziel się</Button>
                <Button size="large" inverted onClick={this.props.actions.showTrackMenu}>Menu</Button>
            </div>)
            } else if (this.state.isAdmin) {
                return(<div id="topMenu">
                    <Button size="large" inverted onClick={this.login}>Zaloguj</Button>
                    <Button icon size="large" inverted onClick={this.shareToFb}><Icon name="facebook f" />Podziel się</Button>
                    <Button size="large" inverted onClick={this.props.actions.showTrackMenu}>Menu</Button>
                </div>)
            } else {
                return(<div id="topMenu">
                <Button icon size="large" inverted onClick={this.shareToFb}><Icon name="facebook f" />Podziel się</Button>
                <Button size="large" inverted onClick={this.props.actions.showTrackMenu}>Menu</Button>
            </div>)
            }
    }
    
}

function mapDispatchToProps(dispatch) {  
    return {actions: bindActionCreators(treklogActions, dispatch)};
}

export default connect(undefined, mapDispatchToProps)(TopMenu);