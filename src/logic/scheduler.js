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

export function useMeasurementSeqOrderB() {
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
  let cntSteps = 0;
  let droneHeight = filters.droneHeights[0];
  let gndLocationNumber = 0;
  let droneHeightNumber = 0;

  for (let d = 0; d < markers.length; d++) {
    for (let g = 0; g < gndmarkers.length; g++) {
      for (let h = 0; h < filters.droneHeights.length; h++) {
        // Special behaviour for first position
        if (cntSteps === 0) {
          actionMoveDroneDuration = (
            cosineDistanceBetweenPoints(
              markers[0].lat,
              markers[0].lng,
              gndmarkers[0].lat,
              gndmarkers[0].lng
            ) / filters.droneSpeed
          ).toFixed(1);

          console.log(actionMoveDroneDuration);
          // DRONE OPERATOR
          initialSchedulerState.DRONE_OPERATOR.push([
            {
              actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
              actionDescription:
                ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                  "GND",
                  1,
                  droneHeight
                ),
              actionDuration: Number(actionMoveDroneDuration),
            },
          ]);

          // DRIVER OPERATOR
          // For first position, lets assume that drone takes longer time than ground for each other reaching their first positions.
          // This is easily done, by considering the start of the measurement after placing the ground in its first position.
          initialSchedulerState.DRIVER_OPERATOR.push([
            {
              actionType: ACTION_TYPES.DRIVER_OPERATOR.MOVE.NAME,
              actionDescription:
                ACTION_TYPES.DRIVER_OPERATOR.MOVE.SHORT_DESCRIPTION(g, g + 1),
              actionDuration: Number(actionMoveDroneDuration),
            },
          ]);

          // SOFTWARE OPERATOR
          initialSchedulerState.SOFTWARE_OPERATOR.push([
            {
              actionType: ACTION_TYPES.NO_ACTION.NAME,
              actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
              actionDuration: Number(actionMoveDroneDuration),
            },
          ]);

          // AFTER EACH MOVE ACTION DRONE DOES A HOVER ACTION AND THE SOFTWARE DOES MEASUREMENT ACTIONS
          initialSchedulerState = whileDroneHoverActions({
            initialSchedulerState: initialSchedulerState,
            gndyaw: 99,
            gndpitch: 99,
            droneyaw: 99,
            dronepitch: 99,
            droneHoverTime: filters.droneHoverTime,
            locationNumber: 1,
            thisHeight: filters.droneHeights[0],
          });

          // Other postitions
        } else {
          /*
          GET THE CORRECT HEIGHT: HEIGHT INDEX "h" DOES NOT RETRIEVE THE CORRECT HEIGHT FROM "filters.droneHeights" array
          CHECK DOCS ON THIS MEAS METHODOLOGY.
          */

          let conditionStatement = `if (`;

          for (
            let cntIfStatements = 0;
            cntIfStatements < filters.droneHeights.length;
            cntIfStatements++
          ) {
            if (cntIfStatements === filters.droneHeights.length - 1) {
              conditionStatement =
                conditionStatement +
                `(cntSteps % (2*filters.droneHeights.length) === ${cntIfStatements})`;
            } else {
              conditionStatement =
                conditionStatement +
                `(cntSteps % (2*filters.droneHeights.length) === ${cntIfStatements}) ||`;
            }
          }

          conditionStatement =
            conditionStatement +
            `){droneHeightNumber = h;droneHeight = filters.droneHeights[droneHeightNumber];}else{droneHeightNumber = filters.droneHeights.length-1-h;droneHeight = filters.droneHeights[droneHeightNumber];}`;

          eval(conditionStatement);

          /*
          GET THE CORRECT GROUND LOCATIONs: GROUND MARKER INDEX "g" DOES NOT RETRIEVE THE CORRECT Ground Location FROM "gndmarkers" array
          CHECK DOCS ON THIS MEAS METHODOLOGY.
          */
          conditionStatement = `if (`;

          for (
            let cntIfStatements = 0;
            cntIfStatements < filters.droneHeights.length * gndmarkers.length;
            cntIfStatements++
          ) {
            if (
              cntIfStatements ===
              filters.droneHeights.length * gndmarkers.length - 1
            ) {
              conditionStatement =
                conditionStatement +
                `(cntSteps % (2*filters.droneHeights.length*gndmarkers.length) === ${cntIfStatements})`;
            } else {
              conditionStatement =
                conditionStatement +
                `(cntSteps % (2*filters.droneHeights.length*gndmarkers.length) === ${cntIfStatements}) ||`;
            }
          }

          conditionStatement =
            conditionStatement +
            `){gndLocationNumber = g;}else{gndLocationNumber = gndmarkers.length-1-g;}`;

          eval(conditionStatement);

          if (
            cntSteps % (gndmarkers.length * filters.droneHeights.length) ===
            0
          ) {
            actionMoveDroneDuration = (
              markers[d].distToPrevious / filters.droneSpeed
            ).toFixed(1);

            // DRONE OPERATOR
            initialSchedulerState.DRONE_OPERATOR.push([
              {
                actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
                actionDescription:
                  ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                    d,
                    d + 1,
                    droneHeight
                  ),
                actionDuration: Number(actionMoveDroneDuration),
              },
            ]);

            // DRIVER OPERATOR
            initialSchedulerState.DRIVER_OPERATOR.push([
              {
                actionType: ACTION_TYPES.NO_ACTION.NAME,
                actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
                actionDuration: Number(actionMoveDroneDuration),
              },
            ]);

            // SOFTWARE OPERATOR
            initialSchedulerState.SOFTWARE_OPERATOR.push([
              {
                actionType: ACTION_TYPES.NO_ACTION.NAME,
                actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
                actionDuration: Number(actionMoveDroneDuration),
              },
            ]);

            // AFTER EACH MOVE ACTION DRONE DOES A HOVER ACTION AND THE SOFTWARE DOES MEASUREMENT ACTIONS
            initialSchedulerState = whileDroneHoverActions({
              initialSchedulerState: initialSchedulerState,
              gndyaw: 99,
              gndpitch: 99,
              droneyaw: 99,
              dronepitch: 99,
              droneHoverTime: filters.droneHoverTime,
              locationNumber: d,
              thisHeight: droneHeight,
            });
          } else if (
            cntSteps % filters.droneHeights.length === 0 &&
            cntSteps % (filters.droneHeights.length * gndmarkers.length) !== 0
          ) {
            actionMoveGndDuration = (
              gndmarkers[gndLocationNumber].distToPrevious /
              (filters.gndSpeed * (1000 / 3600))
            ).toFixed(1);

            // DRONE OPERATOR
            initialSchedulerState.DRONE_OPERATOR.push([
              {
                actionType: ACTION_TYPES.NO_ACTION.NAME,
                actionDescription: ACTION_TYPES.NO_ACTION.NAME,
                actionDuration: Number(actionMoveGndDuration),
              },
            ]);

            // DRIVER OPERATOR
            initialSchedulerState.DRIVER_OPERATOR.push([
              {
                actionType: ACTION_TYPES.DRIVER_OPERATOR.MOVE.NAME,
                actionDescription:
                  ACTION_TYPES.DRIVER_OPERATOR.MOVE.SHORT_DESCRIPTION(
                    gndLocationNumber,
                    gndLocationNumber + 1
                  ),
                actionDuration: Number(actionMoveGndDuration),
              },
            ]);

            // SOFTWARE OPERATOR
            initialSchedulerState.SOFTWARE_OPERATOR.push([
              {
                actionType: ACTION_TYPES.NO_ACTION.NAME,
                actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
                actionDuration: Number(actionMoveGndDuration),
              },
            ]);

            // AFTER EACH MOVE ACTION DRONE DOES A HOVER ACTION AND THE SOFTWARE DOES MEASUREMENT ACTIONS
            initialSchedulerState = whileDroneHoverActions({
              initialSchedulerState: initialSchedulerState,
              gndyaw: 99,
              gndpitch: 99,
              droneyaw: 99,
              dronepitch: 99,
              droneHoverTime: filters.droneHoverTime,
              locationNumber: d + 1,
              thisHeight: droneHeight,
            });
          } else if (cntSteps % filters.droneHeights.length !== 0) {
            actionMoveDroneDuration = (
              Math.abs(
                droneHeight - filters.droneHeights[droneHeightNumber - 1]
              ) / filters.droneSpeed
            ).toFixed(1);

            // DRONE OPERATOR
            initialSchedulerState.DRONE_OPERATOR.push([
              {
                actionType: ACTION_TYPES.DRONE_OPERATOR.CHANGE_HEIGHT.NAME,
                actionDescription:
                  ACTION_TYPES.DRONE_OPERATOR.CHANGE_HEIGHT.SHORT_DESCRIPTION(
                    d + 1,
                    filters.droneHeights[droneHeightNumber - 1],
                    droneHeight
                  ),
                actionDuration: Number(actionMoveDroneDuration),
              },
            ]);

            // DRIVER OPERATOR
            initialSchedulerState.DRIVER_OPERATOR.push([
              {
                actionType: ACTION_TYPES.NO_ACTION.NAME,
                actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
                actionDuration: Number(actionMoveDroneDuration),
              },
            ]);

            // SOFTWARE OPERATOR
            initialSchedulerState.SOFTWARE_OPERATOR.push([
              {
                actionType: ACTION_TYPES.NO_ACTION.NAME,
                actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
                actionDuration: Number(actionMoveDroneDuration),
              },
            ]);

            // AFTER EACH CHANGE HEIGHT ACTION DRONE DOES A HOVER ACTION AND THE SOFTWARE DOES MEASUREMENT ACTIONS
            initialSchedulerState = whileDroneHoverActions({
              initialSchedulerState: initialSchedulerState,
              gndyaw: 99,
              gndpitch: 99,
              droneyaw: 99,
              dronepitch: 99,
              droneHoverTime: filters.droneHoverTime,
              locationNumber: d + 1,
              thisHeight: droneHeight,
            });
          }
        }

        cntSteps = cntSteps + 1;
      }
    }
  }

  return { initialSchedulerState };
}

function whileDroneHoverActions({
  initialSchedulerState,
  gndyaw,
  gndpitch,
  droneyaw,
  dronepitch,
  droneHoverTime,
  locationNumber,
  thisHeight,
}) {
  // DRONE OPERATOR
  initialSchedulerState.DRONE_OPERATOR.push([
    {
      actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
      actionDescription: ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
        locationNumber,
        thisHeight
      ),
      actionDuration: Number(droneHoverTime),
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
      droneHoverTime -
      ACTION_TYPES.SOFTWARE_OPERATOR.START_RF.PRESET_DURATION -
      ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.PRESET_DURATION(180) -
      ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_GND_GIMBAL.PRESET_DURATION(180) -
      ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
  });

  initialSchedulerState.SOFTWARE_OPERATOR[
    initialSchedulerState.SOFTWARE_OPERATOR.length - 1
  ].push({
    actionType: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.NAME,
    actionDescription: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.SHORT_DESCRIPTION,
    actionDuration: ACTION_TYPES.SOFTWARE_OPERATOR.STOP_RF.PRESET_DURATION,
  });

  // DRIVER OPERATOR
  initialSchedulerState.DRIVER_OPERATOR.push([
    {
      actionType: ACTION_TYPES.NO_ACTION.NAME,
      actionDescription: ACTION_TYPES.NO_ACTION.SHORT_DESCRIPTION,
      actionDuration: droneHoverTime,
    },
  ]);

  return initialSchedulerState;
}
