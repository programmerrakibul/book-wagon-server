import type { Request, Response } from "express";

export const healthCheck = (_req: Request, res: Response) => {
  try {
    res.status(200).send({
      success: true,
      message: "Server is healthy!",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error(`Error in healthCheck: ${error}`);

    res.status(500).send({
      success: false,
      message: "Server is not healthy!",
      timestamp: new Date().toISOString(),
    });
  }
}
