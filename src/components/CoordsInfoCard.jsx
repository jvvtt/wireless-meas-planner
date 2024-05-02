import "./CoordsInfoCard.css";
import { useContext } from "react";
import { DroneMarkersContext } from "../context/dronemarkers";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { useFilters } from "../hooks/useFilters.js";

export function CoordsInfoCard() {
  const { markers, lastMarkerId } = useContext(DroneMarkersContext);
  const { gndmarkers } = useContext(GroundMarkersContext);
  const idxMarkerClicked = markers.findIndex(
    (entry) => entry.id === lastMarkerId
  );
  const {
    timeToPrevious,
    getDroneGimbalYaw,
    getGNDGimbalYaw,
    distsDroneGnd,
    getGndGimbalPitch,
  } = useFilters();

  const time = timeToPrevious(markers, "DRONE");
  const droneYaws = getDroneGimbalYaw(markers, gndmarkers);
  const gndYaws = getGNDGimbalYaw(gndmarkers, markers[idxMarkerClicked]);
  const nodesDists = distsDroneGnd(markers, gndmarkers);
  const gndPitches = getGndGimbalPitch(markers, gndmarkers);

  return (
    <section className="bg-white rounded border-collapse flex flex-col pt-5 gap-y-3 w-4/12">
      <div
        className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60"
        id="lat"
      >
        <label htmlFor="lat-txt" className="text-align text-white">
          Latitude
        </label>
        <span id="lat-txt" className="text-align text-white">
          {markers[idxMarkerClicked]?.lat.toFixed(4)}
        </span>
      </div>
      <div className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60">
        <label htmlFor="lng-txt" className="text-align text-white">
          Longitude
        </label>
        <span id="lng-txt" className="text-align text-white">
          {markers[idxMarkerClicked]?.lng.toFixed(4)}
        </span>
      </div>
      <div className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60">
        <label htmlFor="dtp-txt" className="text-align text-white">
          Distance to previous
        </label>
        <span id="dtp-txt" className="text-align text-white">
          {markers[idxMarkerClicked]?.distToPrevious.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60">
        <label htmlFor="ttp-txt" className="text-align text-white">
          Time to previous
        </label>
        <span id="ttp-txt" className="text-align text-white">
          {time[idxMarkerClicked]?.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60">
        <label htmlFor="drone-gimbal-yaw" className="text-align text-white">
          Drone gimbal yaw
        </label>
        <span id="drone-gimbal-yaw" className="text-align text-white">
          {droneYaws[idxMarkerClicked]?.droneGimbalYaw?.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60">
        <label htmlFor="drone-gimbal-pitch" className="text-align text-white">
          Drone gimbal pitch
        </label>
        <span id="drone-gimbal-pitch" className="text-align text-white">
          {-gndPitches[idxMarkerClicked]}
        </span>
      </div>
      <div className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60">
        <label htmlFor="nodes-distance" className="text-align text-white">
          Nodes distance
        </label>
        <span id="nodes-distance" className="text-align text-white">
          {nodesDists[idxMarkerClicked]}
        </span>
      </div>
      <div className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60">
        <label htmlFor="gnd-gimbal-yaw" className="text-align text-white">
          Gnd gimbal yaw
        </label>
        <span id="gnd-gimbal-yaw" className="text-align text-white">
          {gndYaws?.gndGimbalYaw?.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-row font-semibold text-base bg-orange-400 rounded w-5/6 mx-auto py-2 justify-between px-4 shadow-md shadow-orange-400/60">
        <label htmlFor="gnd-gimbal-pitch" className="text-align text-white">
          Gnd gimbal pitch
        </label>
        <span id="gnd-gimbal-pitch" className="text-align text-white">
          {gndPitches[idxMarkerClicked]}
        </span>
      </div>
    </section>
  );
}
