import {MapContainer, TileLayer} from 'react-leaflet';
import './MapToInteract.css';
import { osm_provider } from '../constants/constants.js';
import { DrawControl } from './DrawControl';
import { DrawDronePath, DrawGndPath, DroneGimbalYawDrawLine, DroneHeadingDrawLine } from './DrawMapObjs.jsx';
import { PDRAZones } from './PDRSZones.jsx';
import { MapLegends } from './MapLegends.jsx';
import { CoordsInfoCard } from './CoordsInfoCard.jsx';

export function MapToInteract() {
 
    return (
        <>
            <div className='map-container'>
                <MapContainer 
                        center={[60.167120, 24.939156]}
                        zoom={13}
                        style={{height:"100%", width:"100%"}}>
                    <DrawControl></DrawControl>
                    <TileLayer
                        attribution={osm_provider.attribution}
                        url={osm_provider.url}/>
                    <DrawDronePath></DrawDronePath>
                    <DrawGndPath></DrawGndPath>
                    <DroneGimbalYawDrawLine></DroneGimbalYawDrawLine>
                    <DroneHeadingDrawLine></DroneHeadingDrawLine>
                    <PDRAZones></PDRAZones>
                </MapContainer>
                <CoordsInfoCard></CoordsInfoCard>
            </div>
            <MapLegends></MapLegends>
        </>
        )
}