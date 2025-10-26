const errorHandler = (err, req, res, next) => {
  const id = req.requestId || (req.headers && req.headers["x-request-id"]);
  // structured log
  console.error({ requestId: id, message: err.message, stack: err.stack });
  if (res.headersSent) return next(err);

  // Known error shapes
  if (err.name === "ValidationError") {
    return res
      .status(422)
      .json({
        requestId: id,
        message: "Validation Error",
        details: err.errors,
      });
  }

  if (err.status && Number(err.status) >= 400 && Number(err.status) < 600) {
    return res.status(err.status).json({ requestId: id, message: err.message });
  }

  res.status(500).json({ requestId: id, message: "Internal Server Error" });
};

module.exports = { errorHandler };
