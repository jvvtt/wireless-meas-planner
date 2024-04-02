import './Dashboard.css'
import { useContext, useState } from 'react';
import { DroneMarkersContext } from '../context/dronemarkers.jsx';
import { GroundMarkersContext } from '../context/groundmarkers.jsx';
import { useFilters } from '../hooks/useFilters.js';
import{ cosineDistanceBetweenPoints } from '../logic/utils.js'
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

export function Dashboard () {
    const {markers} = useContext(DroneMarkersContext)
    const { gndmarkers } = useContext(GroundMarkersContext)
    const { filters, setFiltersState } = useFilters()
    const [ hoverTime, setHoverTime ] = useState(60)
    const [ avgDroneBatt, seAvgDroneBatt ] = useState(4.5/50)
    
    const initialDroneBatteryDrop = 0
    let consumed_battery_time;
    
    const local_avg_drone_batt = avgDroneBatt
    const local_drone_height = filters.droneHeight

    if (filters.gndActiveIdx !== null) {

        const dist_2D_gnd_first_drone_loc = cosineDistanceBetweenPoints(gndmarkers[filters.gndActiveIdx].lat, 
                                                                        gndmarkers[filters.gndActiveIdx].lng, 
                                                                        markers[0].lat, 
                                                                        markers[0].lng)

        const dist_3D_gnd_first_drone_loc = Math.sqrt(Math.pow(dist_2D_gnd_first_drone_loc, 2) + Math.pow(local_drone_height, 2))    

        consumed_battery_time = markers.reduce((accumulator, currentValue)=> 
                                                 accumulator + (currentValue.distToPrevious/filters.droneSpeed+hoverTime)*local_avg_drone_batt, 
                                                 initialDroneBatteryDrop) + ((dist_3D_gnd_first_drone_loc/filters.droneSpeed)*local_avg_drone_batt)
    } else {
        consumed_battery_time = markers.reduce((accumulator, currentValue)=> 
                                                 accumulator + (currentValue.distToPrevious/filters.droneSpeed+hoverTime)*local_avg_drone_batt, 
                                                 initialDroneBatteryDrop)
    }

    const doughnutChartData = {
                                labels:['Dropped', 'Remaining'],
                                datasets:[{
                                    label: 'Level',
                                    data: [consumed_battery_time, 100-consumed_battery_time],
                                    backgroundColor: [
                                        'rgb(0,0,0)',
                                        'rgb(255,255,255)'
                                    ],
                                    borderColor: '#f3f2f2',
                                    hoverOffset: 4
                                }]
                            }

    const handleChangeHeight = (e)=>{
        setFiltersState(prevstate=> ({
            ...prevstate,
            droneHeight: e.target.value
        }))
    }

    return (
        <section className='dashboard-row'>
            <div className='dashboard-col' id='col-1'>
                <div className='label-txt-detail'>
                    <label htmlFor='drone-hover-time-input' className='labels-info'>Hovering time per drone location [s] </label>
                    <input type='number' id='drone-hover-time-input' min="0" placeholder='60' className='inputs-text' onChange={(e)=>setHoverTime(e.target.value)}/>
                </div>
                <span className='small-text-info'> The drone will hover at the first location for the specified time.</span>
                <div className='label-txt-detail' id="drone-height-div">
                    <label htmlFor='drone-height' className='labels-info'>Height for the measurement [m]</label>
                    <input type='number' id='drone-height' min="0" placeholder='40' className='inputs-text' onChange={(e)=>handleChangeHeight(e)}/>
                </div>
                <span className='small-text-info'> Drone will fly at the same height until the end of the experiment.</span>
            </div>
            <div className='dashboard-col' id='col-2'>
                <div className='dashboard-sub-cols' id='sub-col-1'>
                    <label htmlFor='avg-batt-drop'>Avg. % battery drop per second</label>
                    <input type="number" min="0"  id="avg-batt-drop" placeholder='4.5/50' onChange={(e)=>seAvgDroneBatt(e.target.value)}></input>
                </div>    
                <div className='dashboard-sub-cols' id='sub-col-2'>
                    <p>Drone consumed battery on the measurement:</p>
                    <span> {consumed_battery_time.toFixed(2)} % </span>
                </div>      
                <div id='chart'>
                    <Doughnut data={doughnutChartData} options={{plugins: {legend: false}}}/>
                </div>                
            </div>
        </section>
    )
}