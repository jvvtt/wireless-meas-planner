import drone_marker from "../assets/drone-marker.png";
import poi_gnd_heading from "../assets/poi-gnd-heading.png";
import { icon } from "leaflet";
//import * as esri_geo from "esri-leaflet-geocoder";

/*
const ARC_GIS_API_KEY =
  "AAPK0f901f75ec4f4534b7065f77effda611lkO23dqpjc0JCju0a7JtvWTlIeSiVzCc43m2-UePuQfV7Rj4xx9hGJmPFKLy0Zzl";
*/

export const droneIcon = icon({
  iconUrl: drone_marker,
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  tooltipAnchor: [12, -12],
});

export var iconPoiGndHeading = icon({
  iconUrl: poi_gnd_heading,
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  tooltipAnchor: [12, -12],
});

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
