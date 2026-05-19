import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../component/Navbar";
import Sidebar from "../component/Sidebar";

const Layout = ({ showSidebar = true }) => {
  return (
    <div className="h-screen bg-base-100">
      <div className="flex h-full overflow-hidden">
        {showSidebar && <Sidebar />}

        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-authuser?._to p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;


