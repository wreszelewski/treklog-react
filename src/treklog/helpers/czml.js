const moment = require('moment');

function createCzmlPath(geojson, altitude, mode) {

    let path = [];

            geojson.features[0].geometry.coordinates.forEach((point, index) => {
                path.push(geojson.features[0].properties.coordTimes[index]);
                path.push(point[0]);
                path.push(point[1]);
                path.push((altitude[index].height*2)+4);
            });
            return path;

}

function fromGeoJson(geojson, altitude, multiplier = 300) {
    let czml = []
    const coordTimes = geojson.features[0].properties.coordTimes
    const globalStartTime = coordTimes[0];
    const globalStopTime = coordTimes[coordTimes.length - 1];
    const globalAvailability = globalStartTime + "/" + globalStopTime;

    const globalElement = {
        id: "document",
        name: geojson.features[0].properties.name,
        version: "1.0",
        author: "Wojciech Reszelewski",
        clock: {
            interval: globalAvailability,
            currentTime: globalStartTime,
            multiplier: multiplier
        }
    }
    czml.push(globalElement);
    const czmlPath = createCzmlPath(geojson, altitude);
       

            const pathObject = {
                id: "path",
                availability: globalStartTime + "/" + globalStopTime,
                billboard : {
                    image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gIOFSgat5UCMQAAAPpJREFUaN7tmcENwjAMResojAMr0NFhBRgHpHLiQFWUOv62A7ZvVav2v/g7cdJpysiIHYR60eNyXDjPH+Y7DQHAFY4GIU/xCAjyFi+FoBHESyBIS3w93z6un9eTCgRZiNeEKL++DhRv30u/FScDnNjy+l7/c6NqjYyW4LRQAiSAQRFLV2I3gG/C1/eRINVCuCZInCJG7WHR34JY6G2FvVZC1gB8Q9OCaInnZho+jVr1QH9TxPE29VoQvbNcTAuhsyBZY2JnAJEF18NdKQSiPUkL9WZhmB8cPRDIztbcQui2vIwsztxCLStpAKqN2BrCIzsQCMtj+YyMiPECGyx1CzIp1+MAAAAASUVORK5CYII=",
                    scale : 0.75,
                    verticalOrigin: "BOTTOM",
                    eyeOffset: {
                        "cartesian": [ 0.0, 0.0, -30.0 ]
                    },
                },
                position: {
                    cartographicDegrees: czmlPath
                },
                path: {
                    material: {
                        polylineOutline: {
                            color: {
                                rgba: [251,192,45, 400]
                            },
                            outlineColor: {
                                rgba: [251,192,45, 400]
                            },
                            outlineWidth: 5
                        }
                    },
                    width: 5,
                    leadTime: 0,
                    resolution: 30
                }
            }
        
            czml.push(pathObject);
            return czml;
        


}

module.exports = {
    createCzmlPath,
    fromGeoJson
}