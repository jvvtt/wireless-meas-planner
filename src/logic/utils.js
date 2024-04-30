import GeometryUtil from "leaflet-geometryutil";
import { destination, bearing } from "leaflet-geometryutil";
import { latLng } from "leaflet";

export const DRAW_ACTION_TYPES = {
  ADD_MARKER: "ADD_MARKER",
  EDIT_MARKER: "EDIT_MARKER",
  DELETE: "DELETE_ALL",
};

export const DRONE_HEADING_TYPES = {
  NEXT_COORD: "next-coordinate",
  GROUND_NODE: "ground-node",
};

/**
 *
 * @param {numeric} b - Bearing angle from drone to ground. Lies in [-180, 180]
 * @param {numeric} a - Bearing angle from drone to its heading direction. Lies in [-180, 180]
 * @returns {numeric} y - Yaw to set in drone gimbal w.r.t. the drone heading direction.
 */

export function yaw_from_bearings(b, a) {
  let y = 0;

  if (a > 0 && a < 90 && b < 0 && b < -90) {
    y = 360 - (a - b);
  } else if (a > 0 && a > 90 && b < 0 && b < -90) {
    y = 360 - (a - b);
  } else if (a < 0 && a < -90 && b > 0 && b > 90) {
    y = b - a - 360;
  } else {
    y = b - a;
  }

  return y;
}

/**
 *
 * @param {L.latLng} droneCoords  - Drone coordinates in a Leaflet LatLng object
 * @param {L.latLng} groundCoords - Ground coordinates in a Leaflet LatLng object
 * @param {numeric} droneHeading - Bearing angle from drone to its heading direction. Lies in [-180, 180]. This is the usual heading direction of a node: angle between the north and where the noide is pointing.
 * @returns {numeric} - Yaw angle in degrees to set in gimbal drone. Measured w.r.t. drone heading direction, WHICH IS THE 0 ANGLE FOR THE GIMBAL REFERENCE SYSTEM.
 */
export function drone_yaw_to_set(droneCoords, groundCoords, droneHeading) {
  const b = GeometryUtil.bearing(droneCoords, groundCoords);
  let yaw = yaw_from_bearings(b, droneHeading);

  if (yaw > 180) {
    yaw = yaw - 360;
  } else if (yaw < -180) {
    yaw = yaw + 360;
  }
  return yaw;
}

/**
 *
 * @param {L.latLng} gndCoords  - Gnd coordinates in a Leaflet LatLng object
 * @param {L.latLng} droneCoords - Drone coordinates in a Leaflet LatLng object
 * @param {numeric} gndHeading - Bearing angle from drone to its heading direction. Lies in [-180, 180]. This is the usual heading direction of a node: angle between the north and where the noide is pointing.
 * @returns {numeric} - Yaw angle in degrees to set in gimbal drone. Measured w.r.t. drone heading direction, WHICH IS THE 0 ANGLE FOR THE GIMBAL REFERENCE SYSTEM.
 */
export function gnd_yaw_to_set(gndCoords, droneCoords, gndHeading) {
  const b = GeometryUtil.bearing(gndCoords, droneCoords);
  let yaw = yaw_from_bearings(b, gndHeading);

  if (yaw > 180) {
    yaw = yaw - 360;
  } else if (yaw < -180) {
    yaw = yaw + 360;
  }
  return yaw;
}

/**
 * Computes the drone heading in the specific case where the drone heads to next marker on the map.
 * The heading direction of the drone is then point to the next marker on the map.
 * @param {L.latLng} thisCoords - This marker coordinates in a Leaflet LatLng object
 * @param {L.latLng} nextCoords - Next marker coordinates in a Leaflet LatLng object
 * @returns {number} - Bearing angle from this marker to the next marker on the map
 */
export function drone_heading_to_next_marker(thisCoords, nextCoords) {
  return GeometryUtil.bearing(thisCoords, nextCoords);
}

/**
 *
 * @param {numeric} beta  - Bearing angle in degrees for two coordinates
 * @returns Angle in degrees w.r.t North of the direction perpendicular to the line segment between the two coordinates considered for the angle 'beta'
 */
const anglesForMarkersExtendedLimits = (beta) => {
  let ang_clockwise = 0;
  let ang_counterclockwise = 0;

  // 1st cuadrant
  if (beta > 0 && beta <= 90) {
    ang_clockwise = beta + 90;
    ang_counterclockwise = beta - 90;
  }
  // 2nd cuadrant
  if (beta < 0 && beta >= -90) {
    ang_clockwise = beta + 90;
    ang_counterclockwise = beta - 90;
  }
  // 3rd cuadrant
  if (beta < 0 && beta < -90) {
    ang_clockwise = 360 + beta - 90;
    ang_counterclockwise = beta + 90;
  }
  // 4th cuadrant
  if (beta > 0 && beta > 90) {
    ang_clockwise = beta - 90;
    ang_counterclockwise = beta + 90 - 360;
  }

  return { ang_clockwise, ang_counterclockwise };
};

/**
 * Computes a rectangle enclosing the line segment between two points.
 * The width of the rectangle is controlled by the parameter 'd'.
 * @param {numeric} d - Distance {m] between two coordinates
 * @param {L.latLng} thisCoords - Coordinates of source point
 * @param {L.latLng} nextCoords - Coordinates of destination point
 * @returns
 */

export const computeRectangle = (d, thisCoords, nextCoords) => {
  const beta = GeometryUtil.bearing(thisCoords, nextCoords);

  const { ang_clockwise, ang_counterclockwise } =
    anglesForMarkersExtendedLimits(beta);

  const this_point_clockwise = GeometryUtil.destination(
    thisCoords,
    ang_clockwise,
    d
  );
  const this_point_counterclockwise = GeometryUtil.destination(
    thisCoords,
    ang_counterclockwise,
    d
  );

  const next_point_clockwise = GeometryUtil.destination(
    nextCoords,
    ang_clockwise,
    d
  );
  const next_point_counterclockwise = GeometryUtil.destination(
    nextCoords,
    ang_counterclockwise,
    d
  );

  return {
    this_point_clockwise,
    this_point_counterclockwise,
    next_point_clockwise,
    next_point_counterclockwise,
  };
};

/**
 * Approximate distance between two coordinates, when not high precision is requried
 * @param {*} lat1
 * @param {*} lon1
 * @param {*} lat2
 * @param {*} lon2
 * @returns
 */
export function cosineDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const deltaP = p2 - p1;
  const deltaLon = lon2 - lon1;
  const deltaLambda = (deltaLon * Math.PI) / 180;
  const a =
    Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) *
      Math.cos(p2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
  return d;
}

export function convertSeconds(initial, seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let hourInitial = initial?.split(":")[0];
  let minInitial = initial?.split(":")[1];
  let secInitial = initial?.split(":")[2];

  let hourFinal = Number(hourInitial) + hours;
  let minFinal = Number(minInitial) + minutes;
  let secFinal = Number(secInitial) + remainingSeconds;

  // Assuming it wont go beyond the one day
  if (minFinal > 60) {
    minFinal = minFinal - 60;
    hourFinal = hourFinal + 1;
  }
  if (secFinal > 60) {
    secFinal = secFinal - 60;
    minFinal = minFinal + 1;
  }

  return `${hourFinal}:${minFinal}:${secFinal.toFixed(0)}`;
}

export const dists_drone_gnd = (drone_point, ground_point) => {
  if (
    drone_point !== null ||
    drone_point !== undefined ||
    ground_point !== null ||
    ground_point !== undefined
  ) {
    return cosineDistanceBetweenPoints(
      drone_point.lat,
      drone_point.lng,
      ground_point.lat,
      ground_point.lng
    ).toFixed(1);
  } else {
    return 0;
  }
};

export const get_gnd_gimbal_pitch = (
  drone_point,
  ground_point,
  drone_height
) => {
  if (
    drone_point !== null ||
    drone_point !== undefined ||
    ground_point !== null ||
    ground_point !== undefined ||
    drone_height !== null ||
    drone_height !== undefined
  ) {
    const dist = dists_drone_gnd(drone_point, ground_point);
    return (
      (Math.atan2(Number(drone_height), Number(dist)) * 180) /
      Math.PI
    ).toFixed(1);
  } else {
    return 0;
  }
};

export const get_drone_gimbal_yaw = (
  drone_point,
  ground_point,
  drone_next_point,
  drone_point_idx,
  drone_heading_type,
  n_drone_points
) => {
  if (
    drone_point === null ||
    drone_point === undefined ||
    ground_point === null ||
    ground_point === undefined ||
    drone_next_point === null ||
    drone_next_point === undefined
  ) {
    return 0;
  } else {
    if (drone_heading_type === DRONE_HEADING_TYPES.NEXT_COORD) {
      let nextCoords;
      if (drone_point_idx < n_drone_points - 1) {
        nextCoords = latLng(drone_next_point.lat, drone_next_point.lng);
      } else {
        nextCoords = latLng(ground_point.lat, ground_point.lng);
      }

      const groundCoords = latLng(ground_point.lat, ground_point.lng);
      const thisCoords = latLng(drone_point.lat, drone_point.lng);

      const droneHeadingBearing = drone_heading_to_next_marker(
        thisCoords,
        nextCoords
      );

      // SAVE THIS VALUE
      const drone_gimbal_yaw_wrt_drone_head = drone_yaw_to_set(
        thisCoords,
        groundCoords,
        droneHeadingBearing
      );

      return drone_gimbal_yaw_wrt_drone_head.toFixed(1);
    } else if (drone_heading_type === DRONE_HEADING_TYPES.GROUND_NODE) {
      return 0;
    }
  }
};

export const get_gnd_gimbal_yaw = (ground_point, drone_point, poi_point) => {
  if (
    drone_point === null ||
    drone_point === undefined ||
    ground_point === null ||
    ground_point === undefined ||
    poi_point === null ||
    poi_point === undefined
  ) {
    return 0;
  } else {
    const thisCoords = latLng(ground_point.lat, ground_point.lng);
    const poiCoords = latLng(poi_point[0], poi_point[1]);

    const droneCoords = latLng(drone_point.lat, drone_point.lng);
    const gndHeadingBearing = bearing(thisCoords, poiCoords);

    const gnd_gimbal_yaw_wrt_gnd_head = gnd_yaw_to_set(
      thisCoords,
      droneCoords,
      gndHeadingBearing
    );

    return gnd_gimbal_yaw_wrt_gnd_head.toFixed(1);
  }
};
