import { ACTION_TYPES, ACTORS } from "../constants/constants";
import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { useContext } from "react";
import { useFilters } from "./useFilters.js";
import { cosineDistanceBetweenPoints } from "../logic/utils.js";

const MEAS_SEQUENCES = {
  SEQUENCE_FAH: {
    NAME: "FAH",
    ACRONYM: "First Azimuth then Height",
    DESCRIPTION:
      "Drone reaches first waypoint at a given height, then continues to the next waypoint at the same height, and so does with all the waypoints. Once the last waypoint is reached (assuming battery is enough) it goes back to the first waypoint at the next height, and repeats the process until all waypoints and heights are reached.",
  },
  SEQUENCE_FHA: {
    NAME: "FHA",
    ACRONYM: "First Height then Azimuth",
    DESCRIPTION:
      "Drone reaches first waypoint at a given height. At the same waypoint moves to the next height. Repeats this process until it reaches the last height for that waypoint. Then moves to the next waypoint and continues the process.",
  },
};

// Group of ordered simultaneous actions (GOSA)
const GOSA = [
  [
    {
      ACTION_NAME: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
      OPERATOR: ACTORS.DRONE_OPERATOR,
    },
  ],
  [
    {
      ACTION_NAME: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
      OPERATOR: ACTORS.DRONE_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.NAME,
      OPERATOR: ACTORS.SOFTWARE_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.NAME,
      OPERATOR: ACTORS.SOFTWARE_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.NAME,
      OPERATOR: ACTORS.SOFTWARE_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.NAME,
      OPERATOR: ACTORS.SOFTWARE_OPERATOR,
    },
  ],
];

export function findSiblingsInGOSA(actionName) {
  const idxsSiblings = findIdxInGOSA(actionName);
  const sao = GOSA.filter((SAO, cnt) => idxsSiblings[cnt])[0];
  return sao.filter((AO) => AO.ACTION_NAME !== actionName);
}

export function findIdxInGOSA(actionName) {
  return GOSA.map((SAO) => {
    const AO = SAO.filter(
      (actionObject) => actionObject.ACTION_NAME === actionName
    );
    // The length of AO should be exactly 1, as an AO must not be repeated in a single SAO.
    if (AO.length === 1) {
      return true;
    } else if (AO.length > 1) {
      console.log("DEBUG: Multiple AO of the same type in a single SAO");
    } else {
      return false;
    }
  });
}

export function useMeasurementSeqCase1() {
  const { markers } = useContext(DroneMarkersContext);
  const { filters } = useFilters();
  const { gndmarkers } = useContext(GroundMarkersContext);

  let initialSchedulerState = {
    DRONE_OPERATOR: [],
    SOFTWARE_OPERATOR: [],
    DRIVER_OPERATOR: [],
  };

  /*ACTIONS FOR THE DRONE OPERATOR*/
  markers.map((marker, cnt) => {
    // Time duration from this to previous, given the chosen (actual) drone speed
    const duration = (marker.distToPrevious / filters.droneSpeed).toFixed(2);

    /* Approx. distance between gnd and the first or last marker; from there
        compute time duration of flight given the chosen (actual) drone speed */
    let markerGroundDuration;

    /* ACTIONS FOR THE LAST DRONE LOCATION */
    if (cnt === markers.length - 1 && markers.length > 1) {
      // DRONE OPERATOR
      initialSchedulerState.DRONE_OPERATOR.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
          cnt,
          cnt + 1,
          filters.droneHeight
        ),
        actionDuration: duration,
      });
      // SOFTWARE OPERATOR
      initialSchedulerState.SOFTWARE_OPERATOR.push({
        actionType: ACTION_TYPES.NO_ACTION.NAME,
        actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
        actionDuration: duration,
      });
      // DRIVER OPERATOR
      initialSchedulerState.DRIVER_OPERATOR.push({
        actionType: ACTION_TYPES.NO_ACTION.NAME,
        actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
        actionDuration: duration,
      });

      // DRONE OPERATOR
      initialSchedulerState.DRONE_OPERATOR.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
          cnt + 1,
          filters.droneHeight
        ),
        actionDuration: filters.droneHoverTime,
      });

      // SOFTWARE OPERATOR
      initialSchedulerState.SOFTWARE_OPERATOR.push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.SHORT_DESCRIPTION(
            yaw,
            pitch
          ),
        actionDuration:
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180),
      });
      // DRIVER OPERATOR

      //
      if (gndmarkers.length > 0 && filters.gndActiveIdx !== null) {
        markerGroundDuration = (
          cosineDistanceBetweenPoints(
            marker.lat,
            marker.lng,
            gndmarkers[filters.gndActiveIdx].lat,
            gndmarkers[filters.gndActiveIdx].lng
          ) / filters.droneSpeed
        ).toFixed(2);

        initialSchedulerState.DRONE_OPERATOR.push({
          actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
          actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
            markers.length,
            "GND",
            filters.droneHeight
          ),
          actionDuration: markerGroundDuration,
        });
      }

      /* ACTIONS FOR THE FIRST DRONE LOCATION */
    } else if (cnt === 0) {
      if (gndmarkers.length > 0 && filters.gndActiveIdx !== null) {
        markerGroundDuration = (
          cosineDistanceBetweenPoints(
            marker.lat,
            marker.lng,
            gndmarkers[filters.gndActiveIdx].lat,
            gndmarkers[filters.gndActiveIdx].lng
          ) / filters.droneSpeed
        ).toFixed(2);

        initialSchedulerState.DRONE_OPERATOR.push({
          actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
          actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
            "GND",
            1,
            filters.droneHeight
          ),
          actionDuration: markerGroundDuration,
        });
      }

      initialSchedulerState.DRONE_OPERATOR.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
          1,
          filters.droneHeight
        ),
        actionDuration: filters.droneHoverTime,
      });

      /* ACTIONS FOR THE ALL THE OTHER DRONE LOCATIONS */
    } else {
      initialSchedulerState.DRONE_OPERATOR.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
          cnt,
          cnt + 1,
          filters.droneHeight
        ),
        actionDuration: duration,
      });

      initialSchedulerState.DRONE_OPERATOR.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
          cnt + 1,
          filters.droneHeight
        ),
        actionDuration: filters.droneHoverTime,
      });
    }
  });

  return { initialSchedulerState };
}
