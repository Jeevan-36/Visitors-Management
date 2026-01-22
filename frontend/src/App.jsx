import { UserContextProvider } from "./context/UserContextProvider";
import { Outlet, Link } from "react-router-dom";
const App = () => {
  return (
    <UserContextProvider>
      <div className="w-full max-h-screen">
        <Outlet></Outlet>
      </div>
    </UserContextProvider>
  );
};

export default App;
