import { createContext, useState } from "react";
import { DRONE_HEADING_TYPES } from "../logic/utils.js";

export const FiltersContext = createContext();

// eslint-disable-next-line react/prop-types
export function FiltersProvider({ children }) {
  const [filters, setFiltersState] = useState({
    droneSpeed: 0.1,
    droneHeight: 40,
    gndSpeed: 10,
    droneHeadingType: DRONE_HEADING_TYPES.NEXT_COORD,
    gndActiveIdx: null,
    droneHoverTime: 60,
  });

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setFiltersState,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}
