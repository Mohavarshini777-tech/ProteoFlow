import React, { useState } from 'react';
import {
  Dna,
  Sparkles,
  Download,
  Home as HomeIcon,
  Database,
  Atom,
  Activity,
  BookOpen,
  FileText,
  Menu,
  X,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { ProteinData } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentProtein: ProteinData;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAiModal?: () => void;
  onOpenExportModal?: () => void;
  onGenerateReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProtein,
  activeSection,
  onNavigate,
  onOpenAiModal,
  onOpenExportModal,
  onGenerateReport,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Exact requested 7 navigation items:
  // Home, 1. Input, 2. Dashboard, 3. Advanced, 4. Research Copilot, 5. Report, 6. User Guide
  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'input', label: '1. Input', icon: Database },
    { id: 'dashboard', label: '2. Dashboard', icon: Atom },
    { id: 'advanced', label: '3. Advanced', icon: Activity, aliases: ['variants', 'aiml', 'mechanism', 'advanced'] },
    { id: 'copilot', label: '4. Research Copilot', icon: Sparkles },
    { id: 'report', label: '5. Report', icon: FileText },
    { id: 'about', label: '6. User Guide', icon: BookOpen },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5">
        {/* Brand - Clickable to Home */}
        <button
          id="nav-brand-home-btn"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden group cursor-pointer"
          title="Return to ProteoFlow Homepage"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 shadow-inner group-hover:border-cyan-400 transition-colors">
            <Dna className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Proteo<span className="text-cyan-400">Flow</span>
              </span>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.2 text-[10px] font-mono font-medium tracking-wide text-cyan-300">
                v3.0 Phase 4
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              Evidence-Grounded Protein Intelligence
            </p>
          </div>
        </button>

        {/* Desktop Pipeline Stepper Navigation */}
        <nav className="hidden xl:flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 text-xs">
          {navItems.map((item) => {
            const isActive =
              activeSection === item.id || (item.aliases && item.aliases.includes(activeSection));
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Compact Navigation for Medium Screens (LG/MD) */}
        <nav className="hidden md:flex xl:hidden items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 text-[11px]">
          {navItems.map((item) => {
            const isActive =
              activeSection === item.id || (item.aliases && item.aliases.includes(activeSection));
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Active Protein Indicator */}
        <div className="flex items-center gap-2">
          {/* Active Protein Badge */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 transition-colors text-left cursor-pointer"
            title="Active macromolecule in memory"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200 truncate max-w-[110px]">
              {currentProtein.gene || currentProtein.name}
            </span>
            <span className="text-cyan-400 font-mono text-[10px]">
              {currentProtein.uniprotId || currentProtein.id}
            </span>
          </button>

          {/* Prominent Generate Research Report Button */}
          <button
            id="nav-generate-report-btn"
            onClick={() => handleNavClick('report')}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-600 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-cyan-500 hover:to-emerald-500 transition-all cursor-pointer"
            title="Generate Complete Research Report"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Generate Report</span>
          </button>

          {/* Professional Dual Theme Toggle */}
          <button
            id="nav-theme-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-medium text-slate-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-cyan-600" />
                <span className="hidden sm:inline text-[11px] font-medium text-slate-700">Dark</span>
              </>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-1.5 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1.5 shadow-2xl">
          {navItems.map((item) => {
            const isActive =
              activeSection === item.id || (item.aliases && item.aliases.includes(activeSection));
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-cyan-600" />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-cyan-600 font-mono font-medium px-2">
              By Mohavarshini G
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
