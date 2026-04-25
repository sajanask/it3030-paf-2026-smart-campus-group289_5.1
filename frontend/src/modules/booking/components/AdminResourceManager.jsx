import { useEffect, useState } from "react";
import {
  createResource,
  deleteResource,
  getResources,
  updateResource
} from "../api/resourceApi";

const emptyForm = {
  name: "",
  type: "Lab",
  capacity: "",
  location: "",
  status: "Available",
  features: "",
  description: ""
};

const AdminResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setMessage("");
    setError("");
    setForm({
      name: resource.name || "",
      type: resource.type || "Lab",
      capacity: resource.capacity || "",
      location: resource.location || "",
      status: resource.status || "Available",
      features: Array.isArray(resource.features) ? resource.features.join(", ") : "",
      description: resource.description || ""
    });
  };

  const handleCancel = () => {
    setEditingId("");
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name.trim(),
      type: form.type,
      capacity: Number(form.capacity),
      location: form.location.trim(),
      status: form.status,
      features: form.features
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean),
      description: form.description.trim()
    };

    try {
      if (editingId) {
        await updateResource(editingId, payload);
        setEditingId("");
        setForm(emptyForm);
        setMessage("Resource updated successfully.");
      } else {
        await createResource(payload);
        setForm(emptyForm);
        setMessage("Resource added successfully.");
      }
      await fetchResources();
    } catch (err) {
      setError(err.message || "Failed to save resource");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resource) => {
    const confirmed = window.confirm(`Delete ${resource.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await deleteResource(resource.id);
      setMessage("Resource removed successfully.");
      if (editingId === resource.id) {
        handleCancel();
      }
      await fetchResources();
    } catch (err) {
      setError(err.message || "Failed to delete resource");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Admin Resource Management
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add, edit, and remove labs, halls, and auditoriums.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            New Resource
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Resource Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="Lab">Lab</option>
              <option value="Hall">Hall</option>
              <option value="Auditorium">Auditorium</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Capacity
            </label>
            <input
              type="number"
              min="1"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Features
            </label>
            <input
              type="text"
              name="features"
              value={form.features}
              onChange={handleChange}
              placeholder="Projector, AC, Smart Board"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows="4"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
                saving ? "cursor-not-allowed bg-slate-400" : "bg-slate-900 hover:bg-sky-700"
              }`}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Resource"
                : "Add Resource"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Saved Resources</h3>
            <p className="mt-1 text-sm text-slate-500">
              These resources are shown on the student booking page.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchResources}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            No resources added yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="rounded-3xl border border-slate-200 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                      {resource.type}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-slate-900">
                      {resource.name}
                    </h4>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {resource.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Capacity: {resource.capacity}</p>
                  <p>Location: {resource.location}</p>
                  <p>{resource.description}</p>
                </div>

                {Array.isArray(resource.features) && resource.features.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(resource)}
                    className="rounded-2xl bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(resource)}
                    className="rounded-2xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminResourceManager;
