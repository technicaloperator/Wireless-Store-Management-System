import { getStatus as getStatusService } from "../services/statusService.js";

export async function getStatus(req, res) {
  try {
    const status = getStatusService();

    const dbResult = status.databaseQuery();

    res.json({
      success: true,
      database: dbResult ? "Connected" : "Disconnected",
      backend: "Running",
      version: "WSMS v2.0",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Backend status check failed",
      error: error.message,
    });
  }
}
