import './CoordsInfoCard.css'
import { useContext } from 'react'
import { DroneMarkersContext } from '../context/dronemarkers'
import { GroundMarkersContext } from '../context/groundmarkers.jsx'
import { useFilters } from "../hooks/useFilters.js"
import { Filters } from './Filters.jsx'


export function CoordsInfoCard () {
    const { markers, lastMarkerId} = useContext(DroneMarkersContext)
    const { gndmarkers } = useContext(GroundMarkersContext)
    const idxMarkerClicked = markers.findIndex(entry=>entry.id === lastMarkerId)
    const {timeToPrevious, getDroneGimbalYaw} = useFilters()
    const time = timeToPrevious(markers, 'DRONE')
    const droneAngles = getDroneGimbalYaw(markers, gndmarkers)

    return (

        <section className='coords-info-card'>
            <div className='coords-info-card-item' id="lat">
                <label htmlFor='lat-txt'>Latitude</label>
                <span id='lat-txt'>{markers[idxMarkerClicked]?.lat.toFixed(4)}</span>
            </div>
            <div className='coords-info-card-item'>
                <label htmlFor='lng-txt'>Longitude</label>
                <span id='lng-txt'>{markers[idxMarkerClicked]?.lng.toFixed(4)}</span>
            </div>
            <div className='coords-info-card-item'>
                <label htmlFor='dtp-txt'>Distance to previous</label>
                <span id='dtp-txt'>{markers[idxMarkerClicked]?.distToPrevious.toFixed(1)}</span>
            </div>
            <div className='coords-info-card-item'>
                <label htmlFor='ttp-txt'>Time to previous</label>
                <span id='ttp-txt'>{time[idxMarkerClicked]?.toFixed(2)}</span>
            </div>
            <div className='coords-info-card-inputs'>
                <Filters></Filters>                
            </div>
            <div className='coords-info-card-item'>
                <label htmlFor='drone-gimbal-yaw'>Drone yaw</label>
                <span id='drone-gimbal-yaw'>{droneAngles[idxMarkerClicked]?.droneGimbalYaw?.toFixed(2)}</span>
            </div>
        </section>
    )

}