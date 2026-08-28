import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash, FaUserSlash, FaUserCheck } from "react-icons/fa";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id) => {
    try {
      const { data } = await api.put(`/users/${id}/toggle-status`);
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user account?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete user");
    }
  };

  if (loading) return <Loader label="Loading users" />;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Users</h1>
      <div className="bg-white border border-mist rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/40 text-xs uppercase bg-mist/50">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-mist">
                <td className="p-3">{u.name}</td>
                <td className="p-3 text-ink/60">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? "bg-sage/20 text-sage" : "bg-rose/10 text-rose"}`}>
                    {u.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {u.role !== "admin" && (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => toggleStatus(u._id)} className="text-ink/60 hover:text-ink" title="Toggle status">
                        {u.isActive ? <FaUserSlash size={14} /> : <FaUserCheck size={14} />}
                      </button>
                      <button onClick={() => deleteUser(u._id)} className="text-ink/60 hover:text-rose" title="Delete user">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
