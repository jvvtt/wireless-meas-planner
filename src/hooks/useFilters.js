import { FiltersContext } from '../context/filters.jsx'
import { useContext } from 'react'
import { DRONE_HEADING_TYPES, drone_heading_to_next_marker, drone_yaw_to_set } from '../logic/utils.js'
import GeometryUtil from 'leaflet-geometryutil'
import * as L from 'leaflet'

export function useFilters () {
    const {filters, setFiltersState} = useContext(FiltersContext)
  
    const timeToPrevious = (points, node) => {
        const kmh2ms = (1000/3600)
        return points.map(point => {
            return node === 'DRONE' ? point.distToPrevious/filters.droneSpeed : point.distToPrevious/(filters.gndSpeed*kmh2ms)
        })
    }

    const getDroneGimbalYaw = (drone_points, ground_points) => { 
        const lengthDirections = 35
        if (filters.gndActiveIdx === null) {
            
            return drone_points.map(point => (
                {
                    droneGimbalYaw: 0, 
                    droneHeadingBearing: 0,
                    lineGimbalDirection: [[point.lat, point.lng], [point.lat, point.lng]],
                    lineDroneHeading:[[point.lat, point.lng], [point.lat, point.lng]]
                }
            ))
                

        } else {
            let drone_angle_info;
            if (filters.droneHeadingType === DRONE_HEADING_TYPES.NEXT_COORD){
                drone_angle_info = drone_points.map((entry, cnt)=>{
                    let nextCoords;
            
                    if (cnt < drone_points.length - 1) {
                        nextCoords = L.latLng(drone_points[cnt+1].lat, drone_points[cnt+1].lng)    
                    }
                    else {
                        nextCoords = L.latLng(ground_points[filters.gndActiveIdx].lat, ground_points[filters.gndActiveIdx].lng)
                    }
            
                    const groundCoords = L.latLng(ground_points[filters.gndActiveIdx].lat, ground_points[filters.gndActiveIdx].lng)
                    const thisCoords = L.latLng(entry.lat, entry.lng)                    
            
                    const droneHeadingBearing = drone_heading_to_next_marker(thisCoords, nextCoords)
            
                    // SAVE THIS VALUE
                    const drone_gimbal_yaw_wrt_drone_head = drone_yaw_to_set(thisCoords, groundCoords, droneHeadingBearing)
    
                    const drone_gimbal_yaw_heading_point = GeometryUtil.destination(thisCoords, 
                                                                                    drone_gimbal_yaw_wrt_drone_head + droneHeadingBearing, 
                                                                                    lengthDirections)
                    const line_gimbal_direction = [[entry.lat, entry.lng], 
                                                   [drone_gimbal_yaw_heading_point.lat, 
                                                    drone_gimbal_yaw_heading_point.lng]]
    
                    const drone_heading_point = GeometryUtil.destination(thisCoords, 
                                                                         droneHeadingBearing, 
                                                                         lengthDirections)
    
                    const line_drone_heading = [[entry.lat, entry.lng], 
                                                [drone_heading_point.lat, 
                                                 drone_heading_point.lng]]
    
                    return {droneGimbalYaw: drone_gimbal_yaw_wrt_drone_head, 
                            droneHeadingBearing: droneHeadingBearing,
                            lineGimbalDirection: line_gimbal_direction,
                            lineDroneHeading:line_drone_heading}
                })
            } else if (filters.droneHeadingType === DRONE_HEADING_TYPES.GROUND_NODE){
                    drone_angle_info = drone_points.map(entry=>{
                        const thisCoords = L.latLng(entry.lat, entry.lng)
    
                        const droneHeadingBearing = GeometryUtil.bearing(thisCoords, 
                                                                         L.latLng(ground_points[filters.gndActiveIdx].lat, 
                                                                                  ground_points[filters.gndActiveIdx].lng))
    
                        const drone_gimbal_yaw_heading_point = GeometryUtil.destination(thisCoords, 
                                                                                        droneHeadingBearing, 
                                                                                        lengthDirections)
                        const line_gimbal_direction = [[entry.lat, entry.lng], 
                                                        [drone_gimbal_yaw_heading_point.lat, 
                                                         drone_gimbal_yaw_heading_point.lng]]
    
                        const drone_heading_point = GeometryUtil.destination(thisCoords, 
                                                                             droneHeadingBearing, 
                                                                             lengthDirections)
                        const line_drone_heading = [[entry.lat, entry.lng], 
                                                    [drone_heading_point.lat, 
                                                     drone_heading_point.lng]]
                    return {droneGimbalYaw: 0, 
                            droneHeadingBearing: droneHeadingBearing, 
                            lineGimbalDirection: line_gimbal_direction,
                            lineDroneHeading:line_drone_heading}
                })
            }
            return drone_angle_info
        }

    }

    return {setFiltersState, timeToPrevious, filters, getDroneGimbalYaw}
  }