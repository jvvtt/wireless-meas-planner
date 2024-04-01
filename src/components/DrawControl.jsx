import { useMap, FeatureGroup } from "react-leaflet"
import { EditControl } from "react-leaflet-draw"
import { useContext } from 'react';
import { DroneMarkersContext } from '../context/dronemarkers.jsx';
import { GroundMarkersContext } from '../context/groundmarkers.jsx'
import { polygon, transformScale} from "@turf/turf"
import { PDRSZonesContext } from "../context/pdrszones.jsx";
import { DroneRegulationDefinitions } from "../logic/droneOperationsRules.js"
import GeometryUtil from "leaflet-geometryutil"
import * as esri_geo from "esri-leaflet-geocoder"
import { CustomToolbar } from "./CustomToolbar.jsx";
import * as L from 'leaflet'
import { useFilters } from "../hooks/useFilters.js";
import { DRONE_HEADING_TYPES } from "../logic/utils.js"

const ARC_GIS_API_KEY = "AAPK0f901f75ec4f4534b7065f77effda611lkO23dqpjc0JCju0a7JtvWTlIeSiVzCc43m2-UePuQfV7Rj4xx9hGJmPFKLy0Zzl"

export function DrawControl () {
    const geo_map = useMap()   
    const {onCreationGroundMarker, onEditGroundMarker, onDeleteGroundMarker} = useContext(GroundMarkersContext)
    const {onCreationMap, onEditMove, onDelete, setLastMarkerId} = useContext(DroneMarkersContext);
    const { setFgVertex, setCvVertex, setGrbVertex } = useContext(PDRSZonesContext)
    const { setFiltersState } = useFilters()

    const handleClickMarker = (e)=>{
        setLastMarkerId(e.target._leaflet_id)

        esri_geo.reverseGeocode({
                apikey: ARC_GIS_API_KEY
        }).latlng(e.latlng).run(function (error, result) {
          if (error) {
            return;
          }
          console.log(result.address.Match_addr)
        });
    }

    const handleCreated = (e) => {
        if (e.layerType == 'marker') {
            // Drone marker
            if (e.layer.options.icon.myType === "Drone") {
                e.layer.editing._marker.on('click', (e)=> handleClickMarker(e)) 
                onCreationMap({layer: e.layer});
            }            
        }
        else if (e.layerType == 'circlemarker') {
            // Set the color of the circle marker
            e.layer.editing._shape.setStyle({color: 'chocolate'})
            onCreationGroundMarker({layer: e.layer})
        }        
        else if (e.layerType == 'polygon'){
            /* Flight Geography */
            const fg = []
            e.layer._latlngs[0].map(entry=> fg.push([entry.lat, entry.lng]))
            setFgVertex(fg)

            // Turf.js requires that a Polygon object has its last entry as the first one
            fg.push(fg[0])           

            const scalingFactorForContVol = 1 + DroneRegulationDefinitions.Scv/GeometryUtil.distance(e.layer._map, L.latLng(fg[0][0], fg[0][1]),
                                                                                             L.latLng(fg[1][0], fg[1][1]))

            /* Contingency Volume */
            let cv = transformScale(polygon([fg]), scalingFactorForContVol)
            cv = cv.geometry.coordinates[0]

            const scalingFactorForGRB = 1 + DroneRegulationDefinitions.Sgrb/GeometryUtil.distance(e.layer._map, L.latLng(cv[0][0], cv[0][1]),
                                                                                             L.latLng(cv[1][0], cv[1][1]))
            
            /* Ground Risk Buffer */
            let grb = transformScale(polygon([cv]), scalingFactorForGRB)
            grb = grb.geometry.coordinates[0]
                                                                                             
            cv.pop()
            grb.pop()
            setCvVertex(cv)
            setGrbVertex(grb)

            console.log('DrawControl:Scv', DroneRegulationDefinitions.Scv)
            console.log('DrawControl:Sgrb', DroneRegulationDefinitions.Sgrb)
        }        

        else if (e.layerType =='polyline') {
            e.layer._map.removeLayer(e.layer)
        }
    }

    const handleEditMove = (e) => {
        onEditMove(geo_map);
    }

    const handleDelete = () => {
        onDelete()
        onDeleteGroundMarker()
        setFgVertex([])
        setCvVertex([])
        setGrbVertex([])
        setFiltersState(prevstate=> (
            {
                ...prevstate,
                droneHeadingType:DRONE_HEADING_TYPES.NEXT_COORD,
                gndActiveIdx: null                
            }
        ))
    }

    return (
        <FeatureGroup>
            <EditControl
                        draw={{rectangle:false, 
                               polyline: true,
                               circle:false}}  
                        position='topright'
                        onCreated={(event)=>handleCreated(event)}
                        onEditMove={(e)=>handleEditMove(e)}
                        onDeleted={(e)=>handleDelete(e)}>
            </EditControl>
            <CustomToolbar drawOpts={{rectangle:false, polyline: true, circle: false, circlemarker: true, polygon: true}}></CustomToolbar>
        </FeatureGroup>        
    )
}