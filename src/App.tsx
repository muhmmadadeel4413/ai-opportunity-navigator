// Local Git connection test
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { AuthForm } from "./components/AuthForm";
import Landing from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Matches } from "./pages/Matches";
import { Saved } from "./pages/Saved";
import InternshipFinder from "./pages/InternshipFinder";
import ScholarshipFinder from "./pages/ScholarshipFinder";
import HackathonFinder from "./pages/HackathonFinder";
import FellowshipFinder from "./pages/FellowshipFinder";
import JobFinder from "./pages/JobFinder";
import AISmartSearch from "./pages/AISmartSearch";
import AICareerCoach from "./pages/AICareerCoach";
import ApplicationTracker from "./pages/ApplicationTracker";
import AIRecommendations from "./pages/AIRecommendations";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import CareerRoadmap from "./pages/CareerRoadmap";
import DeadlineReminders from "./pages/DeadlineReminders";
import StudyPlanner from "./pages/StudyPlanner";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthForm />} />

          {/* Onboarding (no layout nav during onboarding) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected routes with layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Layout>
                  <Matches />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Layout>
                  <Saved />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/internship-finder"
            element={
              <ProtectedRoute>
                <Layout>
                  <InternshipFinder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scholarship-finder"
            element={
              <ProtectedRoute>
                <Layout>
                  <ScholarshipFinder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hackathon-finder"
            element={
              <ProtectedRoute>
                <Layout>
                  <HackathonFinder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fellowship-finder"
            element={
              <ProtectedRoute>
                <Layout>
                  <FellowshipFinder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-finder"
            element={
              <ProtectedRoute>
                <Layout>
                  <JobFinder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-smart-search"
            element={
              <ProtectedRoute>
                <Layout>
                  <AISmartSearch />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-career-coach"
            element={
              <ProtectedRoute>
                <Layout>
                  <AICareerCoach />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/application-tracker"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApplicationTracker />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-recommendations"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIRecommendations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analysis"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResumeAnalysis />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-roadmap"
            element={
              <ProtectedRoute>
                <Layout>
                  <CareerRoadmap />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deadline-reminders"
            element={
              <ProtectedRoute>
                <Layout>
                  <DeadlineReminders />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-planner"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudyPlanner />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}