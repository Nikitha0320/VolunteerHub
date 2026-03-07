import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import {
  approvePasswordResetRequest,
  deleteUser,
  getAllUsers,
  getPendingPasswordResetRequests
} from '../services/adminService'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [resetRequests, setResetRequests] = useState([])
  const [message, setMessage] = useState('')

  const loadUsers = async () => {
    const res = await getAllUsers()
    setUsers(res.data)
  }

  const loadResetRequests = async () => {
    const res = await getPendingPasswordResetRequests()
    setResetRequests(res.data)
  }

  useEffect(() => {
    loadUsers()
    loadResetRequests()
  }, [])

  const onDelete = async (id) => {
    setMessage('')
    try {
      await deleteUser(id)
      setMessage('User deleted successfully.')
      loadUsers()
      loadResetRequests()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete user.')
    }
  }

  const onApproveReset = async (id) => {
    await approvePasswordResetRequest(id)
    setMessage('Password reset request approved successfully.')
    loadResetRequests()
  }

  return (
    <MainLayout>
      <div className="card mb-4">
        <h2 className="text-xl font-semibold mb-3">User Management</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-2">{user.name}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.role}</td>
                <td className="py-2">
                  <button className="text-red-600 hover:underline" onClick={() => onDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Password Reset Requests</h2>
        {message && <p className={`text-sm mb-3 ${message.toLowerCase().includes('failed') ? 'text-red-600' : 'text-amber-700'}`}>{message}</p>}
        {resetRequests.length === 0 ? (
          <p className="text-sm text-slate-500">No pending reset requests.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">User</th>
                <th className="py-2">Email</th>
                <th className="py-2">Requested At</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {resetRequests.map((req) => (
                <tr key={req.id} className="border-b">
                  <td className="py-2">{req.userName}</td>
                  <td className="py-2">{req.userEmail}</td>
                  <td className="py-2">{req.requestedAt}</td>
                  <td className="py-2">
                    <button className="text-primary hover:underline" onClick={() => onApproveReset(req.id)}>Approve Reset</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  )
}

export default AdminDashboard
