import React, { useState, useEffect } from 'react';
import { Activity, Radio, Cpu, Menu, X, ArrowRight } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar({ activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    checked: false,
    online: false,
    modelLoaded: false,
    device: 'cpu',
  });

  const verifyBackend = async () => {
    try {
      const data = await checkHealth();
      setServerStatus({
        checked: true,
        online: true,
        modelLoaded: Boolean(data.model_loaded),
        device: data.device || 'cpu',
      });
    } catch {
      setServerStatus({
        checked: true,
        online: false,
        modelLoaded: false,
        device: 'offline',
      });
    }
  };

  useEffect(() => {
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'analyze', label: 'Analisis Suara' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand */}
          <div 
            onClick={() => { setActivePage('analyze'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-sky-900 to-teal-600 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  TestYour<span className="text-teal-600">Breath</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  AST v6
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                Respiratory Sound Screening Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header: Server Status Badge & CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Live Model Status Badge */}
            <div 
              title={serverStatus.online ? `Backend aktif (${serverStatus.device.toUpperCase()})` : 'Backend offline'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                serverStatus.online && serverStatus.modelLoaded
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : serverStatus.online
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                serverStatus.online && serverStatus.modelLoaded
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-rose-500'
              }`} />
              <span>
                {serverStatus.online && serverStatus.modelLoaded
                  ? `AST Aktif (${serverStatus.device.toUpperCase()})`
                  : serverStatus.online
                  ? 'Model Loading'
                  : 'Backend Offline'}
              </span>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => setActivePage('analyze')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <span>Mulai Skrining</span>
              <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${
                activePage === item.id
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setActivePage('analyze');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm"
            >
              <span>Mulai Skrining Audio</span>
              <ArrowRight className="w-4 h-4 text-teal-400" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
