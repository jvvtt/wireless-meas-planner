/* eslint-disable react/prop-types */
import { DroneMarkersContext } from "../context/dronemarkers";
import { GroundMarkersContext } from "../context/groundmarkers";
import { ACTION_TYPES } from "../constants/constants";
import { useContext, useState } from "react";
import { useFilters } from "../hooks/useFilters";
import { cosineDistanceBetweenPoints } from "../logic/utils.js";
import { ActionSVG, TimeSVG } from "./SvgIcons.jsx";
import { convertSeconds } from "../logic/utils.js";
function useSchedulerPreset() {
  const { markers } = useContext(DroneMarkersContext);
  const { filters } = useFilters();
  const { gndmarkers } = useContext(GroundMarkersContext);

  let initialSchedulerState = [];
  for (let cnt = 0; cnt < markers.length; cnt++) {
    // Time duration from this to previous, given the chosen (actual) drone speed
    const duration = (markers[cnt].distToPrevious / filters.droneSpeed).toFixed(
      2
    );

    // Approx. distance between gnd and the first or last marker; from there
    // compute time duration of flight given the chosen (actual) drone speed
    let showMoveToGnd = false;
    let markerGroundDuration = 0;

    if (gndmarkers.length > 0 && filters.gndActiveIdx !== null) {
      markerGroundDuration = (
        cosineDistanceBetweenPoints(
          markers[cnt].lat,
          markers[cnt].lng,
          gndmarkers[filters.gndActiveIdx].lat,
          gndmarkers[filters.gndActiveIdx].lng
        ) / filters.droneSpeed
      ).toFixed(2);
      showMoveToGnd = true;
    }

    // Last marker
    if (cnt === markers.length - 1 && markers.length > 1) {
      initialSchedulerState.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
          cnt,
          cnt + 1
        ),
        actionDuration: duration,
      });
      initialSchedulerState.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
          cnt + 1
        ),
        actionDuration: filters.droneHoverTime,
      });

      if (showMoveToGnd) {
        initialSchedulerState.push({
          actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
          actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
            markers.length,
            "GND"
          ),
          actionDuration: markerGroundDuration,
        });
      }

      // First marker
    } else if (cnt === 0) {
      if (showMoveToGnd) {
        initialSchedulerState.push({
          actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
          actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
            "GND",
            1
          ),
          actionDuration: markerGroundDuration,
        });
      }

      initialSchedulerState.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
        actionDescription:
          ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(1),
        actionDuration: filters.droneHoverTime,
      });
      // Rest of the markers
    } else {
      initialSchedulerState.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
          cnt,
          cnt + 1
        ),
        actionDuration: duration,
      });

      initialSchedulerState.push({
        actionType: ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME,
        actionDescription: ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
          cnt + 1
        ),
        actionDuration: filters.droneHoverTime,
      });
    }
  }

  return { initialSchedulerState };
}

export function Scheduler() {
  const [measStartDatetime, setMeasStartDatetime] = useState(null);
  console.log(measStartDatetime?.split("T")[1]);
  return (
    <section className="flex flex-row justify-between mt-10 gap-x-2">
      <div className="w-1/12 flex flex-col">
        <label
          htmlFor="meas-time"
          className="text-center text-xl text-slate-300 "
        >
          Start time
        </label>
        <input
          type="datetime-local"
          id="meas-time"
          value="2024-05-01T19:30"
          min="2024-04-01T00:00"
          max="2050-12-31T23:59"
          className="font-thin text-sm"
          onChange={(e) => setMeasStartDatetime(e.target.value)}
        />
        <TimeCardsContainer
          initialDatetime={measStartDatetime?.split("T")[1]}
        ></TimeCardsContainer>
      </div>
      <div className="rounded border border-zinc-200 flex flex-col w-3/12 py-3 bg-customOrange">
        <span className="font-thin text-center text-3xl mb-3">
          Drone Operator
        </span>
        <PresetDroneOperatorActionCards></PresetDroneOperatorActionCards>
      </div>
      <div className="rounded border border-zinc-200 flex flex-col w-3/12 py-3 bg-customOrange">
        <span className="font-thin text-center text-3xl mb-3">
          Software Operator
        </span>
      </div>
      <div className="rounded border border-zinc-200 flex flex-col w-3/12 py-3 bg-customOrange">
        <span className="font-thin text-center text-3xl mb-3">
          Van Operator
        </span>
      </div>
      <div className="rounded border border-zinc-200 flex flex-col w-2/12 py-3 bg-customOrange">
        <span className="font-thin text-center text-3xl mb-3">Observer</span>
      </div>
    </section>
  );
}

function PresetDroneOperatorActionCards() {
  const { initialSchedulerState } = useSchedulerPreset();

  return (
    <div className="flex flex-col">
      {initialSchedulerState.map((state, cnt) => {
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
      <div className="flex flex-row rounded border border-zinc-200 bg-white mx-8 my-2 px-8 py-3">
        <div className="w-1/4">
          <ActionSVG actionType={actionType}></ActionSVG>
          <TimeSVG></TimeSVG>
        </div>
        <div className="w-3/4">
          <article className="flex flex-col text-wrap justify-center">
            <div className="flex flex-row justify-center gap-x-4">
              <h2 className="font-thin text-center text-xl">{actionType}</h2>
              <strong className="font-thin text-center text-xl text-slate-300 italic">
                Action
              </strong>
            </div>
            <span className="font-thin text-center text-lg text-slate-700">
              {actionDescription}
            </span>
            <div className="flex flex-row justify-center gap-x-3">
              <span className="font-thin text-center text-xl text-slate-500">
                {actionDuration} s
              </span>
              <span className="font-thin text-center text-xl text-slate-300 italic">
                Duration
              </span>
            </div>
          </article>
        </div>
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
    <div className="flex flex-col gap-y-10 mt-12">
      {initialSchedulerState.map((state, cnt) => {
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
    <article className="flex flex-col items-center my-4">
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

function PresetDroneOperatorActionCardsBACKUP() {
  const { markers } = useContext(DroneMarkersContext);
  const { filters } = useFilters();
  const { gndmarkers } = useContext(GroundMarkersContext);

  return (
    <div id="drone-operator-action-carss" className="flex flex-col">
      {markers.map((marker, cnt) => {
        // Time duration from this to previous, given the chosen (actual) drone speed
        const duration = (marker.distToPrevious / filters.droneSpeed).toFixed(
          2
        );

        // Approx. distance between gnd and the first or last marker; from there
        // compute time duration of flight given the chosen (actual) drone speed
        let showMoveToGnd = false;
        let markerGroundDuration = 0;
        if (gndmarkers.length > 0 && filters.gndActiveIdx !== null) {
          markerGroundDuration = (
            cosineDistanceBetweenPoints(
              marker.lat,
              marker.lng,
              gndmarkers[filters.gndActiveIdx].lat,
              gndmarkers[filters.gndActiveIdx].lng
            ) / filters.droneSpeed
          ).toFixed(2);
          showMoveToGnd = true;
        }

        // Last marker
        if (cnt === markers.length - 1 && markers.length > 1) {
          return (
            <div key={cnt} className="flex flex-col">
              <ActionCard
                actionType={ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME}
                actionDescription={ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                  cnt,
                  cnt + 1
                )}
                actionDuration={duration}
              ></ActionCard>
              <ActionCard
                actionType={ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME}
                actionDescription={ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
                  cnt + 1
                )}
                actionDuration={filters.droneHoverTime}
              ></ActionCard>
              {showMoveToGnd && (
                <ActionCard
                  actionType={ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME}
                  actionDescription={ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                    markers.length,
                    "GND"
                  )}
                  actionDuration={markerGroundDuration}
                ></ActionCard>
              )}
            </div>
          );
          // First marker
        } else if (cnt === 0) {
          return (
            <div key={cnt} className="flex flex-col">
              {showMoveToGnd && (
                <ActionCard
                  actionType={ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME}
                  actionDescription={ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                    "GND",
                    1
                  )}
                  actionDuration={markerGroundDuration}
                ></ActionCard>
              )}
              <ActionCard
                actionType={ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME}
                actionDescription={ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
                  1
                )}
                actionDuration={filters.droneHoverTime}
              ></ActionCard>
            </div>
          );
          // Rest of the markers
        } else {
          return (
            <div key={cnt} className="flex flex-col">
              <ActionCard
                actionType={ACTION_TYPES.DRONE_OPERATOR.MOVE.NAME}
                actionDescription={ACTION_TYPES.DRONE_OPERATOR.MOVE.SHORT_DESCRIPTION(
                  cnt,
                  cnt + 1
                )}
                actionDuration={duration}
              ></ActionCard>
              <ActionCard
                actionType={ACTION_TYPES.DRONE_OPERATOR.HOVER.NAME}
                actionDescription={ACTION_TYPES.DRONE_OPERATOR.HOVER.SHORT_DESCRIPTION(
                  cnt + 1
                )}
                actionDuration={filters.droneHoverTime}
              ></ActionCard>
            </div>
          );
        }
      })}
    </div>
  );
}
