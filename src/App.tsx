
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PageTransition from './components/animation/PageTransition';
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import AccessControlPanel from "./pages/AccessControlPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ErrorPage from "./pages/ErrorPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import Creators from "./pages/Creators";
import CreatorOnboarding from "./pages/CreatorOnboarding";
import CreatorInviteOnboarding from "./pages/CreatorOnboarding/CreatorInviteOnboarding";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <PageTransition>
          <Dashboard />
        </PageTransition>
      </ProtectedRoute>
    ),
    errorElement: (
      <PageTransition>
        <ErrorPage />
      </PageTransition>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <PageTransition>
          <Login />
        </PageTransition>
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <PageTransition>
          <Register />
        </PageTransition>
      </PublicRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <PageTransition>
          <Profile />
        </PageTransition>
      </ProtectedRoute>
    ),
  },
  {
    path: "/user-management",
    element: (
      <ProtectedRoute>
        <PageTransition>
          <UserManagement />
        </PageTransition>
      </ProtectedRoute>
    ),
  },
  {
    path: "/access-control",
    element: (
      <ProtectedRoute>
        <PageTransition>
          <AccessControlPanel />
        </PageTransition>
      </ProtectedRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <PageTransition>
          <ForgotPassword />
        </PageTransition>
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicRoute>
        <PageTransition>
          <ResetPassword />
        </PageTransition>
      </PublicRoute>
    ),
  },
  {
    path: "/coming-soon",
    element: (
      <PageTransition>
        <ComingSoonPage />
      </PageTransition>
    ),
  },
  {
    path: "/creators",
    element: (
      <ProtectedRoute>
        <PageTransition>
          <Creators />
        </PageTransition>
      </ProtectedRoute>
    ),
  },
  {
    path: "/creators/onboard",
    element: (
      <ProtectedRoute>
        <PageTransition>
          <CreatorOnboarding />
        </PageTransition>
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboard/:token",
    element: (
      <PageTransition>
        <CreatorInviteOnboarding />
      </PageTransition>
    ),
  },
]);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
