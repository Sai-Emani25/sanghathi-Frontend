import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import api from "./utils/axios";

import { HelmetProvider } from "react-helmet-async";
import { AuthContext } from "./context/AuthContext";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

const domNode = document.getElementById("root");
// Set Authorization header from localStorage token on app startup
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
const root = createRoot(domNode);

root.render(
  <AuthContextProvider>
    <HelmetProvider>
      <SettingsProvider>
        <Router>
          <App />
        </Router>
      </SettingsProvider>
    </HelmetProvider>
  </AuthContextProvider>

);