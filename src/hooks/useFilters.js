import { FiltersContext } from "../context/filters.jsx";
import { useContext } from "react";
import {
  DRONE_HEADING_TYPES,
  drone_heading_to_next_marker,
  drone_yaw_to_set,
  gnd_yaw_to_set,
  cosineDistanceBetweenPoints,
} from "../logic/utils.js";
import { destination, bearing } from "leaflet-geometryutil";
import { latLng } from "leaflet";

export function useFilters() {
  const { filters, setFiltersState } = useContext(FiltersContext);

  const timeToPrevious = (points, node) => {
    const kmh2ms = 1000 / 3600;
    return points.map((point) => {
      return node === "DRONE"
        ? point.distToPrevious / filters.droneSpeed
        : point.distToPrevious / (filters.gndSpeed * kmh2ms);
    });
  };

  const distsDroneGnd = (drone_points, ground_points) => {
    if (filters.gndActiveIdx !== null) {
      return drone_points.map((drone_point) => {
        return cosineDistanceBetweenPoints(
          drone_point.lat,
          drone_point.lng,
          ground_points[filters.gndActiveIdx].lat,
          ground_points[filters.gndActiveIdx].lng
        ).toFixed(1);
      });
    } else {
      return Array(drone_points.length).fill(0);
    }
  };

  const getGndGimbalPitch = (drone_points, ground_points) => {
    if (filters.gndActiveIdx !== null) {
      const dists = distsDroneGnd(drone_points, ground_points);
      return dists.map((dist) => {
        return (
          (Math.atan2(Number(filters.droneHeight), Number(dist)) * 180) /
          Math.PI
        ).toFixed(1);
      });
    } else {
      return Array(drone_points.length).fill(0);
    }
  };
  
  const getDroneGimbalYaw = (drone_points, ground_points) => {
    const lengthDirections = 35;
    if (filters.gndActiveIdx === null || 
      drone_points.length === 0 ||
      ground_points.length === 0 || 
      drone_points === undefined || 
      drone_points === null || 
      ground_points === null || ground_points === undefined) {
      return drone_points.map((point) => ({
        droneGimbalYaw: 0,
        droneHeadingBearing: 0,
        lineGimbalDirection: [
          [point.lat, point.lng],
          [point.lat, point.lng],
        ],
        lineDroneHeading: [
          [point.lat, point.lng],
          [point.lat, point.lng],
        ],
      }));
    } else {
      let drone_angle_info;
      if (filters.droneHeadingType === DRONE_HEADING_TYPES.NEXT_COORD) {
        drone_angle_info = drone_points.map((entry, cnt) => {
          let nextCoords;

          if (cnt < drone_points.length - 1) {
            nextCoords = latLng(
              drone_points[cnt + 1].lat,
              drone_points[cnt + 1].lng
            );
          } else {
            nextCoords = latLng(
              ground_points[filters.gndActiveIdx].lat,
              ground_points[filters.gndActiveIdx].lng
            );
          }

          const groundCoords = latLng(
            ground_points[filters.gndActiveIdx].lat,
            ground_points[filters.gndActiveIdx].lng
          );
          const thisCoords = latLng(entry.lat, entry.lng);

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

          const drone_gimbal_yaw_heading_point = destination(
            thisCoords,
            drone_gimbal_yaw_wrt_drone_head + droneHeadingBearing,
            lengthDirections
          );
          const line_gimbal_direction = [
            [entry.lat, entry.lng],
            [
              drone_gimbal_yaw_heading_point.lat,
              drone_gimbal_yaw_heading_point.lng,
            ],
          ];

          const drone_heading_point = destination(
            thisCoords,
            droneHeadingBearing,
            lengthDirections
          );

          const line_drone_heading = [
            [entry.lat, entry.lng],
            [drone_heading_point.lat, drone_heading_point.lng],
          ];

          return {
            droneGimbalYaw: drone_gimbal_yaw_wrt_drone_head,
            droneHeadingBearing: droneHeadingBearing,
            lineGimbalDirection: line_gimbal_direction,
            lineDroneHeading: line_drone_heading,
          };
        });
      } else if (filters.droneHeadingType === DRONE_HEADING_TYPES.GROUND_NODE) {
        drone_angle_info = drone_points.map((entry) => {
          const thisCoords = latLng(entry.lat, entry.lng);

          const droneHeadingBearing = bearing(
            thisCoords,
            latLng(
              ground_points[filters.gndActiveIdx].lat,
              ground_points[filters.gndActiveIdx].lng
            )
          );

          const drone_gimbal_yaw_heading_point = destination(
            thisCoords,
            droneHeadingBearing,
            lengthDirections
          );
          const line_gimbal_direction = [
            [entry.lat, entry.lng],
            [
              drone_gimbal_yaw_heading_point.lat,
              drone_gimbal_yaw_heading_point.lng,
            ],
          ];

          const drone_heading_point = destination(
            thisCoords,
            droneHeadingBearing,
            lengthDirections
          );
          const line_drone_heading = [
            [entry.lat, entry.lng],
            [drone_heading_point.lat, drone_heading_point.lng],
          ];
          return {
            droneGimbalYaw: 0,
            droneHeadingBearing: droneHeadingBearing,
            lineGimbalDirection: line_gimbal_direction,
            lineDroneHeading: line_drone_heading,
          };
        });
      }
      return drone_angle_info;
    }
  };

  const getGNDGimbalYaw = (gnd_points, drone_point) => {
    const lengthDirections = 35;
    let gnd_info;
    if (
      filters.gndActiveIdx === null ||
      filters.poiGndHeading.length === 0 ||
      drone_point === undefined ||
      drone_point === null ||
      gnd_points.length === 0
    ) {
      gnd_info = {
        gndGimbalYaw: 0,
        gndHeadingBearing: 0,
        lineGimbalDirection: [
          [0, 0],
          [0, 0],
        ],
        lineGndHeading: [
          [0, 0],
          [0, 0],
        ],
      };
    } else {
      const point = gnd_points[filters.gndActiveIdx];
      const thisCoords = latLng(point.lat, point.lng);
      const poiCoords = latLng(
        filters.poiGndHeading[0],
        filters.poiGndHeading[1]
      );

      const droneCoords = latLng(drone_point.lat, drone_point.lng);
      const gndHeadingBearing = bearing(thisCoords, poiCoords);

      const gnd_gimbal_yaw_wrt_gnd_head = gnd_yaw_to_set(
        thisCoords,
        droneCoords,
        gndHeadingBearing
      );

      const gnd_gimbal_yaw_heading_point = destination(
        thisCoords,
        gnd_gimbal_yaw_wrt_gnd_head + gndHeadingBearing,
        lengthDirections
      );

      const line_gimbal_direction = [
        [point.lat, point.lng],
        [gnd_gimbal_yaw_heading_point.lat, gnd_gimbal_yaw_heading_point.lng],
      ];

      const gnd_heading_point = destination(
        thisCoords,
        gndHeadingBearing,
        lengthDirections
      );

      const line_gnd_heading = [
        [point.lat, point.lng],
        [gnd_heading_point.lat, gnd_heading_point.lng],
      ];

      gnd_info = {
        gndGimbalYaw: gnd_gimbal_yaw_wrt_gnd_head,
        gndHeadingBearing: gndHeadingBearing,
        lineGimbalDirection: line_gimbal_direction,
        lineGndHeading: line_gnd_heading,
      };
    }
    return gnd_info;
  };

  return {
    setFiltersState,
    timeToPrevious,
    filters,
    getDroneGimbalYaw,
    getGNDGimbalYaw,
    distsDroneGnd,
    getGndGimbalPitch,
  };
}
