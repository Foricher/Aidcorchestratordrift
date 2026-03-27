import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Database, X, Check, ChevronsUpDown } from "lucide-react";
import { mockRules } from "../../data/complianceRules";
import { Badge } from "../../components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "../../components/ui/command";
import { useDevices, type Device } from "../../context/DeviceContext";

export function DeviceEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id !== undefined && id !== "new";

  const {
    devices,
    intentTemplates,
    addDevice,
    updateDevice,
  } = useDevices();

  const existingDevice = isEditing ? devices.find((d) => d.id === Number(id)) : undefined;

  const getAvailableComplianceRules = (platform: Device["platform"]): string[] =>
    Array.from(
      new Set<string>(
        mockRules
          .filter((rule) => rule.platform === platform)
          .map((rule) => rule.name),
      ),
    ).sort((a, b) => a.localeCompare(b));

  const getDefaultIntentTemplateName = (): string => intentTemplates[0]?.name ?? "";

  const getInitialIntentTemplateName = (): string => {
    if (!existingDevice) {
      return "";
    }

    const fallbackTemplateName = getDefaultIntentTemplateName();

    return existingDevice.intentTemplateName === "" ||
      intentTemplates.some((template) => template.name === existingDevice.intentTemplateName)
      ? existingDevice.intentTemplateName
      : fallbackTemplateName;
  };

  const initialIntentTemplateName = getInitialIntentTemplateName();
  const initialComplianceRules = existingDevice
    ? existingDevice.complianceRules.filter((rule) =>
        getAvailableComplianceRules(existingDevice.platform).includes(rule),
      )
    : [];

  const [complianceRulesPopoverOpen, setComplianceRulesPopoverOpen] = useState(false);
  const templateUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedTemplateFileName, setUploadedTemplateFileName] = useState<string>("");
  const [isGrabConfigModalOpen, setIsGrabConfigModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: existingDevice?.name ?? "",
    ipAddress: existingDevice?.ipAddress ?? "",
    type: existingDevice?.type ?? "",
    platform: existingDevice?.platform ?? ("AOSX" as Device["platform"]),
    site: existingDevice?.site ?? "",
    status: existingDevice?.status ?? ("active" as Device["status"]),
    complianceRules: initialComplianceRules,
    intentTemplateName: initialIntentTemplateName,
  });
  const [savedAidcIntentTemplateContent, setSavedAidcIntentTemplateContent] = useState(
    existingDevice?.intentTemplateContent ?? "",
  );

  const initialTemplate = intentTemplates.find((template) => template.name === initialIntentTemplateName);
  const [intentTemplateDraft, setIntentTemplateDraft] = useState(
    initialIntentTemplateName === ""
      ? existingDevice?.intentTemplateContent ?? ""
      : initialTemplate?.content ?? "",
  );

  const availableComplianceRules = getAvailableComplianceRules(formData.platform);

  const handleIntentTemplateChange = (templateName: string) => {
    if (formData.intentTemplateName === "") {
      setSavedAidcIntentTemplateContent(intentTemplateDraft);
    }

    const selectedTemplate = intentTemplates.find((template) => template.name === templateName);

    setFormData((currentForm) => ({
      ...currentForm,
      intentTemplateName: templateName,
    }));
    setIntentTemplateDraft(templateName === "" ? savedAidcIntentTemplateContent : selectedTemplate?.content ?? "");
  };

  const handleCancelIntentTemplateChanges = () => {
    if (formData.intentTemplateName === "") {
      setIntentTemplateDraft(savedAidcIntentTemplateContent);
      return;
    }

    const selectedTemplate = intentTemplates.find(
      (template) => template.name === formData.intentTemplateName,
    );
    setIntentTemplateDraft(selectedTemplate?.content ?? "");
  };

  const handleUploadTemplateContent = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const fileContent = await selectedFile.text();
      setIntentTemplateDraft(fileContent.replace(/\r\n/g, "\n"));
      setUploadedTemplateFileName(selectedFile.name);
    } catch {
      alert("Unable to read the selected file. Please try another file.");
    } finally {
      event.target.value = "";
    }
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

  const handleSaveDevice = () => {
    if (!formData.name.trim() || !formData.ipAddress.trim() || !formData.type.trim() || !formData.site.trim()) {
      alert("Name, IP Address, Type, and Site are mandatory fields");
      return;
    }

    if (isEditing) {
      if (!existingDevice) {
        alert("Device not found");
        navigate("/setup/device");
        return;
      }

      updateDevice({
        ...existingDevice,
        name: formData.name.trim(),
        ipAddress: formData.ipAddress.trim(),
        type: formData.type.trim(),
        platform: formData.platform,
        site: formData.site.trim(),
        status: formData.status,
        complianceRules: formData.complianceRules,
        intentTemplateName: formData.intentTemplateName,
        intentTemplateContent:
          formData.intentTemplateName === "" ? intentTemplateDraft : savedAidcIntentTemplateContent,
        lastCheck: "just now",
      });
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
        intentTemplateName: formData.intentTemplateName,
        intentTemplateContent:
          formData.intentTemplateName === "" ? intentTemplateDraft : savedAidcIntentTemplateContent,
      };
      addDevice(newDevice);
    }

    navigate("/setup/device");
  };

  const selectedIntentTemplate = intentTemplates.find(
    (template) => template.name === formData.intentTemplateName,
  );

  const aidcDefaultEntryLabel = `aidc ${formData.name.trim() || "<name of device>"}`;
  const isAidcIntentSelected = formData.intentTemplateName === "";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/setup/device")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <Database size={28} className="text-blue-600" />
          <h1 className="text-3xl font-semibold text-gray-900">
            {isEditing ? "Edit Device" : "Add Device"}
          </h1>
        </div>
        <button
          onClick={handleSaveDevice}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Save Device
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Intent Configuration</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Intent Configuration</label>
            <select
              value={formData.intentTemplateName}
              onChange={(e) => handleIntentTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{aidcDefaultEntryLabel}</option>
              <option value="__separator__" disabled>
                ------------------------------
              </option>
              {intentTemplates.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name} - updated at {template.updatedAt}
                </option>
              ))}
            </select>
            {selectedIntentTemplate && (
              <p className="text-xs text-gray-500 mt-1">
                Selected template updated at {selectedIntentTemplate.updatedAt}
              </p>
            )}
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-gray-700">Template content</label>
              <input
                ref={templateUploadInputRef}
                type="file"
                accept=".txt,.j2,.jinja,.cfg,.conf,.yaml,.yml,.json"
                onChange={handleUploadTemplateContent}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => templateUploadInputRef.current?.click()}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setIsGrabConfigModalOpen(true)}
                disabled={formData.intentTemplateName !== ""}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retrieve running configuration
              </button>
            </div>
            {uploadedTemplateFileName && (
              <p className="text-xs text-gray-500 mb-2">Loaded file: {uploadedTemplateFileName}</p>
            )}
            <textarea
              value={intentTemplateDraft}
              onChange={(e) => setIntentTemplateDraft(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Template content..."
            />
          </div>

          <div className="flex items-center justify-start gap-2">
            <button
              type="button"
              onClick={handleCancelIntentTemplateChanges}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </div>

      {isGrabConfigModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Running Configuration</h2>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Retrieve the running device configuration via SSH connection or Ansible script
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGrabConfigModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
