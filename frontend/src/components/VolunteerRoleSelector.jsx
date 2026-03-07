function VolunteerRoleSelector({ roles, selectedRoleId, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Volunteer Role</label>
      <select className="input" value={selectedRoleId} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose role</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.roleName} - filled: {role.filledCount || 0}/{role.volunteersRequired}
          </option>
        ))}
      </select>
    </div>
  )
}

export default VolunteerRoleSelector
