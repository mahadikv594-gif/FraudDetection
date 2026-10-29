import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { Navbar } from './components/Navbar';
import { AnimatedCyberBackground } from './components/AnimatedCyberBackground';
import { HomeView } from './components/HomeView';
import { DetectFraudView } from './components/DetectFraudView';
import { FraudSimulationLabView } from './components/FraudSimulationLabView';
import { DashboardView } from './components/DashboardView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { ModelEvaluationView } from './components/ModelEvaluationView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { RealTimeAlertBanner } from './components/RealTimeAlertBanner';
import { AuthModal } from './components/AuthModal';
import { SourceCodeExportModal } from './components/SourceCodeExportModal';
import { AiChatbot } from './components/AiChatbot';
import { Footer } from './components/Footer';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageVariants: Variants = {
    initial: { opacity: 0, y: 12, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.2, ease: 'easeInOut' } },
  };

  return (
    <AuthProvider>
      <TransactionProvider>
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
          {/* Animated Background Cyber Matrix */}
          <AnimatedCyberBackground />

          {/* Top Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenExportModal={() => setIsExportOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
          />

          {/* Core Content Routing with Fluid Motion Transitions */}
          <main className="flex-1 pt-24 relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <HomeView
                    onNavigate={handleNavigate}
                    onOpenExportModal={() => setIsExportOpen(true)}
                  />
                </motion.div>
              )}

              {activeTab === 'detect' && (
                <motion.div
                  key="detect"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <DetectFraudView
                    onNavigateToHistory={() => handleNavigate('history')}
                    onNavigateToDashboard={() => handleNavigate('dashboard')}
                  />
                </motion.div>
              )}

              {activeTab === 'simulation' && (
                <motion.div
                  key="simulation"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <FraudSimulationLabView />
                </motion.div>
              )}

              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <DashboardView
                    onNavigateToDetect={() => handleNavigate('detect')}
                    onNavigateToHistory={() => handleNavigate('history')}
                  />
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <TransactionHistoryView onNavigateToDetect={() => handleNavigate('detect')} />
                </motion.div>
              )}

              {activeTab === 'models' && (
                <motion.div
                  key="models"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <ModelEvaluationView />
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <AboutView onOpenExportModal={() => setIsExportOpen(true)} />
                </motion.div>
              )}

              {activeTab === 'contact' && (
                <motion.div
                  key="contact"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <ContactView />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Real-Time Live Fraud Alert Pop-up Notification Banner */}
          <RealTimeAlertBanner onNavigateToHistory={() => handleNavigate('history')} />

          {/* Sentinel AI Copilot & Voice Assistant */}
          <AiChatbot
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onOpen={() => setIsChatOpen(true)}
            onNavigateToDetect={() => handleNavigate('detect')}
            onNavigateToSimulation={() => handleNavigate('simulation')}
          />

          {/* Multi-role Auth Modal */}
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

          {/* Python Flask Backend & ML Training Source Code Modal */}
          <SourceCodeExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
          />

          {/* Platform Footer */}
          <Footer
            onNavigate={handleNavigate}
            onOpenExportModal={() => setIsExportOpen(true)}
          />
        </div>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
