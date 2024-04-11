import vtt_logo from "../assets/vtt-logo.svg";
import { BannerSchedulerSVG } from "./SvgIcons.jsx";
import { Link } from "react-router-dom";

export function NavigationBar() {
  return (
    <nav className="flex flex-row justify-between gap-x-16 max-w-full w-screen h-26 bg-white">
      <img src={vtt_logo} alt="VTT logo" className="h-full max-h-full" />
      <div className="flex flex-col mx-2 py-1 mt-1">
        <Link to="/wireless-meas-planner/">
          <h1 className="font-bold text-4xl text-orange-400 hover:text-orange-200">
            aerial-flight-planner
          </h1>
        </Link>
        <span className="font-bold text-lg text-orange-400">
          Wireless channel measurements planner
        </span>
      </div>
      <div className="my-auto hover:cursor-pointer mr-28 pr-28">
        <Link to="/wireless-meas-planner/scheduler">
          <BannerSchedulerSVG></BannerSchedulerSVG>
        </Link>
      </div>
    </nav>
  );
}
