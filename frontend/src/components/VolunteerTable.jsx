function VolunteerTable({ participants }) {
  return (
    <div className="card overflow-auto">
      <h3 className="text-lg font-semibold mb-3">Registered Volunteers</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Phone</th>
            <th className="py-2">Age</th>
            <th className="py-2">Address</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.volunteer?.name}</td>
              <td className="py-2">{p.volunteer?.email}</td>
              <td className="py-2">{p.volunteer?.phoneNumber || '-'}</td>
              <td className="py-2">{p.volunteer?.age || '-'}</td>
              <td className="py-2">{p.volunteer?.address || '-'}</td>
              <td className="py-2">{p.role?.roleName}</td>
              <td className="py-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VolunteerTable
