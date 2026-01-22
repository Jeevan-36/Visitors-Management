import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserContextProvider } from "./context/UserContextProvider";
import App from "./App.jsx";
import "./index.css";
import Login from "./components/Login.jsx";
import ManagerDashboard from "./components/Manager/ManageGuards.jsx";
import ResidentDashboard from "./components/Resident/ResidentDashboard.jsx";
import GuardDashboard from "./components/Guards/GuardDashboard.jsx";
import ManagerReports from "./components/Manager/ManagerReports.jsx";
import ManageResidents from "./components/Manager/ManageResidents.jsx";
import Settings from "./components/Settings.jsx";
import ManageGuards from "./components/Manager/ManageGuards.jsx";
import StatsSection from "./components/StatsSection.jsx";
import ResidentStatsSection from "./components/Resident/ResidentStatsSection.jsx";
import ResidentApprovals from "./components/Resident/ResidentApprovals.jsx";
import ResidentHistory from "./components/Resident/ResidentHistory.jsx";
import GuardReports from "./components/Guards/GuardReports.jsx";
import GuardVisits from "./components/Guards/GuardVisits.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/manager",
        element: <ManagerDashboard />,
        children: [
          {
            path: "",
            element: <StatsSection />,
          },
          {
            path: "reports",
            element: <ManagerReports />,
          },
          
          {
            path: "residents",
            element: <ManageResidents />,
          },
          {
            path:"guards",
            element:<ManageGuards/>
          },
          {
            path: "settings",
            element: <Settings />,
          },
        ],
      },

      {
        path: "/guard",
        element: <GuardDashboard />,
        children:[
          {
            path:"",
            element:<StatsSection/>
          },{
            path:"reports",
            element:<GuardReports/>
          },{
            path:"visits",
            element:<GuardVisits/>
          },
          {
            path: "settings",
            element: <Settings />,
          },
        ]
      },
      {
        path: "/resident",
        element: <ResidentDashboard />,
        children:[
          {
            path: "",
            element: <ResidentStatsSection />,
          },
          {
            path:'approvals',
            element:<ResidentApprovals/>
          },{
            path:'history',
            element:<ResidentHistory/>
          },
          {
            path: "settings",
            element: <Settings />,
          },
        ]
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);
