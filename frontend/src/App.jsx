import { UserContextProvider } from "./context/UserContextProvider";
import { Outlet, Link } from "react-router-dom";
const App = () => {
  return (
    <UserContextProvider>
      <div className="w-full max-h-screen">
        <Link to="login" className="bg-black text-white">
          Login
        </Link>
        <Outlet></Outlet>
      </div>
    </UserContextProvider>
  );
};

export default App;
