import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Dashboard from "../pages/DashboardPage";
import BookLessonsList from "../pages/BookLessonsList";
import LessonView from "../pages/LessonView";
import BooksList from "../pages/BooksList";
import QuizPage from "../pages/QuizPage";
import SignUp from "../pages/SignUp";
import Login from "../pages/Login";
import Account from "../pages/Account";
import ProtectedRoute from "../components/ProtectedRoute";
import SentenceChecker from "../pages/SentenceChecker";

//: variables to be used to read book and lesson id
export const router = createBrowserRouter([
  {
    path: "/",
    // make sure all pages have the nav alout
    element: <AppLayout />, 
    children: [
      { index: true, element: <BooksList /> },
      { path: "books", element: <BooksList /> },
      { path: "books/:bookId/lessons", element: <BookLessonsList /> },
      { path: "books/:bookId/lessons/:lessonId", element: <LessonView /> },
      { path: "books/:bookId/lessons/:lessonId/quiz", element: <QuizPage /> },
      { path: "books/:bookId/quiz", element: <QuizPage /> },
      { path: "checker", element: <SentenceChecker /> },
      { path: "dashboard", element: <Dashboard />},
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
    ],
  },
 // need login for account page, redirect to login
  {
    path: "/account",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <Account /> }],
  },
]);