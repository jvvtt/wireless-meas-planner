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

export const ACTION_TYPES = {
  DRONE_OPERATOR: {
    MOVE: {
      NAME: "Move drone",
      SHORT_DESCRIPTION: (a, b) => `From location ${a} to ${b}`,
    },
    HOVER: {
      NAME: "Hover drone",
      SHORT_DESCRIPTION: (a) => `At location ${a}`,
    },
  },
  SOFTWARE_OPERATOR: {
    START_RF: {
      NAME: "Start RF",
      SHORT: "RX listening incoming signals",
    },
    STOP_RF: {
      NAME: "Stop RF",
      SHORT: "RX stops listening incoming signals",
    },
    MOVE_DRONE_GIMBAL: {
      NAME: "Move drone gimbal",
      SHORT: "Rotate yaw and pitch of gimbal",
    },
    MOVE_GND_GIMBAL: {
      NAME: "Move gnd gimbal",
      SHORT: "Rotate yaw and pitch of gimbal",
    },
  },
  DRIVER_OPERATOR: {
    MOVE: {
      NAME: "Move van",
      SHORT_DESCRIPTION: (a, b) => `From location ${a} to ${b}`,
    },
    REST: {
      NAME: "Stop van",
      SHORT_DESCRIPTION: (a) => `At location ${a}`,
    },
  },
};

export const ACTORS = {
  DRONE_OPERATOR: "DRONE_OPERATOR",
  SOFTWARE_OPERATOR: "SOFTWARE_OPERATOR",
  DRIVER_OPERATOR: "DRIVER_OPERATOR",
};

export const ACTIONS_DURATION_CONSTANTS = {
  RS2YAW: 2,
  IRFPS: 8,
};
