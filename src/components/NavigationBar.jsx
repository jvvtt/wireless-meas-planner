import vtt_logo from "../assets/vtt-logo.svg";
import { BannerSchedulerSVG } from "./SvgIcons.jsx";
import { Link } from "react-router-dom";

export function NavigationBar() {
  return (
    <nav className="flex flex-row justify-between bg-orange-400 max-w-full w-full h-20">
      <div className="flex flex-col mx-12 py-1 mt-1">
        <Link to="/wireless-meas-planner/">
          <h1 className="font-semibold text-3xl text-white hover:text-orange-200">
            aerial-flight-planner
          </h1>
        </Link>
        <span className="font-medium text-white text-sm">
          Wireless channel measurements planner
        </span>
      </div>
      <div className="my-auto hover:cursor-pointer">
        <Link to="/wireless-meas-planner/scheduler">
          <BannerSchedulerSVG></BannerSchedulerSVG>
        </Link>
      </div>
      <img src={vtt_logo} alt="VTT logo" className="h-full max-h-full" />
    </nav>
  );
}
