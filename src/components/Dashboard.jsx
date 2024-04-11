import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { useDashboardInfo } from "../hooks/useDashboardInfo";

export function Dashboard() {
  const { totalFlightTime, consumed_battery_time, seAvgDroneBatt } =
    useDashboardInfo();

  const doughnutChartData = {
    labels: ["Dropped", "Remaining"],
    datasets: [
      {
        label: "Level",
        data: [consumed_battery_time, 100 - consumed_battery_time],
        backgroundColor: ["rgb(255,255,255)", "rgb(150,150,150)"],
        borderColor: "rgb(251 146 60)",
        hoverOffset: 4,
      },
    ],
  };
  return (
    <section className="flex flex-col my-12 gap-y-4">
      <header>
        <h1 className="text-left font-extrabold text-5xl text-slate-500">
          Dashboard
        </h1>
        <span className="text-3xl text-slate-300 mb-4 font-bold">
          Drone battery information, flight time, ...
        </span>
      </header>
      <div className="flex flex-row w-full gap-x-5 px-6 py-5 shadow-md shadow-orange-400/60 rounded justify-between bg-orange-400">
        <div className="flex flex-col gap-y-5 text-white my-auto">
          <label
            htmlFor="avg-batt-drop"
            className="text-center font-bold text-2xl"
          >
            Avg. % battery drop per second
          </label>
          <input
            className="rounded text-center w-3/5 item-center mx-auto font-base"
            type="number"
            min="0"
            id="avg-batt-drop"
            placeholder="4.5/50"
            onChange={(e) => seAvgDroneBatt(e.target.value)}
          ></input>
        </div>
        <div className="flex flex-col gap-y-5 w-30 text-white my-auto">
          <p className="text-center font-bold text-2xl text-wrap">
            Total flight time
          </p>
          <span className="text-center mx-auto font-bold text-xl">
            {totalFlightTime.toFixed(2)} s
          </span>
        </div>
        <div className="flex flex-col gap-y-5 w-30 text-white my-auto">
          <p className="text-center font-bold text-2xl text-wrap">
            Drone battery consumption
          </p>
          <span className="text-center mx-auto font-bold text-xl">
            {" "}
            {consumed_battery_time.toFixed(2)} %{" "}
          </span>
        </div>
        <div className="w-28 my-auto">
          <Doughnut
            data={doughnutChartData}
            options={{ plugins: { legend: false } }}
          />
        </div>
      </div>
    </section>
  );
}
