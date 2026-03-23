import { useState } from "react";
import { Plus, Search, Edit, Trash2, Save, X, Wrench } from "lucide-react";
import { mockPlaybooks, type Playbook } from "@/app/data/playbooks";

export function DriftRemediation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [playbooks, setPlaybooks] = useState<Playbook[]>(mockPlaybooks);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Playbook>>({});
  const [isAdding, setIsAdding] = useState(false);

  const filteredPlaybooks = playbooks.filter(playbook =>
    playbook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    playbook.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (playbook: Playbook) => {
    setEditingId(playbook.id);
    setEditForm(playbook);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (isAdding) {
      // Validation pour l'ajout
      if (!editForm.name?.trim() || !editForm.script?.trim()) {
        alert("Name and Script are mandatory fields");
        return;
      }
      
      const newPlaybook: Playbook = {
        id: Math.max(...playbooks.map(p => p.id), 0) + 1,
        name: editForm.name.trim(),
        description: editForm.description || "",
        script: editForm.script.trim(),
        order: editForm.order ?? 10
      };
      setPlaybooks([...playbooks, newPlaybook]);
      setIsAdding(false);
      setEditForm({});
    } else if (editingId) {
      // Validation pour l'édition
      if (!editForm.name?.trim() || !editForm.script?.trim()) {
        alert("Name and Script are mandatory fields");
        return;
      }

      setPlaybooks(playbooks.map(p => 
        p.id === editingId 
          ? { ...p, ...editForm, name: editForm.name!.trim(), script: editForm.script!.trim() } 
          : p
      ));
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this playbook?")) {
      setPlaybooks(playbooks.filter(p => p.id !== id));
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      name: "",
      description: "",
      script: "",
      order: 10
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wrench size={28} className="text-blue-600" />
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Drift Remediation</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage Ansible playbooks scripts for drift remediation
            </p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Script
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search playbooks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Playbook</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., fix-password-complexity"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description of playbook script"
                value={editForm.description || ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Script <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., fix_password_complexity.yml"
                value={editForm.script || ""}
                onChange={(e) => setEditForm({ ...editForm, script: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order (0-100, default: 10)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.order ?? 10}
                onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 10 })}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                Save Playbook
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playbooks Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ansible Script
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPlaybooks.map((playbook) => (
              <tr key={playbook.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  {editingId === playbook.id ? (
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 font-mono">
                      {playbook.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === playbook.id ? (
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  ) : (
                    <div className="text-sm text-gray-600 max-w-md">
                      {playbook.description || <span className="italic text-gray-400">No description</span>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === playbook.id ? (
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      value={editForm.script || ""}
                      onChange={(e) => setEditForm({ ...editForm, script: e.target.value })}
                    />
                  ) : (
                    <div className="text-sm text-gray-900 font-mono">
                      {playbook.script}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === playbook.id ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.order ?? 10}
                      onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 10 })}
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{playbook.order}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {editingId === playbook.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleSave}
                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                        title="Save"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(playbook)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(playbook.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPlaybooks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No playbooks found matching your search.</p>
        </div>
      )}
    </div>
  );
}