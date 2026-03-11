import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";

// ioredis/bullmq version mismatch — type assertion needed
const connection: any = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { // eslint-disable-line
  maxRetriesPerRequest: null,
});

// ─── Queues ────────────────────────────────────────────────────────────────

export const intelligenceQueue = new Queue("intelligence", { connection });
export const creativeQueue = new Queue("creative", { connection });
export const strategyQueue = new Queue("strategy", { connection });
export const pipelineQueue = new Queue("full-pipeline", { connection });

// ─── Workers ───────────────────────────────────────────────────────────────

const intelligenceWorker = new Worker(
  "intelligence",
  async (job) => {
    const { userId } = job.data;
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/agents/intelligence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },
  { connection, concurrency: 5 }
);

const creativeWorker = new Worker(
  "creative",
  async (job) => {
    const { userId } = job.data;
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/agents/creative`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },
  { connection, concurrency: 5 }
);

const strategyWorker = new Worker(
  "strategy",
  async (job) => {
    const { userId } = job.data;
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/agents/strategy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },
  { connection, concurrency: 5 }
);

const pipelineWorker = new Worker(
  "full-pipeline",
  async (job) => {
    const { userId } = job.data;
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/agents/pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },
  { connection, concurrency: 3 }
);

// ─── Event Handlers ────────────────────────────────────────────────────────

for (const worker of [intelligenceWorker, creativeWorker, strategyWorker, pipelineWorker]) {
  worker.on("completed", (job) => {
    console.log(`[${worker.name}] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[${worker.name}] Job ${job?.id} failed:`, err.message);
  });
}

console.log("AdWing workers started. Listening for jobs...");
