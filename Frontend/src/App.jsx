import {Route, Routes,Navigate} from "react-router-dom";
import HomePage from "./Page/HomePage.jsx";
import SignupPage from "./Page/SignupPage.jsx";
import LoginPage from "./Page/LoginPage.jsx";
import OnboardingPage from "./Page/OnboardingPage.jsx";
import NotificationPage from "./Page/NotificationPage.jsx";
import CallPage from "./Page/CallPage.jsx";
import ChatPage from "./Page/ChatPage.jsx";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import pageloader from "../src/component/pageloader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "../src/component/Layout.jsx";
import { useState } from "react";
import { useThemeStore } from "./store/useThemeStore.js";
import { Outlet } from "react-router-dom";
import Navbar from "./component/Navbar.jsx";
import Sidebar from "./component/Sidebar.jsx";




const App = () => {
  const { isLoading, authUser } = useAuthUser();

  const { theme } = useThemeStore();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
const isAuthenticated = !!authUser;
const isOnboardingCompleted = authUser?.isOnboarded;

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>

        {/* PROTECTED ROUTES */}
        <Route
          element={
            isAuthenticated && isOnboardingCompleted ? (
              <Layout showSidebar={true} />
            ) : (
              <Navigate
                to={!isAuthenticated ? "/login" : "/onboarding"}
              />
            )
          }
        >
          <Route path="/" element={<HomePage />} />

          {/* FRIENDS PAGE */}
          <Route path="/friends" element={<HomePage />} />

          {/* NOTIFICATIONS PAGE */}
          <Route
            path="/notifications"
            element={<NotificationPage />}
          />

          {/* CALL PAGE */}
          <Route path="/call/:id" element={<CallPage />} />

          {/* CHAT PAGE */}
          <Route path="/chat/:id" element={<ChatPage />} />
        </Route>

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignupPage />
            ) : (
              <Navigate
                to={isOnboardingCompleted ? "/" : "/onboarding"}
              />
            )
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate
                to={isOnboardingCompleted ? "/" : "/onboarding"}
              />
            )
          }
        />

        {/* ONBOARDING */}
        <Route
          path="/onboarding"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" />
            ) : isOnboardingCompleted ? (
              <Navigate to="/" />
            ) : (
              <OnboardingPage />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;