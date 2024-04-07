//import "./Dashboard.css";
import { useContext, useState } from "react";
import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { useFilters } from "../hooks/useFilters.js";
import { cosineDistanceBetweenPoints } from "../logic/utils.js";

export function useDashboardInfo() {
  const { markers } = useContext(DroneMarkersContext);
  const { gndmarkers } = useContext(GroundMarkersContext);
  const { filters, setFiltersState, timeToPrevious } = useFilters();
  const [avgDroneBatt, seAvgDroneBatt] = useState(4.5 / 50);

  const handleChangeHeight = (e) => {
    setFiltersState((prevstate) => ({
      ...prevstate,
      droneHeight: Number(e.target.value),
    }));
  };

  const handleChangeHoverTime = (e) => {
    console.log(typeof e.target.value);
    setFiltersState((prevstate) => ({
      ...prevstate,
      droneHoverTime: Number(e.target.value),
    }));
  };

  const initialDroneBatteryDrop = 0;
  let consumed_battery_time = 0;

  const local_avg_drone_batt = avgDroneBatt;
  const local_drone_height = filters.droneHeight;

  let totalFlightTime =
    markers.length > 0
      ? timeToPrevious(markers, "DRONE").reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue + Number(filters.droneHoverTime),
          initialDroneBatteryDrop
        )
      : 0;

  if (filters.gndActiveIdx !== null) {
    const dist_2D_gnd_first_drone_loc = cosineDistanceBetweenPoints(
      gndmarkers[filters.gndActiveIdx].lat,
      gndmarkers[filters.gndActiveIdx].lng,
      markers[0].lat,
      markers[0].lng
    );

    const dist_2D_gnd_last_drone_loc = cosineDistanceBetweenPoints(
      gndmarkers[filters.gndActiveIdx].lat,
      gndmarkers[filters.gndActiveIdx].lng,
      markers[markers.length - 1].lat,
      markers[markers.length - 1].lng
    );

    const dist_3D_gnd_first_drone_loc = Math.sqrt(
      Math.pow(dist_2D_gnd_first_drone_loc, 2) + Math.pow(local_drone_height, 2)
    );

    const dist_3D_gnd_last_drone_loc = Math.sqrt(
      Math.pow(dist_2D_gnd_last_drone_loc, 2) + Math.pow(local_drone_height, 2)
    );

    totalFlightTime =
      totalFlightTime +
      (dist_3D_gnd_first_drone_loc + dist_3D_gnd_last_drone_loc) /
        filters.droneSpeed;
  }

  consumed_battery_time = totalFlightTime * local_avg_drone_batt;

  return {
    totalFlightTime,
    consumed_battery_time,
    handleChangeHoverTime,
    seAvgDroneBatt,
    handleChangeHeight,
    timeToPrevious,
  };
}
