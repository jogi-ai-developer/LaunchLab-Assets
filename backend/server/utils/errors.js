export class AppError extends Error {
  constructor(statusCode, publicMessage, internalMessage = publicMessage) {
    super(internalMessage);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
  }
}