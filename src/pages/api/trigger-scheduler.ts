import type { NextApiRequest, NextApiResponse } from "next";
import { setupScheduler } from "../../utils/scheduler";

let schedulerInitialized = false;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { gameAddress } = req.body;
  if (!schedulerInitialized) {
    setupScheduler();
    schedulerInitialized = true;
    console.log("Scheduler initialized");
  }

  res.status(200).json({ message: "Scheduler is running" });
}
