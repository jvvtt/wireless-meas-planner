import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { ACTION_TYPES } from "../constants/constants.js";
import { useContext, useState } from "react";
import { useFilters } from "./useFilters.js";
import { cosineDistanceBetweenPoints } from "../logic/utils.js";

export function useSchedulerPreset() {
  const { markers } = useContext(DroneMarkersContext);
  const { filters } = useFilters();
  const { gndmarkers } = useContext(GroundMarkersContext);

  let initialSchedulerState = [];
  markers.map((marker, cnt) => {
    // Time duration from this to previous, given the chosen (actual) drone speed
    const duration = (marker.distToPrevious / filters.droneSpeed).toFixed(2);

    /* Approx. distance between gnd and the first or last marker; from there
        compute time duration of flight given the chosen (actual) drone speed */
    let markerGroundDuration;

    // Last marker
    if (cnt === markers.length - 1 && markers.length > 1) {
      initialSchedulerState.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
          cnt,
          cnt + 1,
          filters.droneHeight
        ),
        actionDuration: duration,
      });
      initialSchedulerState.push({
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

        initialSchedulerState.push({
          actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
          actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
            markers.length,
            "GND",
            filters.droneHeight
          ),
          actionDuration: markerGroundDuration,
        });
      }

      // First marker
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

        initialSchedulerState.push({
          actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
          actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
            "GND",
            1,
            filters.droneHeight
          ),
          actionDuration: markerGroundDuration,
        });
      }

      initialSchedulerState.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
          1,
          filters.droneHeight
        ),
        actionDuration: filters.droneHoverTime,
      });
      // Rest of the markers
    } else {
      initialSchedulerState.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
          cnt,
          cnt + 1,
          filters.droneHeight
        ),
        actionDuration: duration,
      });

      initialSchedulerState.push({
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
