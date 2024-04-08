import vtt_logo from "../assets/vtt-logo.svg";
import { BannerSchedulerSVG } from "./SvgIcons.jsx";

export function NavigationBar() {
  return (
    <nav className="flex flex-row justify-between bg-orange-400 max-w-full w-full h-20">
      <div className="flex flex-col mx-12 py-1 mt-1">
        <h1 className="font-semibold text-3xl text-white">
          aerial-flight-planner
        </h1>
        <span className="font-medium text-white text-sm">
          Wireless channel measurements planner
        </span>
      </div>
      <div className="my-auto hover:cursor-pointer">
        <BannerSchedulerSVG></BannerSchedulerSVG>
      </div>
      <img src={vtt_logo} alt="VTT logo" className="h-full max-h-full" />
    </nav>
  );
}
