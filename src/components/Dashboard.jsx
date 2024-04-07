import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { useDashboardInfo } from "../hooks/useDashboardInfo";

export function Dashboard() {
  const {
    totalFlightTime,
    consumed_battery_time,
    handleChangeHoverTime,
    seAvgDroneBatt,
    handleChangeHeight,
  } = useDashboardInfo();

  const doughnutChartData = {
    labels: ["Dropped", "Remaining"],
    datasets: [
      {
        label: "Level",
        data: [consumed_battery_time, 100 - consumed_battery_time],
        backgroundColor: ["rgb(0,0,0)", "rgb(255,255,255)"],
        borderColor: "#f3f2f2",
        hoverOffset: 4,
      },
    ],
  };
  return (
    <section className="flex flex-row gap-x-3 w-full">
      <div className="flex flex-col justify-between rounded border border-zinc-200 bg-customOrange px-5 py-4 w-2/6">
        <div>
          <div className="flex flex-row justify-between gap-x-2">
            <label
              htmlFor="drone-hover-time-input"
              className="text-center font-thin text-lg"
            >
              Hovering time per drone location [s]{" "}
            </label>
            <input
              type="number"
              id="drone-hover-time-input"
              min="0"
              placeholder="60"
              className="rounded border border-zinc-100 text-center w-1/5 font-thin"
              onChange={(e) => handleChangeHoverTime(e)}
            />
          </div>
          <span className="text-left font-thin text-sm">
            {" "}
            The drone will hover at each location for the specified time.
          </span>
        </div>
        <div>
          <div className="flex flex-row justify-between">
            <label
              htmlFor="drone-height"
              className="text-center font-thin text-lg"
            >
              Height for the measurement [m]
            </label>
            <input
              type="number"
              id="drone-height"
              min="0"
              placeholder="40"
              className="rounded border border-zinc-100 text-center w-1/5 font-thin"
              onChange={(e) => handleChangeHeight(e)}
            />
          </div>
          <span className="text-left font-thin text-sm">
            {" "}
            Drone will fly at the same height until the end of the experiment.
          </span>
        </div>
      </div>
      <div className="flex flex-row gap-x-5 px-10 py-5 border border-zinc-200 rounded justify-between w-4/6 bg-customOrange">
        <div className="flex flex-col gap-y-5">
          <label
            htmlFor="avg-batt-drop"
            className="text-center font-thin text-2xl"
          >
            Avg. % battery drop per second
          </label>
          <input
            className="rounded border border-zinc-100 text-center w-3/5 item-center mx-auto font-thin"
            type="number"
            min="0"
            id="avg-batt-drop"
            placeholder="4.5/50"
            onChange={(e) => seAvgDroneBatt(e.target.value)}
          ></input>
        </div>
        <div className="flex flex-col gap-y-5 w-30">
          <p className="text-center font-thin text-2xl text-wrap">
            Total flight time
          </p>
          <span className="text-center mx-auto font-thin text-xl">
            {totalFlightTime.toFixed(2)} s
          </span>
        </div>
        <div className="flex flex-col gap-y-5 w-30">
          <p className="text-center font-thin text-2xl text-wrap">
            Drone consumed battery on the measurement
          </p>
          <span className="text-center mx-auto font-thin text-xl">
            {" "}
            {consumed_battery_time.toFixed(2)} %{" "}
          </span>
        </div>
        <div className="w-28">
          <Doughnut
            data={doughnutChartData}
            options={{ plugins: { legend: false } }}
          />
        </div>
      </div>
    </section>
  );
}
