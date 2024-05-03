/* eslint-disable react/prop-types */
import { ActionSVG } from "./SvgIcons.jsx";
import { convertSeconds } from "../logic/utils.js";
import { NavigationBar } from "./NavigationBar.jsx";
import { useContext } from "react";
import { FiltersContext } from "../context/filters.jsx";
import { useMeasurementSeqOrderB } from "../logic/scheduler.js";
import { SpeedFilters, FlightPlanFilters } from "./Filters.jsx";

export function PageScheduler() {
  return (
    <>
      <NavigationBar></NavigationBar>
      <div className="flex flex-row bg-slate-50">
        <div className="flex flex-col w-1/6 bg-slate-100 pt-10 pb-4 gap-y-2">
          <SpeedFilters></SpeedFilters>
          <FlightPlanFilters></FlightPlanFilters>
        </div>
        <SchedulerContent></SchedulerContent>
      </div>
    </>
  );
}

function SchedulerContent() {
  const { filters, setFiltersState } = useContext(FiltersContext);

  const handleSetTime = (e) => {
    setFiltersState((prevState) => ({
      ...prevState,
      startMeasTime: e.target.value,
    }));
  };

  const schedulerNotReady =
    filters.droneHeights.length === 0 || filters.poiGndHeading.length === 0;

  return (
    <article className="flex flex-col mt-16 w-5/6 mx-auto px-12">
      <header className="flex flex-row justify-between py-5 px-6 rounded">
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
            Measurement start time
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
      {schedulerNotReady ? (
        <MissingInputSection
          heightsLength={filters.droneHeights.length}
          poiLength={filters.poiGndHeading.length}
        />
      ) : (
        <section className="flex flex-col my-10 pb-10">
          <header className="rounded grid grid-cols-7 justify-between py-1 my-6 bg-slate-100">
            <span className="font-bold text-center text-3xl mb-3 text-slate-500 col-span-1">
              Actions time
            </span>

            <span className="font-bold text-center text-3xl mb-3 text-slate-500 col-span-2">
              Drone Operator
            </span>

            <span className="font-bold text-center text-3xl mb-3 text-slate-500 col-span-2">
              Software Operator
            </span>

            <span className="font-bold text-center text-3xl mb-3 text-slate-500 col-span-2">
              Van Operator
            </span>
          </header>
          <RowCard
            initialDatetime={filters.startMeasTime?.split("T")[1]}
          ></RowCard>
        </section>
      )}
    </article>
  );
}

function MissingInputSection({ heightsLength, poiLength }) {
  return (
    <section className="flex flex-col gap-y-4">
      {heightsLength > 0 ? (
        <span className="mt-12 text-slate-500 text-3xl font-bold">
          You have entered at least one height
        </span>
      ) : (
        <span className="mt-12 text-slate-500 text-3xl font-bold">
          You have NOT entered at least one height
        </span>
      )}
      {poiLength > 0 ? (
        <span className="text-slate-500 text-3xl font-bold">
          You have enter the POI reference for the ground gimbal
        </span>
      ) : (
        <span className="text-slate-500 text-3xl font-bold">
          You have NOT enter the POI reference for the ground gimbal
        </span>
      )}
    </section>
  );
}

function RowCard({ initialDatetime }) {
  //const { initialSchedulerState } = useMeasurementSeqCase1();
  const {
    initialSchedulerState,
    droneActionsDuration,
    softwareActionsDuration,
    driverActionsDuration,
  } = useMeasurementSeqOrderB();

  let previousTime = initialDatetime + ":00";
  let startTime, endTime, endTimeDrone, endTimeDriver, endTimeSoftware;

  return (
    <div className="flex flex-col">
      {initialSchedulerState.DRONE_OPERATOR.map((droneActionSet, cnt) => {
        startTime = previousTime;
        /*endTimeDrone = convertSeconds(startTime, droneActionsDuration[cnt]);
        endTimeDriver = convertSeconds(startTime, driverActionsDuration[cnt]);
        endTimeSoftware = convertSeconds(
          startTime,
          softwareActionsDuration[cnt]
        );
        */
        //endTime = Math.max(endTimeDrone, endTimeDriver, endTimeSoftware);
        endTime = convertSeconds(startTime, droneActionsDuration[cnt]);
        previousTime = endTime;
        return (
          <div key={cnt} className="grid grid-cols-7 justify-between">
            <TimeCard
              startTime={startTime}
              endTime={endTime}
              colSpan="1"
            ></TimeCard>
            <OperatorActionsSet
              actionsSet={droneActionSet}
              colSpan="2"
            ></OperatorActionsSet>
            <OperatorActionsSet
              actionsSet={initialSchedulerState.SOFTWARE_OPERATOR[cnt]}
              colSpan="2"
            ></OperatorActionsSet>
            <OperatorActionsSet
              actionsSet={initialSchedulerState.DRIVER_OPERATOR[cnt]}
              colSpan="2"
            ></OperatorActionsSet>
          </div>
        );
      })}
    </div>
  );
}

function OperatorActionsSet({ actionsSet, colSpan }) {
  //  console.log("OperatorActionsSet", actionsSet);
  return (
    <div className={`flex flex-col col-span-${colSpan}`}>
      {actionsSet.map((state, cnt) => {
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
    <div className="flex flex-col">
      <div className="flex flex-row rounded border border-zinc-100 bg-white my-1 py-2 mx-6 px-3 shadow-sm">
        <div className="w-1/6 ml-4 my-auto">
          <ActionSVG actionType={actionType}></ActionSVG>
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
    </div>
  );
}

function TimeCard({ startTime, endTime, colSpan }) {
  return (
    <article className={`flex flex-col items-center col-span-${colSpan}`}>
      <div className="flex flex-row justify-between gap-x-8">
        <span className="text-slate-300 text-xl font-bold">Start</span>{" "}
        <span className="font-medium text-lg text-slate-600">{startTime}</span>
      </div>
      <div className="flex flex-row justify-between gap-x-8">
        <span className="text-slate-300 text-xl font-bold">Stop</span>{" "}
        <span className="font-medium text-lg text-slate-600">{endTime}</span>
      </div>
    </article>
  );
}
