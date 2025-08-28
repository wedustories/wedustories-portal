// backend/middleware/roleMiddleware.js
// helpers to restrict access by role name or permission

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) return res.status(403).json({ message: 'Access denied' });
    const roleName = req.user.role.name;
    if (!allowedRoles.includes(roleName)) return res.status(403).json({ message: 'Forbidden - insufficient role' });
    next();
  };
};

// check permission strings (optional more granular)
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) return res.status(403).json({ message: 'Access denied' });
    const perms = req.user.role.permissions || [];
    if (!perms.includes(permission)) return res.status(403).json({ message: 'Forbidden - permission required' });
    next();
  };
};

// convenience middleware: manager or admin (and CEO)
const managerOrAbove = (req, res, next) => {
  if (!req.user || !req.user.role) return res.status(403).json({ message: 'Access denied' });
  const name = req.user.role.name;
  if (name === 'Admin' || name === 'Manager' || name === 'CEO') return next();
  return res.status(403).json({ message: 'Access denied. Managers or Admins only.' });
};

module.exports = { authorizeRoles, requirePermission, managerOrAbove };
