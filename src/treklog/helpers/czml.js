const moment = require('moment');

function createCzmlPath(geojson, altitude, mode) {

    let path = [],
        timestep = 0;

            geojson.features[0].geometry.coordinates.forEach((point, index) => {
                path.push(timestep);
                path.push(point[0]);
                path.push(point[1]);
                path.push((altitude[index].height*2)+4);

                const duration = (moment(geojson.features[0].properties.coordTimes[index+1]) - moment(geojson.features[0].properties.coordTimes[index])) / 1000;
                timestep += duration;
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
    console.log("POINT1");
    czml.push(globalElement);
    const czmlPath = createCzmlPath(geojson, altitude);
       

            const pathObject = {
                id: "path",
                availability: globalAvailability,
                billboard : {
                    image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QsOFx4xGjWutQAAAOdJREFUaN7tmcsSxSAIQ43T//9l7upuurFIEBxg207NMfHZMbq6ahdYH5IxRNkwUgBohbNBECmeAYFo8VYIZBBvgYCbeHm9BrhA4Ih4R4h5+zowo3NvbauOA7qpAdv519bjt0nBxQ5cH6EGKATgM4iNK3EcgMi350SQ54hwR5A6gxjE8zOzLU6E/lH4GiXiGOAfaFYQC/Fap/nTKJBzDGSteod6L4jdWa5mhNguWNaY2g4wXAi93LVCMLYnHaFdF9L84NiBYO5sZ4Dl1E6bmcUdj9AqSh6Abj32hohwhwJx8lq+q6ti/QC86zxQ2Gxr3gAAAABJRU5ErkJggg==",
                    scale : 0.75,
                    verticalOrigin: "BOTTOM",
                    eyeOffset: {
                        "cartesian": [ 0.0, 0.0, -30.0 ]
                    },
                },
                position: {
                    epoch: globalStartTime,
                    cartographicDegrees: czmlPath
                },
                path: {
                    material: {
                        polylineOutline: {
                            color: {
                                rgba: [255,0,0, 400]
                            },
                            outlineColor: {
                                rgba: [255,0,0, 400]
                            },
                            outlineWidth: 5
                        }
                    },
                    width: 5,
                    leadTime: -10,
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