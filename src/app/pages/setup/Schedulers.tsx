import { useState } from "react";
import { CalendarClock, CheckCircle2, Edit, Play, Plus, Save, Trash2, X } from "lucide-react";

type FrequencyUnit = "minutes" | "hours" | "days" | "weeks";

interface DriftScheduler {
  id: number;
  name: string;
  site: string;
  startTime: string;
  frequencyValue: number;
  frequencyUnit: FrequencyUnit;
  status: "Active" | "Paused";
}

const allowedSites = ["Brest Lab", "Thousand Oaks"] as const;

const initialSchedulers: DriftScheduler[] = [
  {
    id: 1,
    name: "Core Network Drift Check",
    site: "Brest Lab",
    startTime: "2026-03-28T14:45",
    frequencyValue: 1,
    frequencyUnit: "days",
    status: "Active",
  },
  {
    id: 2,
    name: "Edge Switch Drift Check",
    site: "Thousand Oaks",
    startTime: "2026-03-28T15:00",
    frequencyValue: 1,
    frequencyUnit: "hours",
    status: "Paused",
  },
];

const frequencyUnits: FrequencyUnit[] = ["minutes", "hours", "days", "weeks"];

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFrequency(value: number, unit: FrequencyUnit) {
  if (value === 1) {
    return `Every ${unit.slice(0, -1)}`;
  }
  return `Every ${value} ${unit}`;
}

function computeNextRun(startTime: string, frequencyValue: number, frequencyUnit: FrequencyUnit) {
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) return "-";

  const next = new Date(start);
  const unitMs: Record<FrequencyUnit, number> = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };

  next.setTime(start.getTime() + frequencyValue * unitMs[frequencyUnit]);
  return formatDateTime(next.toISOString());
}

export function Schedulers() {
  const [schedulers, setSchedulers] = useState<DriftScheduler[]>(initialSchedulers);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<DriftScheduler | null>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);

  const usedSites = schedulers.map((scheduler) => scheduler.site);
  const availableSites = allowedSites.filter((site) => !usedSites.includes(site));

  const handleAdd = () => {
    if (availableSites.length === 0) {
      return;
    }

    const nextId = schedulers.length
      ? Math.max(...schedulers.map((scheduler) => scheduler.id)) + 1
      : 1;

    const newScheduler: DriftScheduler = {
      id: nextId,
      name: "",
      site: availableSites[0],
      startTime: "",
      frequencyValue: 1,
      frequencyUnit: "hours",
      status: "Active",
    };

    setSchedulers((prev) => [...prev, newScheduler]);
    setEditingId(nextId);
    setEditForm(newScheduler);
  };

  const handleEdit = (scheduler: DriftScheduler) => {
    setEditingId(scheduler.id);
    setEditForm({ ...scheduler });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = () => {
    if (!editForm) return;

    const normalized = {
      ...editForm,
      frequencyValue: Math.max(1, Number(editForm.frequencyValue) || 1),
    };

    if (!allowedSites.includes(normalized.site as (typeof allowedSites)[number])) {
      alert("Site must be Brest Lab or Thousand Oaks.");
      return;
    }

    const isDuplicateSite = schedulers.some(
      (scheduler) => scheduler.id !== normalized.id && scheduler.site === normalized.site
    );
    if (isDuplicateSite) {
      alert("Each site can only have one scheduler row.");
      return;
    }

    setSchedulers((prev) =>
      prev.map((scheduler) =>
        scheduler.id === normalized.id ? normalized : scheduler
      )
    );
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: number) => {
    setSchedulers((prev) => prev.filter((scheduler) => scheduler.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCheckNow = (id: number) => {
    setCheckingId(id);
    window.setTimeout(() => {
      setCheckingId((current) => (current === id ? null : current));
    }, 1200);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CalendarClock size={28} className="text-blue-600" />
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Schedulers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure recurring jobs for drift checks.
          </p>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Drift Check Schedulers</h2>
            <p className="text-xs text-gray-600 mt-1">
              Select schedule start time and recurrence for each drift check job.
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={availableSites.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedulers.map((scheduler) => {
                const isEditing = editingId === scheduler.id;

                return (
                  <tr key={scheduler.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                      {isEditing ? (
                        <select
                          value={editForm?.site ?? ""}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev ? { ...prev, site: e.target.value } : prev
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
                        >
                          {allowedSites
                            .filter(
                              (site) =>
                                site === scheduler.site ||
                                !schedulers.some((row) => row.id !== scheduler.id && row.site === site)
                            )
                            .map((site) => (
                              <option key={site} value={site}>
                                {site}
                              </option>
                            ))}
                        </select>
                      ) : (
                        scheduler.site
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          value={editForm?.startTime ?? ""}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev ? { ...prev, startTime: e.target.value } : prev
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        formatDateTime(scheduler.startTime)
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {isEditing ? (
                        <div className="grid grid-cols-[80px_1fr] gap-2">
                          <input
                            type="number"
                            min={1}
                            value={editForm?.frequencyValue ?? 1}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      frequencyValue: Math.max(1, Number(e.target.value) || 1),
                                    }
                                  : prev
                              )
                            }
                            className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={editForm?.frequencyUnit ?? "minutes"}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      frequencyUnit: e.target.value as FrequencyUnit,
                                    }
                                  : prev
                              )
                            }
                            className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            {frequencyUnits.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        formatFrequency(scheduler.frequencyValue, scheduler.frequencyUnit)
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {isEditing ? (
                        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5">
                          {computeNextRun(
                            editForm?.startTime ?? "",
                            editForm?.frequencyValue ?? 1,
                            editForm?.frequencyUnit ?? "minutes"
                          )}
                        </div>
                      ) : (
                        computeNextRun(
                          scheduler.startTime,
                          scheduler.frequencyValue,
                          scheduler.frequencyUnit
                        )
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select
                          value={editForm?.status ?? "Active"}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    status: e.target.value as DriftScheduler["status"],
                                  }
                                : prev
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="Active">Active</option>
                          <option value="Paused">Paused</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            scheduler.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <CheckCircle2 size={12} />
                          {scheduler.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs"
                            >
                              <Save size={12} />
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-xs"
                            >
                              <X size={12} />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleCheckNow(scheduler.id)}
                              disabled={checkingId === scheduler.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <Play size={12} />
                              {checkingId === scheduler.id ? "Checking..." : "Check now"}
                            </button>
                            <button
                              onClick={() => handleEdit(scheduler)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs"
                            >
                              <Edit size={12} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(scheduler.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-xs"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
