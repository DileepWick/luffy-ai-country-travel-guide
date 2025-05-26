import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<Signup />} path="/signup" />
      <Route element={<Login />} path="/login" />
    </Routes>
  );
}

export default App;
