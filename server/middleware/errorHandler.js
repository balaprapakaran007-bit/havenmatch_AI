export function globalErrorHandler(err, req, res, next) {
  console.error('[API Error]:', err.stack || err.message || err);
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred.',
    timestamp: new Date().toISOString()
  });
}
