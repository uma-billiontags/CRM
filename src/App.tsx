import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/page/Home";
import Onboarding from "./components/page/Onboarding";
import Login from "./components/page/Login";
import Portal_Dashboard from "./components/page/Portal_Dashboard";
import Portal_Campaigns from "./components/page/Portal_Campaigns";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Page */}
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal_dashboard" element={<Portal_Dashboard />} />
        <Route path="/portal_campaigns" element={<Portal_Campaigns />} />
        {/* <Route path="/admin" element={<Admin />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;