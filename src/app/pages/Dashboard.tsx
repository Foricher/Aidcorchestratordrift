import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        Orchestrator Drift Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Devices</span>
            <Activity className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">24</p>
          <p className="text-xs text-gray-500 mt-1">Monitored devices</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Compliant</span>
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-semibold text-green-600">18</p>
          <p className="text-xs text-gray-500 mt-1">75% compliance rate</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Drift Detected</span>
            <AlertTriangle className="text-orange-600" size={20} />
          </div>
          <p className="text-3xl font-semibold text-orange-600">6</p>
          <p className="text-xs text-gray-500 mt-1">Requires attention</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Last Check</span>
            <Clock className="text-gray-600" size={20} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">5m</p>
          <p className="text-xs text-gray-500 mt-1">ago</p>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome to Orchestrator Drift
        </h2>
        <p className="text-gray-600 mb-4">
          This module helps you monitor and manage configuration drift across your network devices.
          Use the menu to navigate between different sections:
        </p>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
            <span><strong>Setup:</strong> Configure devices and define compliance rules</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
            <span><strong>Compliance Status:</strong> View current compliance state of all devices</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
            <span><strong>History:</strong> Review historical drift events and changes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}