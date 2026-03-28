import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ChevronDown, ChevronRight, Menu, X, Terminal as TerminalIcon, Settings, CheckCircle, History, Database, Shield, Wrench, ChevronLeft, CalendarClock } from "lucide-react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { RightSidebar } from "./RightSidebar";
import { SSHTerminalContext } from "../context/SSHTerminalContext";

interface TerminalTab {
  id: string;
  name: string;
}

export function Layout() {
  const location = useLocation();
  const [setupOpen, setSetupOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load from localStorage, default to false (expanded)
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Terminal state - persists when sidebar is toggled
  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string>("");
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Keep layout behavior in sync with desktop/mobile breakpoint.
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile navigation on route change to maximize content space.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Allow closing mobile drawers with Escape for keyboard accessibility.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isDesktop) return;

      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      if (rightSidebarOpen) {
        setRightSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDesktop, mobileMenuOpen, rightSidebarOpen]);

  // Function to open SSH terminal for a specific device
  const openSSHTerminal = (deviceName: string) => {
    const newId = `terminal-${Date.now()}`;
    setTerminalTabs([...terminalTabs, { id: newId, name: deviceName }]);
    setActiveTerminalId(newId);
    // Ensure sidebar is visible
    setRightSidebarOpen(true);
  };

  const isActive = (path: string) => location.pathname === path;
  const isSetupActive = location.pathname.startsWith("/setup");
  const effectiveSidebarCollapsed = isDesktop ? sidebarCollapsed : false;

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const next = !prev;
      if (next && !isDesktop) {
        setRightSidebarOpen(false);
      }
      return next;
    });
  };

  const handleToggleTerminalSidebar = () => {
    setRightSidebarOpen((prev) => {
      const next = !prev;
      if (next && !isDesktop) {
        setMobileMenuOpen(false);
      }
      return next;
    });
  };

  return (
    <SSHTerminalContext.Provider
      value={{
        tabs: terminalTabs,
        activeTabId: activeTerminalId,
        setTabs: setTerminalTabs,
        setActiveTabId: setActiveTerminalId,
        openSSHTerminal,
        setShowDeviceModal,
      }}
    >
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMobileMenu}
              className="lg:hidden p-1 hover:bg-blue-700 rounded"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="text-xl font-semibold">
              AI/DC Orchestrator
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleTerminalSidebar}
              className="p-1 hover:bg-blue-700 rounded transition-colors group"
              title={rightSidebarOpen ? "Hide SSH Terminal" : "Show SSH Terminal"}
            >
              <TerminalIcon size={20} className="text-white group-hover:text-blue-100" />
            </button>
            <span className="text-sm text-blue-100">Admin</span>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {!isDesktop && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 ${
              mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            aria-label="Close navigation menu"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-[60px] bottom-0 left-0 z-50 bg-white border-r border-gray-200 min-h-[calc(100vh-60px)] shadow-sm transition-transform duration-300 ease-in-out w-72 max-w-[85vw] ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:top-auto lg:bottom-auto lg:left-auto lg:z-auto lg:max-w-none lg:translate-x-0 ${
            effectiveSidebarCollapsed ? "lg:w-16" : "lg:w-64"
          }`}
        >
          {/* Sidebar Toggle Button - positioned at top of sidebar */}
          {/* Sidebar Toggle Button - Enhanced Design */}
          <div className="relative hidden lg:flex justify-center p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="group relative flex items-center justify-center w-10 h-10 bg-white hover:bg-blue-50 border border-gray-300 hover:border-blue-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              title={effectiveSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {/* Background glow effect on hover */}
              <div className="absolute inset-0 bg-blue-400 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>

              {/* Icon */}
              <div className="relative z-10">
                {effectiveSidebarCollapsed ? (
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                ) : (
                  <ChevronLeft size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                )}
              </div>

              {/* Tooltip-like indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </div>

          <nav className={`p-4 ${effectiveSidebarCollapsed ? "p-2" : "p-4"} transition-all duration-300`}>
            {/* Orchestrator Drift Menu - Static Header */}
            <div className="mb-6">
              <div
                className={`flex items-center px-2 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 ${
                  effectiveSidebarCollapsed ? "justify-center" : "gap-2"
                }`}
              >
                {effectiveSidebarCollapsed ? (
                  <Shield size={20} className="text-blue-600" />
                ) : (
                  <>
                    <Shield size={16} className="text-blue-600" />
                    <span>Orchestrator Drift</span>
                  </>
                )}
              </div>
              
              {/* Orchestrator Drift Submenu - Always Visible */}
              <div className={`mt-2 transition-all duration-300 ${effectiveSidebarCollapsed ? "" : "border-l-2 border-gray-200 pl-4"}`}>
                  {/* Setup Menu with Submenu */}
                  <div>
                    <button
                      onClick={() => setSetupOpen(!setupOpen)}
                      className={`w-full flex items-center px-2 py-2 text-sm rounded transition-colors ${
                        isSetupActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      } transition-all duration-300 ${effectiveSidebarCollapsed ? "justify-center p-2" : ""}`}
                      title={effectiveSidebarCollapsed ? "Setup" : ""}
                    >
                      <div className={`flex items-center transition-all duration-300 ${effectiveSidebarCollapsed ? "justify-center" : "gap-2"}`}>
                        {effectiveSidebarCollapsed ? (
                          <Settings size={18} />
                        ) : (
                          <>
                            {setupOpen ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                            <Settings size={14} />
                            <span>Setup</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    {/* Setup Submenu */}
                    {setupOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                        <Link
                          to="/setup/device"
                          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
                            isActive("/setup/device")
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } transition-all duration-300 ${effectiveSidebarCollapsed ? "justify-center p-1.5" : ""}`}
                          title={effectiveSidebarCollapsed ? "Device" : ""}
                        >
                          <Database size={effectiveSidebarCollapsed ? 16 : 12} />
                          {!effectiveSidebarCollapsed && <span>Device</span>}
                        </Link>
                        <Link
                          to="/setup/compliance-rules"
                          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
                            isActive("/setup/compliance-rules")
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } transition-all duration-300 ${effectiveSidebarCollapsed ? "justify-center p-1.5" : ""}`}
                          title={effectiveSidebarCollapsed ? "Compliance Rules" : ""}
                        >
                          <Shield size={effectiveSidebarCollapsed ? 16 : 12} />
                          {!effectiveSidebarCollapsed && <span>Compliance Rules</span>}
                        </Link>
                        <Link
                          to="/setup/drift-remediation"
                          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
                            isActive("/setup/drift-remediation")
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } transition-all duration-300 ${effectiveSidebarCollapsed ? "justify-center p-1.5" : ""}`}
                          title={effectiveSidebarCollapsed ? "Remediation" : ""}
                        >
                          <Wrench size={effectiveSidebarCollapsed ? 16 : 12} />
                          {!effectiveSidebarCollapsed && <span>Remediation</span>}
                        </Link>
                        <Link
                          to="/setup/schedulers"
                          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
                            isActive("/setup/schedulers")
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } transition-all duration-300 ${effectiveSidebarCollapsed ? "justify-center p-1.5" : ""}`}
                          title={effectiveSidebarCollapsed ? "Schedulers" : ""}
                        >
                          <CalendarClock size={effectiveSidebarCollapsed ? 16 : 12} />
                          {!effectiveSidebarCollapsed && <span>Schedulers</span>}
                        </Link>
                      </div>
                    )}
                  </div>

                {/* Compliance Status */}
                <Link
                  to="/compliance-status"
                  className={`flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors ${
                    isActive("/compliance-status")
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  } transition-all duration-300 ${effectiveSidebarCollapsed ? "justify-center p-2" : ""}`}
                  title={effectiveSidebarCollapsed ? "Compliance Status" : ""}
                >
                  <CheckCircle size={effectiveSidebarCollapsed ? 18 : 14} />
                  {!effectiveSidebarCollapsed && <span>Compliance Status</span>}
                </Link>

                {/* History */}
                <Link
                  to="/history"
                  className={`flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors ${
                    isActive("/history")
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  } transition-all duration-300 ${effectiveSidebarCollapsed ? "justify-center p-2" : ""}`}
                  title={effectiveSidebarCollapsed ? "History" : ""}
                >
                  <History size={effectiveSidebarCollapsed ? 18 : 14} />
                  {!effectiveSidebarCollapsed && <span>History</span>}
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content Container with Resizable Panels */}
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={isDesktop && rightSidebarOpen ? 65 : 100} minSize={30} className="flex">
            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 overflow-auto">
              <Outlet />
            </main>
          </Panel>

          {/* Resize Handle - only show when right sidebar is open */}
          {isDesktop && rightSidebarOpen && (
            <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-blue-400 transition-colors cursor-col-resize" />
          )}

          {/* Right Sidebar with SSH Terminal - Always mounted to preserve xterm state */}
          {isDesktop && (
            <Panel
              defaultSize={35}
              minSize={20}
              maxSize={70}
              className={`flex flex-col ${rightSidebarOpen ? "" : "hidden"}`}
              style={{ display: rightSidebarOpen ? "flex" : "none" }}
            >
              <RightSidebar
                isOpen={rightSidebarOpen}
                tabs={terminalTabs}
                setTabs={setTerminalTabs}
                activeTabId={activeTerminalId}
                setActiveTabId={setActiveTerminalId}
                showDeviceModal={showDeviceModal}
                setShowDeviceModal={setShowDeviceModal}
              />
            </Panel>
          )}
        </PanelGroup>

        {!isDesktop && (
          <>
            <button
              onClick={() => setRightSidebarOpen(false)}
              className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 ${
                rightSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Close SSH terminal drawer"
            />
            <aside
              className={`fixed right-0 top-[60px] bottom-0 w-full sm:w-[420px] max-w-full z-50 shadow-xl transition-transform duration-300 ease-in-out ${
                rightSidebarOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
              }`}
            >
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="absolute top-2 right-2 z-10 rounded-md bg-white/90 hover:bg-white p-1 text-gray-600 hover:text-gray-900"
                aria-label="Close SSH terminal"
              >
                <X size={16} />
              </button>
              <RightSidebar
                isOpen={rightSidebarOpen}
                tabs={terminalTabs}
                setTabs={setTerminalTabs}
                activeTabId={activeTerminalId}
                setActiveTabId={setActiveTerminalId}
                showDeviceModal={showDeviceModal}
                setShowDeviceModal={setShowDeviceModal}
              />
            </aside>
          </>
        )}
      </div>
    </div>
    </SSHTerminalContext.Provider>
  );
}