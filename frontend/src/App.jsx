import { UserContextProvider } from "./context/UserContextProvider";
import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <UserContextProvider>
      <div className="w-full min-h-screen">
        <Outlet />
      </div>
    </UserContextProvider>
  );
};

export default App;