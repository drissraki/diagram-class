import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Tailwind CSS
import ClassDiagramPage from "./pages/ClassDiagramPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ClassDiagramPage />
  </React.StrictMode>
);
