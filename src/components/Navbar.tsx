import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Activity,
  Zap,
  BarChart3,
  History,
  BrainCircuit,
  Info,
  Mail,
  Bell,
  Volume2,
  VolumeX,
  User,
  LogOut,
  Code2,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { toggleSound } from '../lib/soundEffects';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenExportModal: () => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenExportModal,
  onOpenChat,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    activeModelMode,
    setActiveModelMode,
    alerts,
    unreadAlertCount,
    markAlertsAsRead,
    clearAlerts,
  } = useTransactions();

  const [isScrolled, setIsScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'detect', label: 'Detect Fraud', icon: Zap },
    { id: 'simulation', label: 'Simulation Lab', icon: Activity },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'models', label: 'ML Evaluation', icon: BrainCircuit },
    { id: 'about', label: 'About & Viva', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-cyan-950/20 py-2.5'
          : 'bg-[#070b14]/60 backdrop-blur-md border-b border-white/5 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-[#070b14] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white font-['Space_Grotesk']">
                FraudShield<span className="text-cyan-400 font-extrabold">.AI</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider hidden sm:block">
              DETECT • EXPLAIN • PROTECT
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors z-10 ${
                  isActive
                    ? 'text-cyan-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/25 via-indigo-500/20 to-purple-500/25 border border-cyan-500/40 rounded-lg shadow-sm -z-10"
                  />
                )}
                <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Model Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden md:inline font-semibold">
                {activeModelMode === 'ML_RANDOM_FOREST'
                  ? 'ML: Random Forest'
                  : activeModelMode === 'ML_LOGISTIC_REGRESSION'
                  ? 'ML: Logistic Reg.'
                  : 'DEMO MODE'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showModelDropdown && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  ACTIVE INFERENCE ENGINE
                </div>
                <button
                  onClick={() => {
                    setActiveModelMode('ML_RANDOM_FOREST');
                    setShowModelDropdown(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between ${
                    activeModelMode === 'ML_RANDOM_FOREST'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div>Random Forest (Ensemble)</div>
                    <div className="text-[10px] text-slate-400 font-mono">98.4% ROC-AUC • Production</div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <button
                  onClick={() => {
                    setActiveModelMode('ML_LOGISTIC_REGRESSION');
                    setShowModelDropdown(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between mt-1 ${
                    activeModelMode === 'ML_LOGISTIC_REGRESSION'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div>Logistic Regression</div>
                    <div className="text-[10px] text-slate-400 font-mono">93.2% Precision • Baseline</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveModelMode('DEMO_MODE');
                    setShowModelDropdown(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between mt-1 ${
                    activeModelMode === 'DEMO_MODE'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div>Demo Rule-Based Mode</div>
                    <div className="text-[10px] text-slate-400 font-mono">Heuristic Fallback Engine</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* AI Copilot Quick Launch */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950 transition-all hover:scale-105"
              title="Open Sentinel AI Copilot & Voice Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">AI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          {/* Sound FX toggle */}
          <button
            onClick={handleSoundToggle}
            className={`p-2 rounded-lg border transition-colors ${
              soundOn
                ? 'bg-slate-900 border-slate-800 text-cyan-400 hover:border-cyan-500/40'
                : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundOn ? 'Sound Alerts: Enabled' : 'Sound Alerts: Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Real-time Alert Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAlertDropdown(!showAlertDropdown);
                markAlertsAsRead();
              }}
              className={`p-2 rounded-lg border transition-colors relative ${
                unreadAlertCount > 0
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Real-Time Fraud Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </span>
              )}
            </button>

            {showAlertDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold text-slate-200 font-mono">
                      REAL-TIME FRAUD ALERTS ({alerts.length})
                    </span>
                  </div>
                  {alerts.length > 0 && (
                    <button
                      onClick={clearAlerts}
                      className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {alerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No high-risk fraud alerts active.
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-rose-400">
                            {alert.transactionId}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ₹{alert.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                          {alert.reason}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                          <span>Score: {alert.riskScore}/100</span>
                          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Code / Python Flask & Model package */}
          <button
            onClick={onOpenExportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Inspect & Export Complete Python/Flask + ML Backend Package"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Backend Code</span>
          </button>

          {/* User Profile / Auth Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowUserDropdown(!showUserDropdown);
                } else {
                  onOpenAuth();
                }
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all font-medium"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-semibold">
                {isAuthenticated && user ? user.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {showUserDropdown && isAuthenticated && user && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="pb-2 border-b border-slate-800 mb-2">
                  <div className="font-semibold text-xs text-slate-200">{user.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                  <div className="mt-1 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {user.role}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mb-2 font-mono">
                  Org: <span className="text-slate-300">{user.organization}</span>
                </div>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left p-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Switch User / Role
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left p-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
          >
            <span className="sr-only">Open menu</span>
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-slate-300 rounded" />
              <span className="w-full h-0.5 bg-slate-300 rounded" />
              <span className="w-full h-0.5 bg-slate-300 rounded" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden glass-panel border-b border-slate-800 p-4 animate-in fade-in slide-in-from-top-4 mt-2">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenExportModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-cyan-400 font-mono flex items-center gap-1"
            >
              <Code2 className="w-4 h-4" /> Export Python/Flask Package
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
