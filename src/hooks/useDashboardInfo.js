import { useMeasurementSeqOrderB } from "../logic/scheduler.js";
import { useContext, useState } from "react";
import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { useFilters } from "../hooks/useFilters.js";
import { cosineDistanceBetweenPoints } from "../logic/utils.js";

export function useDashboardInfo() {
  const { markers } = useContext(DroneMarkersContext);
  const { gndmarkers } = useContext(GroundMarkersContext);
  const { filters } = useFilters();
  const [avgDroneBatt, seAvgDroneBatt] = useState(4.5 / 50);

  const { droneActionsDuration } = useMeasurementSeqOrderB();

  let consumed_battery_time = 0;

  let totalFlightTime = droneActionsDuration.reduce((acc, val) => acc + val, 0);
  let dist_2D_gnd_last_drone_loc = 0;
  let dist_3D_gnd_last_drone_loc = 0;

  if (gndmarkers.length > 0 && markers.length > 0) {
    dist_2D_gnd_last_drone_loc = cosineDistanceBetweenPoints(
      gndmarkers[0].lat,
      gndmarkers[0].lng,
      markers[markers.length - 1].lat,
      markers[markers.length - 1].lng
    );

    dist_3D_gnd_last_drone_loc = Math.sqrt(
      Math.pow(dist_2D_gnd_last_drone_loc, 2) +
        Math.pow(Math.max(...filters.droneHeights), 2)
    );
  }

  totalFlightTime =
    totalFlightTime + dist_3D_gnd_last_drone_loc / filters.droneSpeed;

  consumed_battery_time = totalFlightTime * avgDroneBatt;

  return {
    totalFlightTime,
    consumed_battery_time,
    seAvgDroneBatt,
  };
}
