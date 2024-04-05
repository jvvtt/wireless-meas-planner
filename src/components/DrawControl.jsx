import { useMap, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useContext } from "react";
import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { PDRSZonesContext } from "../context/pdrszones.jsx";
//import * as esri_geo from "esri-leaflet-geocoder";
import { CustomToolbar } from "./CustomToolbar.jsx";
import { DRONE_HEADING_TYPES } from "../logic/utils.js";
import { useFilters } from "@/hooks/useFilters.js";

/*
const ARC_GIS_API_KEY =
  "AAPK0f901f75ec4f4534b7065f77effda611lkO23dqpjc0JCju0a7JtvWTlIeSiVzCc43m2-UePuQfV7Rj4xx9hGJmPFKLy0Zzl";
*/

export function DrawControl() {
  const geo_map = useMap();
  const { onCreationGroundMarker, onEditGroundMarker, onDeleteGroundMarker } =
    useContext(GroundMarkersContext);
  const { onCreationMap, onEditMove, onDelete, setLastMarkerId } =
    useContext(DroneMarkersContext);
  const { setFgVertex } = useContext(PDRSZonesContext);
  const { setFiltersState } = useFilters();

  const handleClickMarker = (e) => {
    setLastMarkerId(e.target._leaflet_id);

    /* UNCOMMENT TO RETRIEVE CLOSEST STREET/STORE/BUILDING NAME
    esri_geo
      .reverseGeocode({
        apikey: ARC_GIS_API_KEY,
      })
      .latlng(e.latlng)
      .run(function (error, result) {
        if (error) {
          return;
        }
        console.log(result.address.Match_addr);
      });
    */
  };

  const handleCreated = (e) => {
    if (e.layerType == "marker") {
      // Drone marker
      if (e.layer.options.icon.myType === "Drone") {
        e.layer.editing._marker.on("click", (e) => handleClickMarker(e));
        onCreationMap({ layer: e.layer });
      }
    } else if (e.layerType == "circlemarker") {
      // Set the color of the circle marker
      e.layer.editing._shape.setStyle({ color: "chocolate" });
      onCreationGroundMarker({ layer: e.layer });
    } else if (e.layerType == "polygon") {
      setFgVertex((prevstate) => [
        ...prevstate,
        e.layer._latlngs[0].map((entry) => [entry.lat, entry.lng]),
      ]);
    } else if (e.layerType == "polyline") {
      e.layer._map.removeLayer(e.layer);
    }
  };

  const handleEditMove = (e) => {
    onEditMove(geo_map);
  };

  const handleDelete = () => {
    onDelete();
    onDeleteGroundMarker();
    setFgVertex([]);
    setFiltersState((prevstate) => ({
      ...prevstate,
      droneHeadingType: DRONE_HEADING_TYPES.NEXT_COORD,
      gndActiveIdx: null,
      droneHeight: 40,
    }));
  };

  return (
    <FeatureGroup>
      <EditControl
        draw={{ rectangle: false, polyline: true, circle: false }}
        position="topright"
        onCreated={(event) => handleCreated(event)}
        onEditMove={(e) => handleEditMove(e)}
        onDeleted={(e) => handleDelete(e)}
      ></EditControl>
      <CustomToolbar
        drawOpts={{
          rectangle: false,
          polyline: true,
          circle: false,
          circlemarker: true,
          polygon: true,
        }}
      ></CustomToolbar>
    </FeatureGroup>
  );
}
