const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const Mustache = require('mustache');
const fs = require('fs');

const indexTemplate = fs.readFileSync(__dirname + '/views/index.mst', {encoding: 'utf-8'});

exports.indexPage = functions.https.onRequest((req, res) => {
   const track = admin.database().ref('tracks/' + req.path).once("value")
    .then(track => track.val())
    .then(track => {
        track.distance = (parseInt(track.distance) / 1000).toString();
        const html = Mustache.render(indexTemplate, track);
        res.status(200).send(html);
    });

});
