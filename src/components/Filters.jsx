/* eslint-disable react/prop-types */
import './Filters.css'
import { useId, useContext } from 'react'
import { useFilters } from '../hooks/useFilters.js'
import { DRONE_HEADING_TYPES} from "../logic/utils.js"
import { GroundMarkersContext } from '../context/groundmarkers.jsx'

export function Filters (){
    const {filters, setFiltersState} = useFilters()
    const {gndmarkers} = useContext(GroundMarkersContext)

    const gndSpeed = useId()
    const droneSpeed = useId()

    const handleGndSpeed = (event) =>{
        setFiltersState(previousState => (
                {...previousState, 
                    gndSpeed: event.target.value
                }
            )
        )
    }

    const handleDroneSpeed = (event) =>{
        setFiltersState(previousState => (
            {...previousState, 
                droneSpeed: event.target.value
            }
        )
    )
    }

    const handleDroneHeadingType = (event)=>{
        setFiltersState(previousState => (
            {...previousState, 
                droneHeadingType: event.target.value
            }
        ))
    }

    const handleGndActive = (event)=>{
        if (event.target.value !== "No gnd placed yet"){
            setFiltersState(previousState => (
                {...previousState, 
                    gndActiveIdx: event.target.selectedIndex
                }
            ))
            
        } else {
            setFiltersState(previousState => (
                {...previousState, 
                    gndActiveIdx: null
                }
            ))
        }
    }

    return (
        <section className="filters">
            <div id="gnd-speed-slide">
                <label htmlFor={gndSpeed}>Ground speed</label>
                <input type='range'
                      step={1}
                      id={gndSpeed}
                      min='10'
                      max='50'
                      onChange={handleGndSpeed}
                      value={filters.gndSpeed}></input>
                <span>{filters.gndSpeed} km/h</span>
            </div>
            <div id="drone-speed-slide">
                <label htmlFor={droneSpeed}>Drone speed</label>
                <input type='range'
                      id={droneSpeed}
                      min='0.1'
                      step={0.1}
                      max='5'
                      onChange={handleDroneSpeed}
                      value={filters.droneSpeed}></input>
                <span>{filters.droneSpeed} m/s</span>
            </div>
            <div id='selector-drone-head'>
                <label htmlFor="selector-head">Heading drone</label>
                <span>Where the heading direction points</span>
                <select id="selector-head" onClick={handleDroneHeadingType}>
                    <option value={DRONE_HEADING_TYPES.NEXT_COORD}>Next coordinate</option>
                    <option value={DRONE_HEADING_TYPES.GROUND_NODE}>Ground node</option>
                </select>
                    
            </div>
            <div id='selector-active-ground'>
                <label htmlFor="selector-gnd">Ground location active</label>
                <span>Choose the ground location of the measurement of interest</span>
                <select id="selector-gnd" onClick={handleGndActive}>
                    {
                        gndmarkers?.length > 0 ? gndmarkers.map((entry,cnt)=>{
                            return (
                                    <option key={cnt} value={`ground-${cnt}`}>Ground location {cnt+1}</option>
                            )
                        }): <option value="no-gnd">No gnd placed yet</option>
                    }
                </select>
            </div>
        </section>
    )
}