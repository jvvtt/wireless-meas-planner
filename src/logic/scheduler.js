import { ACTION_TYPES, ACTORS } from "../constants/constants";
import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { useContext } from "react";
import { useFilters } from "../hooks/useFilters.js";
import { cosineDistanceBetweenPoints } from "../logic/utils.js";

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
  const { filters, getDroneGimbalYaw, getGNDGimbalYaw, getGndGimbalPitch } =
    useFilters();
  const { gndmarkers } = useContext(GroundMarkersContext);

  const droneYaws = getDroneGimbalYaw(markers, gndmarkers); //uses active ground
  const gndPitches = getGndGimbalPitch(markers, gndmarkers);

  let initialSchedulerState = {
    DRONE_OPERATOR: [],
    SOFTWARE_OPERATOR: [],
    DRIVER_OPERATOR: [],
  };

  markers.map((marker, cnt) => {
    const gndYaws = getGNDGimbalYaw(gndmarkers, marker);

    const gndyaw = gndYaws?.gndGimbalYaw?.toFixed(2);
    const gndpitch = gndPitches[cnt];
    const droneyaw = droneYaws[cnt]?.droneGimbalYaw?.toFixed(2);
    const dronepitch = -gndpitch;

    // Time duration from this to previous, given the chosen (actual) drone speed
    const duration = Number(
      (marker.distToPrevious / filters.droneSpeed).toFixed(1)
    );

    /* Approx. distance between gnd and the first or last marker; from there
        compute time duration of flight given the chosen (actual) drone speed */
    let markerGroundDuration;

    /* ACTIONS FOR THE LAST DRONE LOCATION */
    if (cnt === markers.length - 1 && markers.length > 1) {
      //----------------------------------------------------------------
      // DRONE OPERATOR
      initialSchedulerState.DRONE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
          actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
            cnt,
            cnt + 1,
            filters.droneHeight
          ),
          actionDuration: duration,
        },
      ]);

      // SOFTWARE OPERATOR
      initialSchedulerState.SOFTWARE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.NO_ACTION.NAME,
          actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
          actionDuration: duration,
        },
      ]);

      // DRIVER OPERATOR
      initialSchedulerState.DRIVER_OPERATOR.push([
        {
          actionType: ACTION_TYPES.NO_ACTION.NAME,
          actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
          actionDuration: duration,
        },
      ]);

      // ----------------------------------------------------------------
      // DRONE OPERATOR
      initialSchedulerState.DRONE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
          actionDescription:
            ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
              cnt + 1,
              filters.droneHeight
            ),
          actionDuration: filters.droneHoverTime,
        },
      ]);

      // SOFTWARE OPERATOR
      initialSchedulerState.SOFTWARE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.SHORT_DESCRIPTION(
              gndyaw,
              gndpitch
            ),
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180),
        },
      ]);

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.SHORT_DESCRIPTION(
            droneyaw,
            dronepitch
          ),
        actionDuration:
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(180),
      });

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.SHORT_DESCRIPTION,
        actionDuration:
          filters.droneHoverTime -
          ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.PRESET_DURATION -
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(
            180
          ) -
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180) -
          ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
      });

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.SHORT_DESCRIPTION,
        actionDuration: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
      });

      // DRIVER OPERATOR
      initialSchedulerState.DRIVER_OPERATOR.push([
        {
          actionType: ACTION_TYPES.NO_ACTION.NAME,
          actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
          actionDuration: filters.droneHoverTime,
        },
      ]);

      // --------------------------
      if (gndmarkers.length > 0 && filters.gndActiveIdx !== null) {
        markerGroundDuration = (
          cosineDistanceBetweenPoints(
            marker.lat,
            marker.lng,
            gndmarkers[filters.gndActiveIdx].lat,
            gndmarkers[filters.gndActiveIdx].lng
          ) / filters.droneSpeed
        ).toFixed(2);

        // DRONE OPERATOR
        initialSchedulerState.DRONE_OPERATOR.push([
          {
            actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
            actionDescription:
              ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                markers.length,
                "GND",
                filters.droneHeight
              ),
            actionDuration: markerGroundDuration,
          },
        ]);

        // SOFTWARE OPERATOR
        initialSchedulerState.SOFTWARE_OPERATOR.push([
          {
            actionType: ACTION_TYPES.NO_ACTION.NAME,
            actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
            actionDuration: markerGroundDuration,
          },
        ]);

        // DRIVER OPERATOR
        initialSchedulerState.DRIVER_OPERATOR.push([
          {
            actionType: ACTION_TYPES.NO_ACTION.NAME,
            actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
            actionDuration: markerGroundDuration,
          },
        ]);
      }

      /* ACTIONS FOR THE FIRST DRONE LOCATION */
    } else if (cnt === 0) {
      //----------------------------------------------------------------
      if (gndmarkers.length > 0 && filters.gndActiveIdx !== null) {
        markerGroundDuration = (
          cosineDistanceBetweenPoints(
            marker.lat,
            marker.lng,
            gndmarkers[filters.gndActiveIdx].lat,
            gndmarkers[filters.gndActiveIdx].lng
          ) / filters.droneSpeed
        ).toFixed(2);

        // DRONE OPERATOR
        initialSchedulerState.DRONE_OPERATOR.push([
          {
            actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
            actionDescription:
              ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                "GND",
                1,
                filters.droneHeight
              ),
            actionDuration: markerGroundDuration,
          },
        ]);

        // SOFTWARE OPERATOR
        initialSchedulerState.SOFTWARE_OPERATOR.push([
          {
            actionType: ACTION_TYPES.NO_ACTION.NAME,
            actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
            actionDuration: markerGroundDuration,
          },
        ]);

        // DRIVER OPERATOR
        initialSchedulerState.DRIVER_OPERATOR.push([
          {
            actionType: ACTION_TYPES.NO_ACTION.NAME,
            actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
            actionDuration: markerGroundDuration,
          },
        ]);
      }

      //----------------------------------------------------------------
      // DRONE OPERATOR
      initialSchedulerState.DRONE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
          actionDescription:
            ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
              1,
              filters.droneHeight
            ),
          actionDuration: filters.droneHoverTime,
        },
      ]);

      // SOFTWARE OPERATOR
      initialSchedulerState.SOFTWARE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.SHORT_DESCRIPTION(
              gndyaw,
              gndpitch
            ),
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180),
        },
      ]);

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.SHORT_DESCRIPTION(
            droneyaw,
            dronepitch
          ),
        actionDuration:
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(180),
      });

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.SHORT_DESCRIPTION,
        actionDuration:
          filters.droneHoverTime -
          ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.PRESET_DURATION -
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(
            180
          ) -
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180) -
          ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
      });

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.SHORT_DESCRIPTION,
        actionDuration: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
      });

      // DRIVER OPERATOR
      initialSchedulerState.DRIVER_OPERATOR.push([
        {
          actionType: ACTION_TYPES.NO_ACTION.NAME,
          actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
          actionDuration: filters.droneHoverTime,
        },
      ]);

      /* ACTIONS FOR THE ALL THE OTHER DRONE LOCATIONS */
    } else {
      //-------------------------------------------------------
      // DRONE OPERATOR
      initialSchedulerState.DRONE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
          actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
            cnt,
            cnt + 1,
            filters.droneHeight
          ),
          actionDuration: duration,
        },
      ]);

      // SOFTWARE OPERATOR
      initialSchedulerState.SOFTWARE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.NO_ACTION.NAME,
          actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
          actionDuration: duration,
        },
      ]);

      // DRIVER OPERATOR
      initialSchedulerState.DRIVER_OPERATOR.push([
        {
          actionType: ACTION_TYPES.NO_ACTION.NAME,
          actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
          actionDuration: duration,
        },
      ]);

      //----------------------------------------------------------------------
      // DRONE OPERATOR
      initialSchedulerState.DRONE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
          actionDescription:
            ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
              cnt + 1,
              filters.droneHeight
            ),
          actionDuration: filters.droneHoverTime,
        },
      ]);

      // SOFTWARE OPERATOR
      initialSchedulerState.SOFTWARE_OPERATOR.push([
        {
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.SHORT_DESCRIPTION(
              gndyaw,
              gndpitch
            ),
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180),
        },
      ]);

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.SHORT_DESCRIPTION(
            droneyaw,
            dronepitch
          ),
        actionDuration:
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(180),
      });

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.SHORT_DESCRIPTION,
        actionDuration:
          filters.droneHoverTime -
          ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.PRESET_DURATION -
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(
            180
          ) -
          ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180) -
          ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
      });

      initialSchedulerState.SOFTWARE_OPERATOR[
        initialSchedulerState.SOFTWARE_OPERATOR.length - 1
      ].push({
        actionType: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.NAME,
        actionDescription:
          ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.SHORT_DESCRIPTION,
        actionDuration: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
      });

      // DRIVER OPERATOR
      initialSchedulerState.DRIVER_OPERATOR.push([
        {
          actionType: ACTION_TYPES.NO_ACTION.NAME,
          actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
          actionDuration: filters.droneHoverTime,
        },
      ]);
    }
  });

  return { initialSchedulerState };
}

export function useMeasurementSeqOrderB({ seq }) {
  // Order B : Height > GND > Drone
  const { markers } = useContext(DroneMarkersContext);
  const { gndmarkers } = useContext(GroundMarkersContext);

  const { filters, getDroneGimbalYaw, getGNDGimbalYaw, getGndGimbalPitch } =
    useFilters();

  const droneYaws = getDroneGimbalYaw(markers, gndmarkers); //uses active ground
  const gndPitches = getGndGimbalPitch(markers, gndmarkers);

  let initialSchedulerState = {
    DRONE_OPERATOR: [],
    SOFTWARE_OPERATOR: [],
    DRIVER_OPERATOR: [],
  };

  let actionMoveDroneDuration, actionMoveGndDuration;

  for (let d = 0; d < markers.length; d++) {
    for (let g = 0; g < gndmarkers.length; g++) {
      for (let h = 0; h < filters.droneHeights.length; h++) {
        if (d === 0) {
          actionMoveDroneDuration = (
            cosineDistanceBetweenPoints(
              markers[d].lat,
              markers[d].lng,
              gndmarkers[g].lat,
              gndmarkers[g].lng
            ) / filters.droneSpeed
          ).toFixed(1);
        } else if (d > 0) {
          actionMoveDroneDuration = markers[d].distToPrevious.toFixed(1);
        }
        if (g === 0) {
          // Change this to get the time it takes the ground station to move from an "initial unknown point to
          // the first place it will visit.
          actionMoveGndDuration = actionMoveDroneDuration;
        } else if (g > 0) {
          actionMoveGndDuration = gndmarkers[g].distToPrevious.toFixed(1);
        }

        //------------------------------------------------
        // DRONE OPERATOR
        initialSchedulerState.DRONE_OPERATOR.push([
          {
            actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
            actionDescription:
              ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                d,
                d + 1,
                filters.droneHeights[h]
              ),
            actionDuration: actionMoveDroneDuration,
          },
        ]);

        // SOFTWARE OPERATOR
        initialSchedulerState.SOFTWARE_OPERATOR.push([
          {
            actionType: ACTION_TYPES.NO_ACTION.NAME,
            actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
            actionDuration: Math.max(
              actionMoveDroneDuration,
              actionMoveGndDuration
            ),
          },
        ]);

        // DRIVER OPERATOR
        initialSchedulerState.DRIVER_OPERATOR.push([
          {
            actionType: ACTION_TYPES.DRIVER_OPERATOR.MOVE.NAME,
            actionDescription:
              ACTION_TYPES.DRIVER_OPERATOR.MOVE.SHORT_DESCRIPTION(g, g + 1),
            actionDuration: actionMoveGndDuration,
          },
        ]);

        //----------------------------------------------------------------
        // DRONE OPERATOR
        initialSchedulerState.DRONE_OPERATOR.push([
          {
            actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
            actionDescription:
              ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
                1,
                filters.droneHeight
              ),
            actionDuration: filters.droneHoverTime,
          },
        ]);

        // SOFTWARE OPERATOR
        initialSchedulerState.SOFTWARE_OPERATOR.push([
          {
            actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.NAME,
            actionDescription:
              ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.SHORT_DESCRIPTION(
                gndyaw,
                gndpitch
              ),
            actionDuration:
              ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(
                180
              ),
          },
        ]);

        initialSchedulerState.SOFTWARE_OPERATOR[
          initialSchedulerState.SOFTWARE_OPERATOR.length - 1
        ].push({
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.SHORT_DESCRIPTION(
              droneyaw,
              dronepitch
            ),
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(
              180
            ),
        });

        initialSchedulerState.SOFTWARE_OPERATOR[
          initialSchedulerState.SOFTWARE_OPERATOR.length - 1
        ].push({
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.SHORT_DESCRIPTION,
          actionDuration:
            filters.droneHoverTime -
            ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.PRESET_DURATION -
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(
              180
            ) -
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(
              180
            ) -
            ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
        });

        initialSchedulerState.SOFTWARE_OPERATOR[
          initialSchedulerState.SOFTWARE_OPERATOR.length - 1
        ].push({
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.SHORT_DESCRIPTION,
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
        });

        // DRIVER OPERATOR
        initialSchedulerState.DRIVER_OPERATOR.push([
          {
            actionType: ACTION_TYPES.NO_ACTION.NAME,
            actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
            actionDuration: filters.droneHoverTime,
          },
        ]);
      }
    }
  }
}
