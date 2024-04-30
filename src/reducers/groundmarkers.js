import { DRAW_ACTION_TYPES } from "../logic/utils";
import { latLng } from "leaflet";

export const initialState = [];

export function reducer(state, action) {
  const { type: actionType, payload: this_map } = action;

  switch (actionType) {
    case DRAW_ACTION_TYPES.ADD_MARKER: {
      const { layer } = this_map;
      const id = layer._leaflet_id;
      const n_states = state.length;

      let dist_this_marker_and_previous = 0;
      if (n_states > 0) {
        const coords = state[state.length - 1];
        dist_this_marker_and_previous = layer._map.distance(
          latLng(coords.lat, coords.lng),
          layer._latlng
        );
      }

      const newState = [
        ...state,
        {
          lat: layer._latlng.lat,
          lng: layer._latlng.lng,
          id: id,
          distToPrevious: dist_this_marker_and_previous,
        },
      ];
      return newState;
    }
    case DRAW_ACTION_TYPES.EDIT_MARKER: {
      const newState = state;
      return newState;
    }
    case DRAW_ACTION_TYPES.DELETE: {
      const newState = [];
      return newState;
    }
  }
  return state;
}
