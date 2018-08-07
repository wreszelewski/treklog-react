const functions = require('firebase-functions');
const admin = require("firebase-admin");
const gcs = require('@google-cloud/storage')();

admin.initializeApp();
const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const os = require('os');
const indexTemplate = fs.readFileSync(__dirname + '/views/index.mst', {encoding: 'utf-8'});
const geoJsonTemplate = fs.readFileSync(__dirname + '/views/geoJson.mst', {encoding: 'utf-8'});
const moment = require('moment');

const bucketName = 'treklog-d28c2.appspot.com';

exports.indexPage = functions.https.onRequest((req, res) => {
   const track = admin.database().ref('tracks/' + req.path).once("value")
    .then(track => track.val())
    .then(track => {
        track.distance = (parseInt(track.distance) / 1000).toString();
        const html = Mustache.render(indexTemplate, track);
        res.status(200).send(html);
    });

});

exports.addLiveTrackPoint = functions.https.onRequest((req, res) => {
    const { deviceId } = req.body;
    return admin.database().ref('currentLive').once("value")
        .then(currentLive => currentLive.val())
        .then((currentLive) => {
            if(currentLive && moment(currentLive.lastUpdate).add(6, 'hours').isAfter(moment.utc(req.body.timestamp).toISOString())) {
                return updateLiveTrack(req.body, currentLive);
            } else {
                if(currentLive) {
                    admin.database().ref(currentLive.trackUrl).child('isLive').set(false);
                }
                return createLiveTrack(req.body);
            }
        })
        .then(() => {
            res.sendStatus(200);
        });
});

function createLiveTrack(point) {
    const timestampSuffix = moment.utc(point.timestamp).toISOString().replace('.', '-');
    const geoJson = Mustache.render(geoJsonTemplate, { point });
    const tempFilePath = path.join(os.tmpdir(), 'tmpTrack.geojson');
    fs.writeFileSync(tempFilePath, geoJson);
    const bucket = gcs.bucket(bucketName);
    const fileUpload = bucket.upload(tempFilePath, {
        destination: 'gpsTracks/live-' + timestampSuffix,
        metadata: {
            contentType: 'application/json'
        }
    }).then(() => fs.unlinkSync(tempFilePath));

    const year = point.timestamp.slice(0,4);
    const dbUpload = admin.database().ref('tracks/' + year).child('live-' + timestampSuffix).set({
        date: point.timestamp,
        name: "Na żywo",
        description: "",
        geoJsonPath: 'gpsTracks/live-' + timestampSuffix,
        url: '/' + year + '/live-' + timestampSuffix,
        initialPosition: {
            heading: 0,
            pitch: -0.6981317007977318,
            height: 14000
        },
        isLive: true,
        hide: true
    });
    const uploadLiveConfig = admin.database().ref('currentLive').set({
        trackUrl: '/' + year + '/live-' + timestampSuffix,
        geoJsonPath: 'gpsTracks/live-' + timestampSuffix,
        lastUpdate: moment.utc(point.timestamp).toISOString(),
        point: {
            longitude: parseFloat(point.longitude),
            latitude: parseFloat(point.latitude),
            elevation: parseFloat(point.elevation)
        }
    });
    return Promise.all([fileUpload, dbUpload, uploadLiveConfig]);


}

function updateLiveTrack(point, currentLive) {
    const tempFilePath = path.join(os.tmpdir(), 'tmpTrack.geojson');
    const bucket = gcs.bucket(bucketName);
    return bucket.file(currentLive.geoJsonPath)
        .download()
        .then(data => JSON.parse(data[0]))
        .then(content => {
            content.features[0].properties.coordTimes.push(moment.utc(point.timestamp).toISOString());
            content.features[0].geometry.coordinates.push([parseFloat(point.latitude), parseFloat(point.longitude), parseFloat(point.elevation)]);
            const geoJson = JSON.stringify(content);
            fs.writeFileSync(tempFilePath, geoJson);
            const updateFile = bucket.upload(tempFilePath, {
                destination: currentLive.geoJsonPath,
                metadata: {
                    contentType: 'application/json'
                }
            }).then(() => fs.unlinkSync(tempFilePath));
            const updateCurrentLive = admin.database().ref('currentLive').child('lastUpdate').set(moment.utc(point.timestamp).toISOString());
            const updateCurrentLivePoint = admin.database().ref('currentLive').child('point').set({
                longitude: parseFloat(point.longitude),
                latitude: parseFloat(point.latitude),
                elevation: parseFloat(point.elevation)
            });
            return Promise.all([updateFile, updateCurrentLive, updateCurrentLivePoint]);
        });
}