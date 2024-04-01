import { createContext, useReducer, useState } from "react";
import { reducer, initialState } from "../reducers/groundmarkers.js";
import { DRAW_ACTION_TYPES } from "../logic/utils.js"

export const GroundMarkersContext = createContext()

function useGroundMarkerReducer() {
    const [state, dispatch] = useReducer(reducer, initialState)

    const onCreationGroundMarker = map => dispatch({
        type: DRAW_ACTION_TYPES.ADD_MARKER,
        payload: map
    })

    const onEditGroundMarker = map => dispatch({
        type: DRAW_ACTION_TYPES.EDIT_MARKER,
        payload: map
    })

    const onDeleteGroundMarker = () => dispatch({
        type: DRAW_ACTION_TYPES.DELETE,
        payload: null
    })

    return {state, onCreationGroundMarker, onEditGroundMarker, onDeleteGroundMarker}
}

export function GroundMarkersProvider ({children}) {
    const [lastGndMarkerId, setLastGndMarkerId] = useState(0)
    const {state, onCreationGroundMarker, onEditGroundMarker, onDeleteGroundMarker} = useGroundMarkerReducer()

    return(
        <GroundMarkersContext.Provider value={{gndmarkers:state, 
                                                onCreationGroundMarker, 
                                                onEditGroundMarker, 
                                                onDeleteGroundMarker,
                                                lastGndMarkerId,
                                                setLastGndMarkerId}}>
            {children}
        </GroundMarkersContext.Provider>
    )
}