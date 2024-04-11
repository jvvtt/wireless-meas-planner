import { Polyline } from "react-leaflet";
import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { useContext, useCallback } from "react";
import { useFilters } from "../hooks/useFilters.js";

export function DrawDronePath() {
  const { markers } = useContext(DroneMarkersContext);

  return (
    <>
      {markers.map((entry, cnt) => {
        if (cnt > 0) {
          const position = [
            [entry.lat, entry.lng],
            [markers[cnt - 1].lat, markers[cnt - 1].lng],
          ];
          return (
            <Polyline
              key={cnt}
              pathOptions={{ color: "lime" }}
              positions={position}
            ></Polyline>
          );
        }
      })}
    </>
  );
}

export function DrawGndPath() {
  const { gndmarkers } = useContext(GroundMarkersContext);

  return (
    <>
      {gndmarkers.map((entry, cnt) => {
        if (cnt > 0) {
          const position = [
            [entry.lat, entry.lng],
            [gndmarkers[cnt - 1].lat, gndmarkers[cnt - 1].lng],
          ];
          return (
            <Polyline
              key={cnt}
              pathOptions={{ color: "lime" }}
              positions={position}
            ></Polyline>
          );
        }
      })}
    </>
  );
}

export function DroneGimbalYawDrawLine() {
  const { markers } = useContext(DroneMarkersContext);
  const { gndmarkers } = useContext(GroundMarkersContext);

  const { getDroneGimbalYaw } = useFilters();
  const droneAngles = getDroneGimbalYaw(markers, gndmarkers);

  return (
    <>
      {gndmarkers.length > 0 ? (
        droneAngles.map((entry, cnt) => {
          return (
            <>
              <Polyline
                key={cnt}
                pathOptions={{ color: "red" }}
                positions={entry.lineGimbalDirection}
              ></Polyline>
            </>
          );
        })
      ) : (
        <></>
      )}
    </>
  );
}

export function DroneHeadingDrawLine() {
  const { markers } = useContext(DroneMarkersContext);
  const { gndmarkers } = useContext(GroundMarkersContext);

  const { getDroneGimbalYaw } = useFilters();
  const droneAngles = getDroneGimbalYaw(markers, gndmarkers);

  return (
    <>
      {gndmarkers.length > 0 ? (
        droneAngles.map((entry, cnt) => {
          return (
            <>
              <Polyline
                key={cnt}
                pathOptions={{ color: "yellow" }}
                positions={entry.lineDroneHeading}
              ></Polyline>
            </>
          );
        })
      ) : (
        <></>
      )}
    </>
  );
}

export function GndDrawAngleLines() {
  const { markers, lastMarkerId } = useContext(DroneMarkersContext);
  const { gndmarkers } = useContext(GroundMarkersContext);

  const idxMarkerClicked = markers.findIndex(
    (entry) => entry.id === lastMarkerId
  );

  const { getGNDGimbalYaw } = useFilters();
  const gndAngles = getGNDGimbalYaw(gndmarkers, markers[idxMarkerClicked]);

  return (
    <>
      <Polyline
        pathOptions={{ color: "yellow" }}
        positions={gndAngles.lineGndHeading}
      ></Polyline>
      <Polyline
        pathOptions={{ color: "red" }}
        positions={gndAngles.lineGimbalDirection}
      ></Polyline>
    </>
  );
}
