import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";
import { readStore, writeStore } from "./store.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const voterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  nationalId: z.string().min(4),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/)
});

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/api/election", async (_req, res) => {
  const store = await readStore();
  res.json(store.election);
});

app.get("/api/voters", async (_req, res) => {
  const store = await readStore();
  res.json(store.voters);
});

app.post("/api/voters/register", async (req, res) => {
  const parsed = voterSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid voter payload",
      issues: parsed.error.flatten()
    });
  }

  const store = await readStore();
  const walletAddress = parsed.data.walletAddress.toLowerCase();
  const alreadyExists = store.voters.some(
    (voter) =>
      voter.walletAddress.toLowerCase() === walletAddress ||
      voter.email.toLowerCase() === parsed.data.email.toLowerCase() ||
      voter.nationalId === parsed.data.nationalId
  );

  if (alreadyExists) {
    return res.status(409).json({ message: "Voter already registered" });
  }

  const voter = {
    id: crypto.randomUUID(),
    ...parsed.data,
    walletAddress,
    approved: false,
    createdAt: new Date().toISOString()
  };

  store.voters.push(voter);
  await writeStore(store);

  return res.status(201).json(voter);
});

app.patch("/api/voters/:walletAddress/approve", async (req, res) => {
  const store = await readStore();
  const walletAddress = req.params.walletAddress.toLowerCase();
  const voter = store.voters.find(
    (entry) => entry.walletAddress.toLowerCase() === walletAddress
  );

  if (!voter) {
    return res.status(404).json({ message: "Voter not found" });
  }

  voter.approved = true;
  voter.approvedAt = new Date().toISOString();
  await writeStore(store);

  return res.json(voter);
});

app.listen(port, () => {
  console.log(`Voting API running on http://localhost:${port}`);
});
