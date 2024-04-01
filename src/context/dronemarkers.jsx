import { createContext, useReducer, useState } from "react";
import { initialState, reducer } from "../reducers/dronemarkers.js";
import { DRAW_ACTION_TYPES } from "../logic/utils.js"

export const DroneMarkersContext = createContext()

function useMapReducer(){
    const [state, dispatch] = useReducer(reducer, initialState)

    const onCreationMap = layer => dispatch({
        type: DRAW_ACTION_TYPES.ADD_MARKER,
        payload: layer
    })

    const onEditMove = map => dispatch({
        type: DRAW_ACTION_TYPES.EDIT_MARKER,
        payload: map
    })

    const onDelete = () => dispatch({
        type: DRAW_ACTION_TYPES.DELETE,
        payload: null
    })

    return { state, onCreationMap, onEditMove, onDelete}
}

// eslint-disable-next-line react/prop-types
export function DroneMarkersProvider({children}){
    const [lastMarkerId, setLastMarkerId] = useState(0)
    const {state, onCreationMap, onEditMove, onDelete} = useMapReducer()

    return(
        <DroneMarkersContext.Provider 
            value={{ markers: state, 
                    onCreationMap, 
                    onEditMove, 
                    onDelete,
                    lastMarkerId, 
                    setLastMarkerId}}>
            {children}
        </DroneMarkersContext.Provider>
    )
}