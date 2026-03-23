import { useState } from "react";
import { Plus, Search, Edit, Trash2, Server, Database, X, Check, ChevronsUpDown } from "lucide-react";
import { mockRules } from "../../data/complianceRules";
import { Badge } from "../../components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "../../components/ui/command";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { useDevices, type Device } from "../../context/DeviceContext";

export function Device() {
  const { devices, addDevice, updateDevice, deleteDevice } = useDevices();
  const getAvailableComplianceRules = (platform: Device["platform"]): string[] =>
    Array.from(
      new Set<string>(
        mockRules
          .filter((rule) => rule.platform === platform)
          .map((rule) => rule.name),
      ),
    ).sort((a, b) => a.localeCompare(b));

  const [searchTerm, setSearchTerm] = useState("");
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [complianceRulesPopoverOpen, setComplianceRulesPopoverOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    ipAddress: "",
    type: "",
    platform: "AOSX" as Device["platform"],
    site: "",
    status: "active" as Device["status"],
    complianceRules: [] as string[],
  });

  const availableComplianceRules = getAvailableComplianceRules(formData.platform);

  const resetForm = () => {
    setFormData({
      name: "",
      ipAddress: "",
      type: "",
      platform: "AOSX",
      site: "",
      status: "active",
      complianceRules: [],
    });
  };

  const handleOpenAddModal = () => {
    setEditingDeviceId(null);
    setComplianceRulesPopoverOpen(false);
    resetForm();
    setIsDeviceModalOpen(true);
  };

  const handleOpenEditModal = (device: Device) => {
    const platformComplianceRules = getAvailableComplianceRules(device.platform);

    setEditingDeviceId(device.id);
    setComplianceRulesPopoverOpen(false);
    setFormData({
      name: device.name,
      ipAddress: device.ipAddress,
      type: device.type,
      platform: device.platform,
      site: device.site,
      status: device.status,
      complianceRules: device.complianceRules.filter((rule) =>
        platformComplianceRules.includes(rule),
      ),
    });
    setIsDeviceModalOpen(true);
  };

  const toggleComplianceRule = (ruleName: string) => {
    setFormData((currentForm) => {
      const isSelected = currentForm.complianceRules.includes(ruleName);
      return {
        ...currentForm,
        complianceRules: isSelected
          ? currentForm.complianceRules.filter((rule) => rule !== ruleName)
          : [...currentForm.complianceRules, ruleName],
      };
    });
  };

  const handleCloseModal = () => {
    setIsDeviceModalOpen(false);
    setComplianceRulesPopoverOpen(false);
    setEditingDeviceId(null);
    resetForm();
  };

  const handleDeleteDevice = (deviceId: number) => {
    deleteDevice(deviceId);
    setDeleteConfirmId(null);
  };

  const handleSaveDevice = () => {
    if (!formData.name.trim() || !formData.ipAddress.trim() || !formData.type.trim() || !formData.site.trim()) {
      alert("Name, IP Address, Type, and Site are mandatory fields");
      return;
    }

    if (editingDeviceId) {
      const existingDevice = devices.find((d) => d.id === editingDeviceId);
      if (existingDevice) {
        updateDevice({
          ...existingDevice,
          name: formData.name.trim(),
          ipAddress: formData.ipAddress.trim(),
          type: formData.type.trim(),
          platform: formData.platform,
          site: formData.site.trim(),
          status: formData.status,
          complianceRules: formData.complianceRules,
          lastCheck: "just now",
        });
      }
    } else {
      const nextId = Math.max(...devices.map((device) => device.id), 0) + 1;
      const newDevice: Device = {
        id: nextId,
        name: formData.name.trim(),
        ipAddress: formData.ipAddress.trim(),
        type: formData.type.trim(),
        platform: formData.platform,
        site: formData.site.trim(),
        status: formData.status,
        lastCheck: "just now",
        complianceRules: formData.complianceRules,
      };
      addDevice(newDevice);
    }

    handleCloseModal();
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.ipAddress.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database size={28} className="text-blue-600" />
          <h1 className="text-3xl font-semibold text-gray-900">Devices</h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Device
        </button>
      </div>

      {isDeviceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDeviceId ? "Edit Device" : "Add Device"}
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., switch-access-03"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address *</label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10.0.2.3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Switch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => {
                    const nextPlatform = e.target.value as Device["platform"];
                    const nextAvailableRules = getAvailableComplianceRules(nextPlatform);

                    setFormData((currentForm) => ({
                      ...currentForm,
                      platform: nextPlatform,
                      complianceRules: currentForm.complianceRules.filter((rule) =>
                        nextAvailableRules.includes(rule),
                      ),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AOSX">AOSX</option>
                  <option value="AOS8">AOS8</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Brest Lab"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Device["status"] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Rules</label>
                <Popover open={complianceRulesPopoverOpen} onOpenChange={setComplianceRulesPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div
                      role="combobox"
                      aria-expanded={complianceRulesPopoverOpen}
                      tabIndex={0}
                      className="min-h-10 w-full flex flex-wrap items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      onClick={() => setComplianceRulesPopoverOpen(true)}
                      onKeyDown={(e) => e.key === "Enter" && setComplianceRulesPopoverOpen(true)}
                    >
                      {formData.complianceRules.length === 0 && (
                        <span className="text-sm text-gray-400">Select one or more compliance rules</span>
                      )}
                      {formData.complianceRules.map((rule) => (
                        <Badge
                          key={rule}
                          variant="secondary"
                          className="font-mono text-xs flex items-center gap-1 pr-1"
                        >
                          {rule}
                          <button
                            type="button"
                            className="rounded-full hover:bg-gray-300 p-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplianceRule(rule);
                            }}
                            aria-label={`Remove ${rule}`}
                          >
                            <X size={11} />
                          </button>
                        </Badge>
                      ))}
                      <ChevronsUpDown size={16} className="ml-auto text-gray-400 shrink-0" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
                    <Command>
                      <CommandInput placeholder="Search compliance rules..." />
                      <CommandList>
                        <CommandEmpty>
                          {availableComplianceRules.length === 0
                            ? "No compliance rules available for this platform."
                            : "No compliance rules found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableComplianceRules.map((rule) => (
                            <CommandItem
                              key={rule}
                              value={rule}
                              onSelect={() => toggleComplianceRule(rule)}
                              className="cursor-pointer"
                            >
                              <Check
                                size={16}
                                className={formData.complianceRules.includes(rule) ? "opacity-100" : "opacity-0"}
                              />
                              <span className="font-mono">{rule}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDevice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingDeviceId ? "Save Changes" : "Add Device"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search devices by name or IP address..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance Rules
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Check
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDevices.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Server className="text-gray-400" size={20} />
                    <span className="text-sm font-medium text-gray-900">{device.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.ipAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.platform}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.site}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      device.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {device.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {device.complianceRules.map((rule, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.lastCheck}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleOpenEditModal(device)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Device</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setDeleteConfirmId(device.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Device</TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Delete Device</h2>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this device? This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDevice(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredDevices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No devices found matching your search.</p>
        </div>
      )}
    </div>
  );
}