import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/navbar.css";
import "./styles/books.css";
import "./styles/dashboard.css";
import "./styles/lesson.css";
import "./styles/quiz.css";
import "./styles/auth.css";
import "./styles/account.css";
import "./styles/sentenceChecker.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
