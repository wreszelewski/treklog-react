import firebase from 'firebase';

const config = {
	firebase: {
		apiKey: 'AIzaSyBkFAImgTGsUkPChnOpO788GvS6-OeOe9M',
		authDomain: 'treklog-d28c2.firebaseapp.com',
		databaseURL: 'https://treklog-d28c2.firebaseio.com',
		projectId: 'treklog-d28c2',
		storageBucket: 'treklog-d28c2.appspot.com',
		messagingSenderId: '834453176935'
	},
	cesium: {
		providers: {
			mapbox: {
				publicAccessToken: 'pk.eyJ1Ijoid3Jlc3plbGV3c2tpIiwiYSI6ImNqOTNidWgwajN3NzczM3FxbHdhZ3cxZXMifQ.YsXnsIrYCqNRxBYWZyubvw'
			},
			ion: {
				accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMmM2MmM5MS1mZGNhLTRkNzctYjRhMy0zOWM1ZmZiMTJkMzIiLCJpZCI6NzUzNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0OTY1MzA4NX0._D5ndgqqSkliHUz8ZH-NNH4ML1WPhV0yNICqjIzv5w0'
			}
		},
		navigation: {
			maxLinkFlightHeight: '10000'
		}
	}
};

firebase.initializeApp(config.firebase);

export default config;