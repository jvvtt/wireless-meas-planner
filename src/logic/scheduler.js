import { ACTION_TYPES, ACTORS } from "../constants/constants";

// Group of ordered simultaneous actions (GOSA)
GOSA = [
  [
    {
      ACTION_NAME: ACTION_TYPES.OBSERVER_OPERATOR.REPORT_AIRCRAFT.NAME,
      OPERATOR: ACTORS.OBSERVER_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.OBSERVER_OPERATOR.REPORT_BIRDS.NAME,
      OPERATOR: ACTORS.OBSERVER_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.OBSERVER_OPERATOR.REPORT_PEDESTRIAN.NAME,
      OPERATOR: ACTORS.OBSERVER_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
      OPERATOR: ACTORS.DRONE_OPERATOR,
    },
  ],
  [
    {
      ACTION_NAME: ACTION_TYPES.OBSERVER_OPERATOR.REPORT_AIRCRAFT.NAME,
      OPERATOR: ACTORS.OBSERVER_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.OBSERVER_OPERATOR.REPORT_BIRDS.NAME,
      OPERATOR: ACTORS.OBSERVER_OPERATOR,
    },
    {
      ACTION_NAME: ACTION_TYPES.OBSERVER_OPERATOR.REPORT_PEDESTRIAN.NAME,
      OPERATOR: ACTORS.OBSERVER_OPERATOR,
    },
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
  return 1;
}

export function findIdxInGOSA() {
  return 1;
}
