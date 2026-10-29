import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Shield, User, Lock, Mail, Building, Check, Sparkles, X, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickDemoLogin, user } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Fraud Investigator');
  const [organization, setOrganization] = useState('FinTech Security Lab');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isRegisterMode) {
      const res = await register(name, email, password, role, organization);
      if (!res.success) {
        setError(res.error || 'Failed to register account');
      } else {
        setSuccessMsg('Account provisioned successfully. Isolated workspace activated.');
        setTimeout(() => onClose(), 1200);
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      } else {
        setSuccessMsg('Authenticated successfully. Loading risk portfolio...');
        setTimeout(() => onClose(), 1000);
      }
    }
  };

  const handleQuickDemo = (demoType: 'investigator' | 'analyst') => {
    quickDemoLogin(demoType);
    setSuccessMsg(`Switched to demo workspace: ${demoType === 'investigator' ? 'Sarah Chen (Investigator)' : 'Alex Kumar (Analyst)'}`);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel border border-slate-700 bg-[#0d1527] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/20 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                {isRegisterMode ? 'Provision Security Analyst Seat' : 'FinTech Operator Authentication'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Isolated database & risk ledger per user
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Workspace Switcher */}
        <div className="my-5 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              1-CLICK DEMO ACCOUNTS (INSTANT ACCESS)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('investigator')}
              className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                user?.name.includes('Sarah')
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                Sarah Chen {user?.name.includes('Sarah') && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Fraud Investigator</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('analyst')}
              className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                user?.name.includes('Alex')
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                Alex Kumar {user?.name.includes('Alex') && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Risk Analyst</div>
            </button>
          </div>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="px-3 text-[11px] font-mono text-slate-500 uppercase">
            Or {isRegisterMode ? 'Register New' : 'Sign in with Email'}
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Corporate / University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@fintech.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Access Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Risk Analyst">Risk Analyst</option>
                  <option value="Fraud Investigator">Fraud Investigator</option>
                  <option value="Compliance Officer">Compliance Officer</option>
                  <option value="FinTech Engineer">FinTech Engineer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Institution
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Cyber Lab"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{isRegisterMode ? 'Initialize Account' : 'Authenticate Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {isRegisterMode
              ? 'Already have an analyst profile? Sign in'
              : "Need a new isolated account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
