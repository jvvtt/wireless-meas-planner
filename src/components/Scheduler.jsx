/* eslint-disable react/prop-types */
import { ActionSVG, TimeSVG } from "./SvgIcons.jsx";
import { convertSeconds } from "../logic/utils.js";
import { useSchedulerPreset } from "../hooks/useSchedulerPreset.js";
import { NavigationBar } from "./NavigationBar.jsx";
import { useContext } from "react";
import { FiltersContext } from "../context/filters.jsx";
import { findSiblingsInGOSA, findIdxInGOSA } from "../logic/scheduler.js";
import { ACTION_TYPES, ACTORS } from "../constants/constants";

export function Scheduler() {
  const { filters, setFiltersState } = useContext(FiltersContext);
  const handleSetTime = (e) => {
    setFiltersState((prevState) => ({
      ...prevState,
      startMeasTime: e.target.value,
    }));
  };

  const idxSiblings = findIdxInGOSA(
    ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.NAME
  );
  const siblings = findSiblingsInGOSA(
    ACTION_TYPES.SOFTWARE_OPERATOR.MOVE_DRONE_GIMBAL.NAME
  );

  console.log("Action: : idxSiblings: ", idxSiblings);
  console.log("Action: : siblings: ", siblings);

  return (
    <>
      <NavigationBar></NavigationBar>
      <article className="flex flex-col mt-16 w-10/12 mx-auto">
        <header className="flex flex-row justify-between bg-slate-100 py-5 px-6 rounded">
          <div>
            <h1 className="text-left font-extrabold text-5xl text-slate-500">
              Schedule of Measurement Actions
            </h1>
            <span className="text-center text-3xl text-slate-300 mb-4 font-bold">
              Place the nodes on the map to see here the schedule
            </span>
          </div>
          <div className="flex flex-col my-auto py-3 px-8">
            <label
              htmlFor="meas-time"
              className="text-center text-3xl text-slate-500 font-bold"
            >
              Measurement's start time
            </label>
            <input
              type="datetime-local"
              id="meas-time"
              min="2024-04-01T00:00"
              max="2050-12-31T23:59"
              className="font-bold text-xl w-3/4 text-slate-300 mx-auto bg-slate-100"
              value={filters.startMeasTime}
              onChange={(e) => handleSetTime(e)}
            />
          </div>
        </header>
        <section className="flex flex-row justify-between mt-8 gap-x-3 bg-slate-100 pl-8 py-6">
          <div className="w-2/12 flex flex-col py-3">
            <span className="font-bold text-center text-3xl mb-3 text-slate-500">
              Actions time
            </span>
            <TimeCardsContainer
              initialDatetime={filters.startMeasTime?.split("T")[1]}
            ></TimeCardsContainer>
          </div>
          <div className="w-10/12 flex flex-row justify-between gap-x-3">
            <div className="flex flex-col w-4/12 py-3 ">
              <span className="font-bold text-center text-3xl mb-4 text-slate-500">
                Drone Operator
              </span>
              <PresetDroneOperatorActionCards></PresetDroneOperatorActionCards>
            </div>
            <div className="flex flex-col w-4/12 py-3">
              <span className="font-bold text-center text-3xl mb-3 text-slate-500">
                Software Operator
              </span>
            </div>
            <div className="flex flex-col w-4/12 py-3">
              <span className="font-bold text-center text-3xl mb-3 text-slate-500">
                Van Operator
              </span>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

function PresetDroneOperatorActionCards() {
  const { initialSchedulerState } = useSchedulerPreset();

  return (
    <div className="flex flex-col">
      {initialSchedulerState.DRONE_OPERATOR.map((state, cnt) => {
        return (
          <ActionCard
            key={cnt}
            actionType={state.actionType}
            actionDescription={state.actionDescription}
            actionDuration={state.actionDuration}
          ></ActionCard>
        );
      })}
    </div>
  );
}

function ActionCard({ actionType, actionDescription, actionDuration }) {
  return (
    <div className="flex flex-col m-y-0">
      <div className="flex flex-row rounded border border-zinc-200 bg-white my-2 py-3 mx-6 px-3 shadow-sm">
        <div className="w-1/6 ml-4">
          <ActionSVG actionType={actionType}></ActionSVG>
          <TimeSVG></TimeSVG>
        </div>
        <article className="flex flex-col text-wrap justify-center w-5/6">
          <div className="flex flex-row justify-center gap-x-4">
            <h2 className="font-bold text-center text-base text-slate-600">
              {actionType}
            </h2>
            <strong className="font-bold text-center text-base text-slate-300 italic">
              Action
            </strong>
          </div>
          <span className="font-normal text-center text-sm text-slate-700">
            {actionDescription}
          </span>
          <div className="flex flex-row justify-center gap-x-3">
            <span className="font-normal text-center text-base text-slate-500">
              {actionDuration} s
            </span>
            <span className="font-bold text-center text-base text-slate-300 italic">
              Duration
            </span>
          </div>
        </article>
      </div>
      {/*
      <button
        className="rounded-full text-center bg-orange-400 text-lg font-bold text-white w-8 h-8 pb-1 mx-auto"
        onClick={(e) => handleAddAction(e)}
      >
        +
      </button>
    */}
    </div>
  );
}

function TimeCardsContainer({ initialDatetime }) {
  const { initialSchedulerState } = useSchedulerPreset();
  let previousTime = initialDatetime + ":00";
  let startTime, endTime;

  return (
    <div className="flex flex-col gap-y-3 mt-2">
      {initialSchedulerState.DRONE_OPERATOR.map((state, cnt) => {
        startTime = previousTime;
        endTime = convertSeconds(startTime, state.actionDuration);
        previousTime = endTime;
        return (
          <TimeCard
            key={cnt}
            startTime={startTime}
            endTime={endTime}
          ></TimeCard>
        );
      })}
    </div>
  );
}

function TimeCard({ startTime, endTime }) {
  return (
    <article className="flex flex-col items-center pt-6 pb-6 mt-1 border border-slate-100">
      <div className="flex flex-row justify-between gap-x-8">
        <span className="text-center text-slate-300 text-xl font-bold">
          Start
        </span>{" "}
        <span className="text-center font-medium text-lg text-slate-600">
          {startTime}
        </span>
      </div>
      <div className="flex flex-row justify-between gap-x-8">
        <span className="text-center text-slate-300 text-xl font-bold">
          Stop
        </span>{" "}
        <span className="text-center font-medium text-lg text-slate-600">
          {endTime}
        </span>
      </div>
    </article>
  );
}
