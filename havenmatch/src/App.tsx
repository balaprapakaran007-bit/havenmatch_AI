import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LifestyleProvider } from './context/LifestyleContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Toast } from './components/common/Toast';
import { VisitSchedulerModal } from './components/visit/VisitSchedulerModal';
import { propertyService } from './services/propertyService';
import { Property } from './types';

// 14 Dedicated Page Routes
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { ChooseRolePage } from './pages/ChooseRolePage';
import { GoalPage } from './pages/GoalPage';
import { BasicDetailsPage } from './pages/BasicDetailsPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { ProfilePage } from './pages/ProfilePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { LocationIntelligencePage } from './pages/LocationIntelligencePage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AddPropertyPage } from './pages/AddPropertyPage';
import { BuyerMatchesPage } from './pages/BuyerMatchesPage';
import { MessagesPage } from './pages/MessagesPage';
import { ComparePage } from './pages/ComparePage';

const AppContent: React.FC = () => {
  const { openVisitModal, setOpenVisitModal, visitTargetPropertyId } = useApp();
  const [visitProperty, setVisitProperty] = React.useState<Property | null>(null);

  React.useEffect(() => {
    if (visitTargetPropertyId) {
      propertyService.getPropertyById(visitTargetPropertyId).then((p) => {
        if (p) setVisitProperty(p);
      });
    }
  }, [visitTargetPropertyId]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          {/* 1. Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* 2. Authentication Page */}
          <Route path="/auth" element={<AuthPage />} />

          {/* 3. Choose Role Page */}
          <Route path="/choose-role" element={<ChooseRolePage />} />

          {/* 4. Goal Page */}
          <Route path="/goal" element={<GoalPage />} />

          {/* 5. Basic Details Page */}
          <Route path="/basic-details" element={<BasicDetailsPage />} />

          {/* 6. Lifestyle Preferences Page */}
          <Route path="/preferences" element={<PreferencesPage />} />

          {/* 7. Lifestyle Profile Page */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* 8. Recommendations Page */}
          <Route path="/recommendations" element={<RecommendationsPage />} />

          {/* 9. Property Details Page */}
          <Route path="/property/:id" element={<PropertyDetailPage />} />

          {/* 10. Location Intelligence / Map Page */}
          <Route path="/property/:id/location" element={<LocationIntelligencePage />} />

          {/* 11. Buyer Dashboard Page */}
          <Route path="/buyer/dashboard" element={<BuyerDashboardPage />} />

          {/* 12. Owner Dashboard Page */}
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />

          {/* 13. Add Property Page */}
          <Route path="/owner/add-property" element={<AddPropertyPage />} />

          {/* 14. Buyer Matches Page */}
          <Route path="/owner/matches" element={<BuyerMatchesPage />} />

          {/* 15. Messages / In-App Chat Page */}
          <Route path="/messages" element={<MessagesPage />} />

          {/* 16. Compare Properties Page */}
          <Route path="/compare" element={<ComparePage />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <Toast />

      {/* Global Visit Scheduler Modal */}
      {openVisitModal && visitProperty && (
        <VisitSchedulerModal
          property={visitProperty}
          isOpen={openVisitModal}
          onClose={() => setOpenVisitModal(false)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <LifestyleProvider>
          <AppContent />
        </LifestyleProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
