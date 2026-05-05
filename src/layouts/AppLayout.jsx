
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="main-content">
      {/* renders current page */}
        <Outlet /> 
      </main>
    </>
  );
}

