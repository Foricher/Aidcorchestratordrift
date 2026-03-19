import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const [setupOpen, setSetupOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isSetupActive = location.pathname.startsWith("/setup");

  return (
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-100">Admin</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-60px)] shadow-sm`}
        >
          <nav className="p-4">
            {/* Orchestrator Drift Menu */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Orchestrator Drift
              </h2>
              
              <div className="space-y-1">
                {/* Setup Menu with Submenu */}
                <div>
                  <button
                    onClick={() => setSetupOpen(!setupOpen)}
                    className={`w-full flex items-center justify-between px-2 py-2 text-sm rounded transition-colors ${
                      isSetupActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>Setup</span>
                    {setupOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  
                  {/* Setup Submenu */}
                  {setupOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                      <Link
                        to="/setup/device"
                        className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                          isActive("/setup/device")
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        Device
                      </Link>
                      <Link
                        to="/setup/compliance-rules"
                        className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                          isActive("/setup/compliance-rules")
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        Compliance Rules
                      </Link>
                      <Link
                        to="/setup/drift-remediation"
                        className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                          isActive("/setup/drift-remediation")
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        Remediation
                      </Link>
                    </div>
                  )}
                </div>

                {/* Compliance Status */}
                <Link
                  to="/compliance-status"
                  className={`block px-2 py-2 text-sm rounded transition-colors ${
                    isActive("/compliance-status")
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Compliance Status
                </Link>

                {/* History */}
                <Link
                  to="/history"
                  className={`block px-2 py-2 text-sm rounded transition-colors ${
                    isActive("/history")
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  History
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}