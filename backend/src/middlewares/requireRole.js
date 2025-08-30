export function requireRole(...roles) {
  return (req, res, next) => {
    const ok = roles.some(r => req.user?.roles?.includes(r));
    if (!ok) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}
