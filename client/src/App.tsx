import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AcademicBanner } from './components/AcademicBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ComposerPage } from './pages/ComposerPage';
import { InteropLabPage } from './pages/InteropLabPage';
import { SmimePage } from './pages/SmimePage';
import { OpenPgpPage } from './pages/OpenPgpPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { DocumentationPage } from './pages/DocumentationPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FFFAF5] text-[#202020]">
        <AcademicBanner />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/interoperability" element={<InteropLabPage />} />
            <Route path="/composer" element={<ComposerPage />} />
            <Route path="/smime" element={<SmimePage />} />
            <Route path="/openpgp" element={<OpenPgpPage />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            {/* Fallback to home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
