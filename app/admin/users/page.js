"use client";
import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  // Fetch Admins
  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/list", { cache: "no-store" });
      const data = await res.json();

      setAdmins(data.admins);
      setFiltered(data.admins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Admin
  const deleteAdmin = async (id, username) => {
    if (username?.toLowerCase() === "hamza") {
      alert("⚠️ Super Admin 'Hamza' cannot be deleted!");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${username}?`)) return;

    try {
      const res = await fetch(`/api/admin/delete/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const updated = admins.filter((a) => a._id !== id);
        setAdmins(updated);
        setFiltered(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search
  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setFiltered(admins);
      return;
    }

    const keyword = value.toLowerCase();

    const results = admins.filter((a) =>
      a.username?.toLowerCase().includes(keyword)
    );

    setFiltered(results);
  };

  // Add Admin
  const addAdmin = async () => {
    if (!form.username || !form.password)
      return alert("All fields are required!");

    if (form.username.toLowerCase() === "hamza")
      return alert("⚠️ You cannot create another Super Admin named Hamza!");

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        setForm({ username: "", password: "" });
        fetchAdmins();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Users</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Admin
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search admin by username..."
        className="w-full p-3 border rounded-lg mb-4 shadow-sm focus:ring focus:ring-blue-300"
      />

      {/* Admins Table */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-xl bg-white shadow-lg">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3 border">Username</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((admin) => (
              <tr key={admin._id} className="hover:bg-gray-50 transition">
                <td className="p-3 border">{admin.username}</td>

                <td className="p-3 border">
                  {admin.username?.toLowerCase() === "jamshed" ? (
                    <span className="px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm">
                      Super Admin
                    </span>
                  ) : (
                    "Admin"
                  )}
                </td>

                <td className="p-3 border text-center">
                  {admin.username?.toLowerCase() === "jamshed" ? (
                    <span className="text-gray-400 italic">Cannot Delete</span>
                  ) : (
                    <button
                      onClick={() => deleteAdmin(admin._id, admin.username)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No admin found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Admin</h2>

            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 mb-3 border rounded-lg"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-3 border rounded-lg"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={addAdmin}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
