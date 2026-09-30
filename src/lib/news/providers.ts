import type { GeneratedNewsCandidate } from "@/types/news";

export type NewsProviderName = "mock" | "openai";

export interface NewsProvider {
  name: NewsProviderName;
  generateForDay(day: string): Promise<GeneratedNewsCandidate[]>;
}

const MOCK_POOL: GeneratedNewsCandidate[] = [
  {
    title: "Open-source robotics stack adds on-device VLM navigation",
    summary:
      "A new open robotics release pairs lightweight vision-language models with local planners for warehouse AMRs.",
    url: "https://example.com/news/robotics-vlm-navigation",
    sourceName: "Robotics Weekly",
    focus: "tecnico",
    impact: 8,
    topics: ["robotics", "vlm", "edge-ai"],
  },
  {
    title: "AI chip startup unveils manufacturing partnership for inference ASICs",
    summary:
      "Foundry deal targets volume production of low-power inference ASICs aimed at industrial inspection lines.",
    url: "https://example.com/news/ai-asic-manufacturing",
    sourceName: "SemiAI Digest",
    focus: "producto",
    impact: 7,
    topics: ["hardware", "manufacturing", "inference"],
  },
  {
    title: "EU research consortium publishes benchmarks for collaborative robots with LLM planners",
    summary:
      "Cross-lab study compares safety envelopes when LLMs propose high-level robot tasks in shared workspaces.",
    url: "https://example.com/news/eu-cobot-llm-benchmarks",
    sourceName: "Horizon AI",
    focus: "investigacion",
    impact: 6,
    topics: ["cobots", "llm", "safety"],
  },
  {
    title: "Factory vision systems shift to multimodal models for defect detection",
    summary:
      "OEMs report higher recall on rare defects after replacing CNN-only pipelines with multimodal inspectors.",
    url: "https://example.com/news/multimodal-defect-detection",
    sourceName: "Industry AI",
    focus: "sector",
    impact: 7,
    topics: ["manufacturing", "vision", "quality"],
  },
  {
    title: "Humanoid pilot expands on automotive assembly line",
    summary:
      "Automaker extends limited humanoid trial from kitting to torque-critical fastening stations.",
    url: "https://example.com/news/humanoid-auto-assembly",
    sourceName: "Auto Robotics",
    focus: "sector",
    impact: 8,
    topics: ["humanoid", "automotive", "robotics"],
  },
  {
    title: "Edge AI runtime cuts latency for pick-and-place arms",
    summary:
      "New runtime packs quantized detectors onto industrial PCs, claiming sub-20ms cycle times.",
    url: "https://example.com/news/edge-ai-pick-place",
    sourceName: "EdgeML Journal",
    focus: "tecnico",
    impact: 6,
    topics: ["edge", "robotics", "latency"],
  },
];

export class MockNewsProvider implements NewsProvider {
  name: NewsProviderName = "mock";

  async generateForDay(day: string): Promise<GeneratedNewsCandidate[]> {
    // Deterministic subset based on day string so re-runs are stable in mock mode
    const seed = [...day].reduce((a, c) => a + c.charCodeAt(0), 0);
    const count = 4 + (seed % 3);
    const rotated = [...MOCK_POOL];
    for (let i = 0; i < seed % rotated.length; i++) {
      rotated.push(rotated.shift()!);
    }
    return rotated.slice(0, count).map((item, idx) => ({
      ...item,
      // Unique URL per day so mock inserts don't collide across days on url_hash
      // while still allowing cross-day title dedupe testing via shared titles
      url: item.url.replace(
        "https://example.com/news/",
        `https://example.com/news/${day}/`
      ),
      title: idx === 0 ? item.title : `${item.title} (${day})`,
    }));
  }
}

export class OpenAINewsProvider implements NewsProvider {
  name: NewsProviderName = "openai";

  async generateForDay(day: string): Promise<GeneratedNewsCandidate[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY missing — set NEWS_PROVIDER=mock or provide a real key via Secrets Manager"
      );
    }
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You generate a JSON object { items: [...] } of AI, robotics, and AI-related manufacturing/hardware news candidates for a given day. Each item: title, summary, url, sourceName, focus (sector|producto|investigacion|tecnico), impact (1-10), topics (string[]). Use real-looking public URLs when possible; never invent API keys.",
          },
          {
            role: "user",
            content: `Generate 5–8 news candidates for day ${day}.`,
          },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI provider failed: ${res.status} ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { items?: GeneratedNewsCandidate[] };
    return parsed.items ?? [];
  }
}

export function getNewsProvider(): NewsProvider {
  const name = (process.env.NEWS_PROVIDER || "mock").toLowerCase();
  if (name === "openai") return new OpenAINewsProvider();
  return new MockNewsProvider();
}
