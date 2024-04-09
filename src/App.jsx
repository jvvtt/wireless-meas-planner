import "./App.css";
import { MapToInteract } from "./components/MapToInteract";
import { InfoCanvas } from "./components/InfoCanvas";
import { PDRSZonesProvider } from "./context/pdrszones.jsx";
import { saveAs } from "file-saver";
import { Dashboard } from "./components/Dashboard.jsx";
import { OpenInfo } from "./components/OpenInfo";
import { Scheduler } from "./components/Scheduler.jsx";
import { NavigationBar } from "./components/NavigationBar.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const infoCavasDevelopment = false;
const router = createBrowserRouter([
  {
    path: "/wireless-meas-planner/",
    element: <MainPage />,
  },
  {
    path: "/wireless-meas-planner/scheduler",
    element: <Scheduler />,
  },
]);

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

  return <RouterProvider router={router} />;
}

function MainPage() {
  return (
    <>
      <NavigationBar></NavigationBar>
      <div className="body-content">
        <OpenInfo></OpenInfo>
        <PDRSZonesProvider>
          <MapToInteract></MapToInteract>
          {infoCavasDevelopment && <InfoCanvas></InfoCanvas>}
          <Dashboard></Dashboard>
        </PDRSZonesProvider>
      </div>
    </>
  );
}

export default App;
