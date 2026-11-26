const staffDashboards = {
  super_admin: '/admin',
  manager: '/manager',
  referee: '/referee',
};

export function getStaffDashboard(role) {
  return Object.hasOwn(staffDashboards, role) ? staffDashboards[role] : null;
}
