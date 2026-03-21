import { X } from "lucide-react";
import { Device } from "../data/devices";

interface DeviceSelectModalProps {
  isOpen: boolean;
  devices: Device[];
  onSelect: (device: Device) => void;
  onClose: () => void;
}

export function DeviceSelectModal({
  isOpen,
  devices,
  onSelect,
  onClose,
}: DeviceSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-h-96 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="font-semibold text-gray-900">Select Device for SSH</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Device List */}
        <div className="flex-1 overflow-y-auto">
          {devices.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No devices available</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => {
                    onSelect(device);
                    onClose();
                  }}
                  className="w-full text-left p-4 hover:bg-blue-50 transition-colors group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">
                    {device.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {device.hostname} ({device.ip})
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{device.type}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 font-medium rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
