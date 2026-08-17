export function errorHandler(error, request, response, _next) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const publicMessage =
    statusCode >= 500 ? error.publicMessage || "Unable to process request" : error.publicMessage || error.message;

  console.error(`${request.method} ${request.originalUrl} failed: ${error.message}`);
  response.status(statusCode).json({ error: publicMessage });
}