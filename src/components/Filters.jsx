/* eslint-disable react/prop-types */
import "./Filters.css";
import { useId, useContext, useState } from "react";
import { useFilters } from "../hooks/useFilters.js";
import { DRONE_HEADING_TYPES } from "../logic/utils.js";
import { GroundMarkersContext } from "../context/groundmarkers.jsx";

export function Filters() {
  return (
    <div className="w-1/6 bg-slate-100 pt-10">
      <SpeedFilters></SpeedFilters>
      <section className="flex flex-col my-2 rounded gap-y-2">
        <FlightPlanFilters></FlightPlanFilters>
        <MapUIFilters></MapUIFilters>
      </section>
    </div>
  );
}

export function SpeedFilters() {
  const { filters, setFiltersState } = useFilters();

  const gndSpeed = useId();
  const droneSpeed = useId();

  const handleGndSpeed = (event) => {
    setFiltersState((previousState) => ({
      ...previousState,
      gndSpeed: event.target.value,
    }));
  };

  const handleDroneSpeed = (event) => {
    setFiltersState((previousState) => ({
      ...previousState,
      droneSpeed: event.target.value,
    }));
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col font-bold text-base justify-between rounded py-2 px-4 my-1 text-slate-500 gap-x-4">
        <div className="flex flex-row justify-between">
          <label htmlFor={droneSpeed} className="text-xl text-nowrap">
            Drone speed
          </label>
          <span className="font-base text-xl text-slate-300 text-nowrap">
            {filters.droneSpeed} m/s
          </span>
        </div>
        <input
          type="range"
          id={droneSpeed}
          min="0.1"
          step={0.1}
          max="5"
          onChange={handleDroneSpeed}
          value={filters.droneSpeed}
          className="appearance-none w-full my-auto h-6 bg-white outline-none opacity-60 transition-opacity hover:opacity-100 rounded"
        ></input>
      </div>
      <div className="flex flex-col font-bold text-base justify-between rounded py-2 px-4 my-1 text-slate-500 gap-x-4">
        <div className="flex flex-row justify-between">
          <label htmlFor={gndSpeed} className="text-xl text-nowrap">
            Ground speed
          </label>
          <span className="font-base text-xl text-slate-300 text-nowrap">
            {filters.gndSpeed} km/h
          </span>
        </div>
        <input
          type="range"
          step={1}
          id={gndSpeed}
          min="10"
          max="50"
          onChange={handleGndSpeed}
          value={filters.gndSpeed}
          className="appearance-none w-full my-auto h-6 bg-white outline-none opacity-60 transition-opacity hover:opacity-100 rounded"
        ></input>
      </div>
    </div>
  );
}

function MapUIFilters() {
  const { setFiltersState } = useFilters();
  const { gndmarkers } = useContext(GroundMarkersContext);
  const handleDroneHeadingType = (event) => {
    setFiltersState((previousState) => ({
      ...previousState,
      droneHeadingType: event.target.value,
    }));
  };

  const handleGndActive = (event) => {
    console.log(event.target.value);
    if (event.target.value !== "no-gnd") {
      console.log(event.target.selectedIndex);
      setFiltersState((previousState) => ({
        ...previousState,
        gndActiveIdx: event.target.selectedIndex,
      }));
    } else {
      setFiltersState((previousState) => ({
        ...previousState,
        gndActiveIdx: null,
      }));
    }
  };
  return (
    <>
      <div className="flex flex-col font-bold text-base rounded justify-around px-4 my-1 text-slate-500">
        <label htmlFor="selector-head" className="text-xl">
          Heading drone
        </label>
        <span className="text-align text-md text-slate-300">
          Where the heading direction points
        </span>
        <select
          id="selector-head"
          onClick={handleDroneHeadingType}
          className="text-center shadow"
        >
          <option
            value={DRONE_HEADING_TYPES.NEXT_COORD}
            className="font-bold text-lg"
          >
            Next coordinate
          </option>
          <option
            value={DRONE_HEADING_TYPES.GROUND_NODE}
            className="font-bold text-lg"
          >
            Ground node
          </option>
        </select>
      </div>
      <div className="flex flex-col font-bold text-base rounded justify-around px-4 my-1 text-slate-500">
        <label htmlFor="selector-gnd" className="text-xl">
          Ground location active
        </label>
        <span className="text-md text-slate-300">
          Choose the ground location of interest
        </span>
        <select
          id="selector-gnd"
          onClick={handleGndActive}
          className="text-center shadow"
        >
          {gndmarkers?.length > 0 ? (
            gndmarkers.map((entry, cnt) => {
              return (
                <option
                  key={cnt}
                  value={`ground-${cnt}`}
                  className="font-bold text-lg"
                >
                  Ground location {cnt + 1}
                </option>
              );
            })
          ) : (
            <option value="no-gnd" className="font-bold text-lg">
              No gnd placed yet
            </option>
          )}
        </select>
      </div>
    </>
  );
}

export function FlightPlanFilters() {
  const { filters, setFiltersState } = useFilters();
  const [inputHeightValue, setInputHeightValue] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(null);

  const handleChangeHoverTime = (e) => {
    setFiltersState((prevstate) => ({
      ...prevstate,
      droneHoverTime: Number(e.target.value),
    }));
  };

  const handleClickHeight = (e, index) => {
    setFiltersState((prevstate) => ({
      ...prevstate,
      droneHeight: Number(e.target.innerText),
    }));
    setSelectedIdx(index);
  };

  const handleChangeHeightValue = (e) => {
    setInputHeightValue(e.target.value);
  };

  const handleAddValue = (e) => {
    if (inputHeightValue.trim() !== "") {
      const copyFilters = structuredClone(filters);
      let heights = copyFilters.droneHeights;
      heights.push(Number(inputHeightValue));
      setFiltersState((prevstate) => ({
        ...prevstate,
        droneHeights: heights,
      }));
    }
  };

  return (
    <>
      <div className="flex flex-col font-bold text-base rounded justify-around px-4 my-1 text-slate-500">
        <label htmlFor="drone-hover-time-input" className="text-xl">
          Hover time [s]{" "}
        </label>
        <span className="text-md text-slate-300">
          {" "}
          The drone will hover at each location for the specified time.
        </span>

        <input
          type="number"
          id="drone-hover-time-input"
          min="0"
          placeholder="60"
          className="rounded border shadow text-center my-auto"
          onChange={(e) => handleChangeHoverTime(e)}
        />
      </div>
      <div className="flex flex-col font-bold text-base rounded justify-around px-4 my-1 text-slate-500">
        <label htmlFor="drone-height" className="text-xl">
          Drone height [m]{" "}
        </label>
        <span className="text-md text-slate-300">
          {" "}
          Enter a new height value for the drone
        </span>
        <div className="flex flex-row gap-x-2 justify-between">
          <input
            type="number"
            id="drone-height"
            min="0"
            placeholder="40"
            className="rounded border shadow text-center my-auto w-1/2"
            value={inputHeightValue}
            onChange={handleChangeHeightValue}
          />
          <button
            onClick={(e) => handleAddValue(e)}
            className="bg-blue-500 text-white text-base rounded w-1/2 my-auto"
          >
            Add height
          </button>
        </div>
      </div>
      <div className="flex flex-col font-bold text-base rounded justify-around px-4 my-1 text-slate-500">
        <label className="text-xl">List of heights</label>
        <div className="h-28 overflow-auto mt-3 border border-gray-300 rounded">
          {filters.droneHeights.length > 0 &&
            filters.droneHeights.map((value, index) => (
              <p
                key={index}
                onClick={(e) => handleClickHeight(e, index)}
                //onMouseEnter={() => setHoveredIndex(index)}
                //onMouseLeave={() => setHoveredIndex(null)}
                className={`cursor-pointer ${
                  selectedIdx === index ? "bg-gray-200" : ""
                } p-1 rounded`}
              >
                {value}
              </p>
            ))}
        </div>
      </div>
    </>
  );
}
