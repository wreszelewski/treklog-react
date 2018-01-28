const firebase = require('firebase');

const config = {
    apiKey: "AIzaSyBkFAImgTGsUkPChnOpO788GvS6-OeOe9M",
    authDomain: "treklog-d28c2.firebaseapp.com",
    databaseURL: "https://treklog-d28c2.firebaseio.com",
    projectId: "treklog-d28c2",
    storageBucket: "treklog-d28c2.appspot.com",
    messagingSenderId: "834453176935",
    cesium: {
        providers: {
            mapbox: {
                publicAccessToken: "pk.eyJ1Ijoid3Jlc3plbGV3c2tpIiwiYSI6ImNqOTNidWgwajN3NzczM3FxbHdhZ3cxZXMifQ.YsXnsIrYCqNRxBYWZyubvw"
            }
        },
        navigation: {
            maxLinkFlightHeight: '10000'
        }
    }
};

firebase.initializeApp(config);

module.exports = config;