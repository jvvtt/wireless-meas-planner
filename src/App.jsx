import { MapToInteract } from "./components/MapToInteract";
import { PDRSZonesProvider } from "./context/pdrszones.jsx";
import { saveAs } from "file-saver";
import { Dashboard } from "./components/Dashboard.jsx";
import { OpenInfo } from "./components/OpenInfo";
import { PageScheduler } from "./components/Scheduler.jsx";
import { NavigationBar } from "./components/NavigationBar.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
//import { UserInputs } from "./components/UserInputs.jsx";
import { Filters } from "./components/Filters.jsx";

const router = createBrowserRouter([
  {
    path: "/wireless-meas-planner/",
    element: <MainPage />,
  },
  {
    path: "/wireless-meas-planner/scheduler",
    element: <PageScheduler />,
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
    <div className="bg-slate-50">
      <NavigationBar></NavigationBar>
      <PDRSZonesProvider>
        <div className="flex flex-row">
          <Filters></Filters>
          <div className="flex flex-col w-5/6 mx-auto px-20 pt-10">
            <OpenInfo></OpenInfo>
            <MapToInteract></MapToInteract>
            <Dashboard></Dashboard>
          </div>
        </div>
      </PDRSZonesProvider>
    </div>
  );
}

export default App;
