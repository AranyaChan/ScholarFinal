/** Only the email in ADMIN_EMAIL may access admin routes. */
export function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!configured) {
    return res.status(503).json({
      error: 'Admin access is not configured. Set ADMIN_EMAIL on the server.',
    });
  }

  const email =
    (typeof req.query.email === 'string' && req.query.email.trim()) ||
    (typeof req.headers['x-admin-email'] === 'string' && req.headers['x-admin-email'].trim()) ||
    '';

  if (!email || email.toLowerCase() !== configured) {
    return res.status(403).json({ error: 'Forbidden: admin access only' });
  }

  next();
}
