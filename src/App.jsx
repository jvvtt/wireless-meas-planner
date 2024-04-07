import "./App.css";
import { MapToInteract } from "./components/MapToInteract";
import { DroneMarkersProvider } from "./context/dronemarkers.jsx";
import { InfoCanvas } from "./components/InfoCanvas";
import { FiltersProvider } from "./context/filters";
import { GroundMarkersProvider } from "./context/groundmarkers.jsx";
import { PDRSZonesProvider } from "./context/pdrszones.jsx";
import { saveAs } from "file-saver";
import { Dashboard } from "./components/Dashboard.jsx";
import { OpenInfo } from "./components/OpenInfo";
import { Scheduler } from "./components/Scheduler.jsx";

const infoCavasDevelopment = false;

function App() {
  const data = {
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    // Add more data as needed
  };

  const mySaveDataToFile = () => {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2); // null and 2 are for indentation

    // Create a new Blob with the JSON data
    const blob = new Blob([jsonData], { type: "application/json" });

    // Use FileSaver to save the Blob as a file
    saveAs(blob, "data.json");
  };

  //mySaveDataToFile()
  console.log("Data saved to file successfully!");

  return (
    <GroundMarkersProvider>
      <DroneMarkersProvider>
        <header className="header-app">
          <h1>Wireless Channel Measurements Planner</h1>
          <img src="public/vtt-logo.png" alt="VTT logo" />
        </header>
        <div className="body-content">
          <OpenInfo></OpenInfo>
          <PDRSZonesProvider>
            <FiltersProvider>
              <MapToInteract></MapToInteract>
              {infoCavasDevelopment && <InfoCanvas></InfoCanvas>}
              <Dashboard></Dashboard>
              <Scheduler></Scheduler>
            </FiltersProvider>
          </PDRSZonesProvider>
        </div>
      </DroneMarkersProvider>
    </GroundMarkersProvider>
  );
}

export default App;
