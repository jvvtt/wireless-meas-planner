/* eslint-disable react/prop-types */
import { ActionSVG, TimeSVG } from "./SvgIcons.jsx";
import { convertSeconds } from "../logic/utils.js";
import { useSchedulerPreset } from "../hooks/useSchedulerPreset.js";
import { useState, useEffect } from "react";
import { NavigationBar } from "./NavigationBar.jsx";

export function Scheduler() {
  const [measStartDatetime, setMeasStartDatetime] = useState(null);

  useEffect(() => console.log("Scheduler is rendered"), []);
  return (
    <>
      <NavigationBar></NavigationBar>
      <article className="flex flex-col mt-10 w-10/12 mx-auto">
        <header>
          <h1 className="text-center font-normal text-5xl text-slate-500">
            Measurements and Flight plan
          </h1>
        </header>
        <section className="flex flex-row justify-between mt-10 gap-x-3">
          <div className="w-2/12 flex flex-col py-3">
            <label
              htmlFor="meas-time"
              className="text-center text-xl text-slate-300 mb-4"
            >
              Start time
            </label>
            <input
              type="datetime-local"
              id="meas-time"
              value="2024-05-01T19:30"
              min="2024-04-01T00:00"
              max="2050-12-31T23:59"
              className="font-thin text-sm mx-auto w-3/4"
              onChange={(e) => setMeasStartDatetime(e.target.value)}
            />
            <TimeCardsContainer
              initialDatetime={measStartDatetime?.split("T")[1]}
            ></TimeCardsContainer>
          </div>
          <div className="w-10/12 flex flex-row justify-between gap-x-3">
            <div className="flex flex-col w-4/12 py-3 ">
              <span className="font-normal text-center text-3xl mb-4 text-slate-500">
                Drone Operator
              </span>
              <PresetDroneOperatorActionCards></PresetDroneOperatorActionCards>
            </div>
            <div className="flex flex-col w-4/12 py-3">
              <span className="font-normal text-center text-3xl mb-3 text-slate-500">
                Software Operator
              </span>
            </div>
            <div className="flex flex-col w-4/12 py-3">
              <span className="font-normal text-center text-3xl mb-3 text-slate-500">
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
      <div className="flex flex-row rounded border border-zinc-200 bg-white my-2 py-3 mx-6">
        <div className="w-1/6 ml-4">
          <ActionSVG actionType={actionType}></ActionSVG>
          <TimeSVG></TimeSVG>
        </div>
        <article className="flex flex-col text-wrap justify-center w-5/6">
          <div className="flex flex-row justify-center gap-x-4">
            <h2 className="font-thin text-center text-base">{actionType}</h2>
            <strong className="font-thin text-center text-base text-slate-300 italic">
              Action
            </strong>
          </div>
          <span className="font-thin text-center text-sm text-slate-700">
            {actionDescription}
          </span>
          <div className="flex flex-row justify-center gap-x-3">
            <span className="font-thin text-center text-base text-slate-500">
              {actionDuration} s
            </span>
            <span className="font-thin text-center text-base text-slate-300 italic">
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
    <div className="flex flex-col mb-2 gap-y-8">
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
    <article className="flex flex-col items-center my-2 py-3">
      <div className="flex flex-row justify-between gap-x-3">
        <span className="text-center text-slate-300 text-base">Start</span> -
        <span className="text-center font-thin text-base">{startTime}</span>
      </div>
      <div className="flex flex-row justify-between gap-x-3">
        <span className="text-center text-slate-300 text-base">Stop</span> -
        <span className="text-center font-thin text-base">{endTime}</span>
      </div>
    </article>
  );
}
