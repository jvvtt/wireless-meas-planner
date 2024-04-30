import {
  useMap,
  FeatureGroup,
  Marker,
  CircleMarker,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useContext } from "react";
import { DroneMarkersContext } from "../context/dronemarkers.jsx";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";
import { PDRSZonesContext } from "../context/pdrszones.jsx";
import { CustomToolbar } from "./CustomToolbar.jsx";
import { DRONE_HEADING_TYPES } from "../logic/utils.js";
import { useFilters } from "@/hooks/useFilters.js";
import { droneIcon, iconPoiGndHeading } from "../leaflet-ui/controls.js";

export function DrawControl() {
  const geo_map = useMap();
  const { onCreationGroundMarker, onDeleteGroundMarker } =
    useContext(GroundMarkersContext);
  const { onCreationMap, onEditMove, onDelete } =
    useContext(DroneMarkersContext);
  const { setFgVertex } = useContext(PDRSZonesContext);
  const { setFiltersState } = useFilters();

  console.log(geo_map.getCenter(), geo_map.getZoom());

  const handleCreated = (e) => {
    // Drone marker
    if (e.layerType == "marker") {
      if (e.layer.options.icon.myType === "Drone") {
        onCreationMap({ layer: e.layer });
      } else if (e.layer.options.icon.myType === "POI-GND-HEAD") {
        e.layer._map.removeLayer(e.layer);
        setFiltersState((prevstate) => ({
          ...prevstate,
          poiGndHeading: [e.layer._latlng.lat, e.layer._latlng.lng],
        }));
      }
    }
    // Ground marker
    else if (e.layerType == "circlemarker") {
      onCreationGroundMarker({ layer: e.layer });
    }
    // Flight Geography polygon
    else if (e.layerType == "polygon") {
      setFgVertex((prevstate) => [
        ...prevstate,
        e.layer._latlngs[0].map((entry) => [entry.lat, entry.lng]),
      ]);
    }
    // Measure distance tool (Polyline)
    else if (e.layerType == "polyline") {
      e.layer._map.removeLayer(e.layer);
    }
  };

  const handleEditMove = (e) => {
    console.log(e);
    if (e.layerType == "marker") {
      console.log("here Drawcontrol");
      if (e.layer.options.icon.myType === "Drone") {
        onEditMove(geo_map);
      } else if (e.layer.options.icon.myType === "POI-GND-HEAD") {
        1;
      }
    }
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
      poiGndHeading: [],
    }));
  };

  return (
    <FeatureGroup>
      <EditControl
        draw={{ rectangle: false, polyline: true, circle: false }}
        position="topright"
        onCreated={(event) => handleCreated(event)}
        onEdited={(event) => handleEditMove(event)}
        onDeleted={(event) => handleDelete(event)}
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
      <AllMapComponents></AllMapComponents>
    </FeatureGroup>
  );
}

function AllMapComponents() {
  const { gndmarkers } = useContext(GroundMarkersContext);
  const { markers, setLastMarkerId } = useContext(DroneMarkersContext);
  const { filters } = useFilters();
  const onDroneClick = (event) => {
    const id = markers.filter(
      (marker) =>
        event.latlng.lat == marker.lat && event.latlng.lng == marker.lng
    )[0]?.id;
    setLastMarkerId(id);
  };
  const droneMarkerEventHandlers = {
    click: onDroneClick,
  };

  return (
    <>
      {markers.length > 0 ? (
        markers.map((marker, cnt) => {
          return (
            <Marker
              key={cnt}
              position={[marker.lat, marker.lng]}
              icon={droneIcon}
              eventHandlers={droneMarkerEventHandlers}
            >
              <Popup>{`Drone location ${cnt + 1}`}</Popup>
            </Marker>
          );
        })
      ) : (
        <></>
      )}
      {gndmarkers.length > 0 ? (
        gndmarkers.map((marker, cnt) => {
          return (
            <CircleMarker
              key={cnt}
              center={[marker.lat, marker.lng]}
              pathOptions={{ color: "chocolate" }}
            >
              <Popup>{`Ground location ${cnt + 1}`}</Popup>
            </CircleMarker>
          );
        })
      ) : (
        <></>
      )}
      {filters.poiGndHeading.length > 0 ? (
        <Marker
          position={filters.poiGndHeading}
          icon={iconPoiGndHeading}
        ></Marker>
      ) : (
        <></>
      )}
    </>
  );
}
