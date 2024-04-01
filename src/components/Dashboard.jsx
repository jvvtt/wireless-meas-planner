import './Dashboard.css'
import { battery_drop_ratio } from '../constants/constants.js';
import { useContext, useState } from 'react';
import { DroneMarkersContext } from '../context/dronemarkers.jsx';
import { GroundMarkersContext } from '../context/groundmarkers.jsx';
import { useFilters } from '../hooks/useFilters.js';
import{ cosineDistanceBetweenPoints } from '../logic/utils.js'

export function Dashboard () {
    const {markers} = useContext(DroneMarkersContext)
    const { gndmarkers } = useContext(GroundMarkersContext)
    const { filters } = useFilters()
    const [ hoverTime, setHoverTime ] = useState(60)
    const [ droneHeight, setDroneHeight ] = useState(40)
    
    const initialDroneBatteryDrop = 0
    let consumed_battery_time;
    
    if (filters.gndActiveIdx !== null) {

        const dist_2D_gnd_first_drone_loc = cosineDistanceBetweenPoints(gndmarkers[filters.gndActiveIdx].lat, 
                                                                        gndmarkers[filters.gndActiveIdx].lng, 
                                                                        markers[0].lat, 
                                                                        markers[0].lng)

        const dist_3D_gnd_first_drone_loc = Math.sqrt(Math.pow(dist_2D_gnd_first_drone_loc, 2) + Math.pow(droneHeight, 2))

        consumed_battery_time = markers.reduce((accumulator, currentValue)=> 
                                                 accumulator + (currentValue.distToPrevious/filters.droneSpeed+hoverTime)*battery_drop_ratio, 
                                                 initialDroneBatteryDrop) + ((dist_3D_gnd_first_drone_loc/filters.droneSpeed)*battery_drop_ratio)
    } else {
        consumed_battery_time = markers.reduce((accumulator, currentValue)=> 
                                                 accumulator + (currentValue.distToPrevious/filters.droneSpeed+hoverTime)*battery_drop_ratio, 
                                                 initialDroneBatteryDrop)
    }

    return (
        <section className='dashboard-row'>
            <div className='dashboard-col' id='col-1'>
                <div className='label-txt-detail'>
                    <label htmlFor='drone-hover-time-input' className='labels-info'>Hovering time per drone location [s] </label>
                    <input type='number' id='drone-hover-time-input' placeholder='60' className='inputs-text' onChange={(e)=>setHoverTime(e.target.value)}/>
                </div>
                <span className='small-text-info'> The drone will hover at the first location for the specified time.</span>
                <div className='label-txt-detail'>
                    <label htmlFor='drone-height' className='labels-info'>Height for the measurement [m]</label>
                    <input type='number' id='drone-height' placeholder='40' className='inputs-text' onChange={(e)=>setDroneHeight(e.target.value)}/>
                </div>
                <span className='small-text-info'> Drone will fly at the same height until the end of the experiment.</span>
            </div>
            <div className='dashboard-col' id='col-2'>
                <p>Consumed battery on the experiment:</p>
                <span> {consumed_battery_time.toFixed(2)} % </span>
            </div>
        </section>
    )
}