import Cartesian3 from "cesium/Source/Core/Cartesian3";


function getDestination(track) {
    if(track.initialPosition.position) {
        return new Cartesian3(
            track.initialPosition.position.x,
            track.initialPosition.position.y,
            track.initialPosition.position.z  
        );
    }
}

function getOrientation(track) {
    return {
        heading: parseFloat(track.initialPosition.heading),
        pitch: parseFloat(track.initialPosition.pitch),
        roll: parseFloat(track.initialPosition.roll)
    }
}

export default {
    getDestination,
    getOrientation
}