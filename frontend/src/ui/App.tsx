import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import SubmitPage from "./SubmitPage";
import VaultPage from "./VaultPage";
import Dashboard from "../components/Dashboard";
import BalanceDebug from "../components/BalanceDebug";
import { ContractDebug } from "../components/ContractDebug";
import { ToastProvider } from "../contexts/ToastContext";
import { ServiceProvider } from "../contexts/ServiceContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <ServiceProvider>
            <Router>
              <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/submit" element={<SubmitPage />} />
                  <Route path="/vault" element={<VaultPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/debug" element={<BalanceDebug />} />
                  <Route path="/contract-debug" element={<ContractDebug />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </ServiceProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
