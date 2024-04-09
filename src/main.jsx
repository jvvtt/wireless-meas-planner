import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { FiltersProvider } from "./context/filters";
import { DroneMarkersProvider } from "./context/dronemarkers.jsx";
import { GroundMarkersProvider } from "./context/groundmarkers.jsx";

//ReactDOM.createRoot(document.getElementById("root")).render(<App />);
ReactDOM.createRoot(document.getElementById("root")).render(
  <FiltersProvider>
    <GroundMarkersProvider>
      <DroneMarkersProvider>
        <App />
      </DroneMarkersProvider>
    </GroundMarkersProvider>
  </FiltersProvider>
);
