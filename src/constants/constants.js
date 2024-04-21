export const osm_provider = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const gnd_speeds = ["10km/h", "20km/h", "30km/h"];
export const drone_speeds = ["0.5m/s", "1m/s", "2m/s", "3m/s"];
export const decimal_places = 5;

export const flight_geography_opts = { color: "rgb(45, 135, 236)" };
export const contingency_volume_opts = { color: "rgb(251, 255, 0)" };
export const ground_risk_buffer_opts = { color: "rgb(168, 51, 204)" };

// Drone battery drop with full payload (out system): 4.5% per 50 seconds
export const battery_drop_ratio = 4.5 / 50;

const conservative_speed_drone_gimbal = 30; // in deg/s
const speed_drone_gimbal = conservative_speed_drone_gimbal; // let's assume a conservative speed for the gimbal
const speed_gnd_gimbal = speed_drone_gimbal; // both nodes use the same gimbal

export const ACTION_TYPES = {
  DRONE_OPERATOR: {
    NUMBER_ACTIONS: 2,
    MOVE: {
      NAME: "Move drone",
      SHORT_DESCRIPTION: (a, b, h) =>
        `From location ${a} to ${b} @ height ${h}`,
    },
    HOVER: {
      NAME: "Hover drone",
      SHORT_DESCRIPTION: (a, h) => `At location ${a} @ height ${h}`,
    },
  },
  SOFTWARE_OPERATOR: {
    NUMBER_ACTIONS: 4,
    START_RF: {
      NAME: "Start RF",
      SHORT_DESCRIPTION: "RX listening incoming signals",
      PRESET_DURATION: 5,
    },
    STOP_RF: {
      NAME: "Stop RF",
      SHORT_DESCRIPTION: "RX stops listening incoming signals",
      PRESET_DURATION: 5,
    },
    MOVE_DRONE_GIMBAL: {
      NAME: "Move drone gimbal",
      SHORT_DESCRIPTION: (a, b) => `Rotate ${a} yaw, ${b} pitch`,
      SPEED_DRONE_GIMBAL: speed_drone_gimbal,
      PRESET_DURATION: (ang) => ang / speed_drone_gimbal,
    },
    MOVE_GND_GIMBAL: {
      NAME: "Move gnd gimbal",
      SHORT_DESCRIPTION: (a, b) => `Rotate ${a} yaw, ${b} pitch`,
      SPEED_GND_GIMBAL: speed_gnd_gimbal,
      PRESET_DURATION: (ang) => ang / speed_gnd_gimbal,
    },
  },
  DRIVER_OPERATOR: {
    NUMBER_ACTIONS: 2,
    MOVE: {
      NAME: "Move van",
      SHORT_DESCRIPTION: (a, b) => `From location ${a} to ${b}`,
    },
    REST: {
      NAME: "Stop van",
      SHORT_DESCRIPTION: (a) => `At location ${a}`,
    },
  },
  OBSERVER_OPERATOR: {
    REPORT_AIRCRAFT: {
      NAME: "Reports aircraft",
      SHORT_DESCRIPTION: "Reports aircraft",
    },
    REPORT_BIRDS: {
      NAME: "Reports birds",
      SHORT_DESCRIPTION: "Reports birds",
    },
    REPORT_PEDESTRIAN: {
      NAME: "Reports pedestrian",
      SHORT_DESCRIPTION: "Pedestrians approaching",
    },
  },
  NO_ACTION: {
    NAME: "No action",
    SHORT_DESCRIPTION: "This actor doesn't act",
  },
};

export const ACTORS = {
  DRONE_OPERATOR: "DRONE_OPERATOR",
  SOFTWARE_OPERATOR: "SOFTWARE_OPERATOR",
  DRIVER_OPERATOR: "DRIVER_OPERATOR",
  OBSERVER_OPERATOR: "OBSERVER_OPERATOR",
};

export const ACTIONS_DURATION_CONSTANTS = {
  RS2YAW: 2,
  IRFPS: 8,
};
