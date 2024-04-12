import { ACTION_TYPES, ACTORS } from "../constants/constants";

// Group of ordered simultaneous actions (GOSA)
const GOSA = [
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
  const idxsSiblings = findIdxInGOSA(actionName);
  return GOSA.filter((SAO, cnt) => idxsSiblings[cnt] !== false);
}

export function findIdxInGOSA(actionName) {
  return GOSA.map((SAO, cnt) => {
    const AO = SAO.filter(
      (actionObject) => actionObject.ACTION_NAME === actionName
    );
    // The length of AO should be exactly 1, as an AO must not be repeated in a single SAO.
    if (AO.length === 1) {
      return cnt;
    } else if (AO.length > 1) {
      console.log("DEBUG: Multiple AO of the same type in a single SAO");
    } else {
      return false;
    }
  });
}
