import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { ACTION_TYPES } from "../constants/constants.js";
import { useContext } from "react";
import { useFilters } from "./useFilters.js";
import { cosineDistanceBetweenPoints } from "../logic/utils.js";

export function useSchedulerPreset() {
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

  /* ACTIONS FOR THE SOFTWARE OPERATOR*/
  initialSchedulerState.DRONE_OPERATOR.map((action, cnt) => {
    switch (action.actionType) {
      case ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME: {
        initialSchedulerState.SOFTWARE_OPERATOR.push({
          actionType: ACTION_TYPES.NO_ACTION.NAME,
          actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
          actionDuration: action.actionDuration,
        });
        break;
      }
      case ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME: {
        initialSchedulerState.SOFTWARE_OPERATOR.push({
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.SHORT_DESCRIPTION,
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(
              180
            ),
        });
        initialSchedulerState.SOFTWARE_OPERATOR.push({
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.SHORT_DESCRIPTION,
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180),
        });
        initialSchedulerState.SOFTWARE_OPERATOR.push({
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.SHORT_DESCRIPTION,
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.PRESET_DURATION,
        });
        initialSchedulerState.SOFTWARE_OPERATOR.push({
          actionType: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.NAME,
          actionDescription:
            ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.SHORT_DESCRIPTION,
          actionDuration:
            ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
        });
        break;
      }
    }
  });

  return { initialSchedulerState };
}
