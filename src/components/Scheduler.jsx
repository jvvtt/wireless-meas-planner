const ACTIONS_LIST = [
  "move-drone",
  "move-gnd",
  "rotate-drone-gimbal",
  "rotate-gnd-gimbal",
  "hover-drone",
  "start-meas",
  "stop-meas",
  "start-experiment",
  "stop-experiment",
];

const ACTORS = ["drone-operator", "software-operator"];

const ACTIONS_DURATION_CONSTANTS = {
  RS2YAW: 2,
  IRFPS: 8,
};

export function Scheduler() {
  return <>Hola</>;
}
