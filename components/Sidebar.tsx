import React from 'react';
import { PageId, NavSection, TeamMember } from '../types'; // Added TeamMember
import { LogOut, Gift } from 'lucide-react';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  appName: string;
  appTagline: string;
  userProfile: TeamMember; // Changed from specific object type to TeamMember
  navLinks: NavSection[];
  onShowWhatsNew: () => void;
  onLogout: () => void; // Added onLogout prop
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, appName, appTagline, userProfile, navLinks, onShowWhatsNew, onLogout }) => {
  return (
    <div className="w-64 bg-sidebar-bg text-medium-text flex flex-col h-screen fixed border-r border-border-color">
      <div className="p-5 border-b border-border-color">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-text">{appName}</h1>
            <p className="text-xs text-light-text">{appTagline}</p>
          </div>
          <button 
            onClick={onShowWhatsNew} 
            title="What's New?" 
            aria-label="Show what's new in this version"
            className="relative text-primary hover:text-primary-dark transition-colors"
          >
            <Gift size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-danger ring-2 ring-sidebar-bg animate-pulse-dot"></span>
          </button>
        </div>
      </div>

      <div className="p-5 border-b border-border-color">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            {userProfile.avatarInitials || userProfile.name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-dark-text">{userProfile.name}</p>
            <p className="text-xs text-light-text">{userProfile.role}</p> {/* Changed from title to role */}
            <p className="text-xs text-light-text/50 mt-0.5">ID: {userProfile.id}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navLinks.map((section) => (
          <div key={section.title}>
            <h3 className="px-2 text-xs font-semibold text-light-text uppercase tracking-wider mb-1.5">{section.title}</h3>
            <div className="mt-1 space-y-1">
              {section.links.map((link) => (
                <button
                  key={link.name}
                  onClick={() => onNavigate(link.pageId as PageId)}
                  aria-current={currentPage === link.pageId ? "page" : undefined}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ease-in-out group relative
                    ${currentPage === link.pageId 
                      ? 'bg-primary-light text-primary font-semibold shadow-sm' 
                      : 'text-medium-text hover:bg-input-bg hover:text-dark-text'
                    }`}
                >
                  {currentPage === link.pageId && <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></span>}
                  <link.icon className={`mr-3 h-5 w-5 shrink-0 ${currentPage === link.pageId ? 'text-primary' : 'text-light-text group-hover:text-primary transition-colors duration-150'}`} aria-hidden="true" />
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border-color">
         <button
            onClick={onLogout} // Wired up logout
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-medium-text hover:bg-input-bg hover:text-dark-text transition-colors duration-150 ease-in-out group"
          >
            <LogOut className="mr-3 h-5 w-5 text-light-text group-hover:text-primary transition-colors duration-150" aria-hidden="true" />
            Logout
          </button>
      </div>
    </div>
  );
};