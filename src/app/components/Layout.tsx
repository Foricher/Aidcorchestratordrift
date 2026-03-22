import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ChevronDown, ChevronRight, Menu, X, Terminal as TerminalIcon, Settings, CheckCircle, History, Database, Shield, Wrench, ChevronLeft } from "lucide-react";
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="p-1 hover:bg-blue-700 rounded transition-colors group"
              title={rightSidebarOpen ? "Hide SSH Terminal" : "Show SSH Terminal"}
            >
              <TerminalIcon size={20} className="text-white group-hover:text-blue-100" />
            </button>
            <span className="text-sm text-blue-100">Admin</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } lg:block bg-white border-r border-gray-200 min-h-[calc(100vh-60px)] shadow-sm transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Sidebar Toggle Button - positioned at top of sidebar */}
          {/* Sidebar Toggle Button - Enhanced Design */}
          <div className="relative flex justify-center p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="group relative flex items-center justify-center w-10 h-10 bg-white hover:bg-blue-50 border border-gray-300 hover:border-blue-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {/* Background glow effect on hover */}
              <div className="absolute inset-0 bg-blue-400 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>

              {/* Icon */}
              <div className="relative z-10">
                {sidebarCollapsed ? (
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                ) : (
                  <ChevronLeft size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                )}
              </div>

              {/* Tooltip-like indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </div>

          <nav className={`p-4 ${sidebarCollapsed ? "p-2" : "p-4"} transition-all duration-300`}>
            {/* Orchestrator Drift Menu - Static Header */}
            <div className="mb-6">
              <div
                className={`flex items-center px-2 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 ${
                  sidebarCollapsed ? "justify-center" : "gap-2"
                }`}
              >
                {sidebarCollapsed ? (
                  <Shield size={20} className="text-blue-600" />
                ) : (
                  <>
                    <Shield size={16} className="text-blue-600" />
                    <span>Orchestrator Drift</span>
                  </>
                )}
              </div>
              
              {/* Orchestrator Drift Submenu - Always Visible */}
              <div className={`mt-2 transition-all duration-300 ${sidebarCollapsed ? "" : "border-l-2 border-gray-200 pl-4"}`}>
                  {/* Setup Menu with Submenu */}
                  <div>
                    <button
                      onClick={() => setSetupOpen(!setupOpen)}
                      className={`w-full flex items-center px-2 py-2 text-sm rounded transition-colors ${
                        isSetupActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      } transition-all duration-300 ${sidebarCollapsed ? "justify-center p-2" : ""}`}
                      title={sidebarCollapsed ? "Setup" : ""}
                    >
                      <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
                        {sidebarCollapsed ? (
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
                          } transition-all duration-300 ${sidebarCollapsed ? "justify-center p-1.5" : ""}`}
                          title={sidebarCollapsed ? "Device" : ""}
                        >
                          <Database size={sidebarCollapsed ? 16 : 12} />
                          {!sidebarCollapsed && <span>Device</span>}
                        </Link>
                        <Link
                          to="/setup/compliance-rules"
                          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
                            isActive("/setup/compliance-rules")
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } transition-all duration-300 ${sidebarCollapsed ? "justify-center p-1.5" : ""}`}
                          title={sidebarCollapsed ? "Compliance Rules" : ""}
                        >
                          <Shield size={sidebarCollapsed ? 16 : 12} />
                          {!sidebarCollapsed && <span>Compliance Rules</span>}
                        </Link>
                        <Link
                          to="/setup/drift-remediation"
                          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
                            isActive("/setup/drift-remediation")
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } transition-all duration-300 ${sidebarCollapsed ? "justify-center p-1.5" : ""}`}
                          title={sidebarCollapsed ? "Remediation" : ""}
                        >
                          <Wrench size={sidebarCollapsed ? 16 : 12} />
                          {!sidebarCollapsed && <span>Remediation</span>}
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
                  } transition-all duration-300 ${sidebarCollapsed ? "justify-center p-2" : ""}`}
                  title={sidebarCollapsed ? "Compliance Status" : ""}
                >
                  <CheckCircle size={sidebarCollapsed ? 18 : 14} />
                  {!sidebarCollapsed && <span>Compliance Status</span>}
                </Link>

                {/* History */}
                <Link
                  to="/history"
                  className={`flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors ${
                    isActive("/history")
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  } transition-all duration-300 ${sidebarCollapsed ? "justify-center p-2" : ""}`}
                  title={sidebarCollapsed ? "History" : ""}
                >
                  <History size={sidebarCollapsed ? 18 : 14} />
                  {!sidebarCollapsed && <span>History</span>}
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content Container with Resizable Panels */}
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={65} minSize={30} className="flex">
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
              <Outlet />
            </main>
          </Panel>

          {/* Resize Handle - only show when right sidebar is open */}
          {rightSidebarOpen && (
            <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-blue-400 transition-colors cursor-col-resize" />
          )}

          {/* Right Sidebar with SSH Terminal - Always mounted to preserve xterm state */}
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
        </PanelGroup>
      </div>
    </div>
    </SSHTerminalContext.Provider>
  );
}