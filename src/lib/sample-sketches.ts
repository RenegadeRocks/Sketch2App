type RichText = { type: "doc"; content: Array<{ type: "paragraph"; content?: Array<{ type: "text"; text: string }> }> };

function richText(t: string): RichText {
  return { type: "doc", content: [{ type: "paragraph", content: t ? [{ type: "text", text: t }] : [] }] };
}

export interface SampleShape {
  type: "geo" | "text";
  x: number;
  y: number;
  props: Record<string, unknown>;
}

export interface SampleSketch {
  id: string;
  label: string;
  description: string;
  shapes: SampleShape[];
}

const box = (x: number, y: number, w: number, h: number, t?: string): SampleShape => ({
  type: "geo",
  x,
  y,
  props: { geo: "rectangle", w, h, ...(t ? { richText: richText(t) } : {}) },
});

const label = (x: number, y: number, t: string, size: "s" | "m" | "l" | "xl" = "m"): SampleShape => ({
  type: "text",
  x,
  y,
  props: { richText: richText(t), size, autoSize: true },
});

const loginSketch: SampleSketch = {
  id: "login",
  label: "Login form",
  description: "Centered card with email, password, and a sign-in button",
  shapes: [
    box(180, 120, 360, 460),
    label(220, 150, "Welcome back", "xl"),
    label(220, 210, "Sign in to your account", "s"),
    label(220, 260, "Email", "s"),
    box(220, 285, 280, 44),
    label(220, 350, "Password", "s"),
    box(220, 375, 280, 44),
    box(220, 445, 280, 48, "Sign in"),
    label(220, 510, "Forgot password?", "s"),
  ],
};

const pricingSketch: SampleSketch = {
  id: "pricing",
  label: "Pricing page",
  description: "Three-tier pricing with feature lists and CTAs",
  shapes: [
    label(280, 60, "Choose a plan", "xl"),
    label(280, 110, "Simple pricing that scales with you", "s"),

    box(80, 180, 220, 380),
    label(110, 210, "Starter", "l"),
    label(110, 250, "$9 / month", "m"),
    label(110, 300, "10 projects", "s"),
    label(110, 330, "Email support", "s"),
    label(110, 360, "Basic analytics", "s"),
    box(110, 480, 160, 44, "Start free"),

    box(330, 180, 220, 380),
    label(360, 210, "Pro", "l"),
    label(360, 250, "$29 / month", "m"),
    label(360, 300, "Unlimited projects", "s"),
    label(360, 330, "Priority support", "s"),
    label(360, 360, "Advanced analytics", "s"),
    label(360, 390, "Team collaboration", "s"),
    box(360, 480, 160, 44, "Get Pro"),

    box(580, 180, 220, 380),
    label(610, 210, "Enterprise", "l"),
    label(610, 250, "Custom", "m"),
    label(610, 300, "Everything in Pro", "s"),
    label(610, 330, "Dedicated support", "s"),
    label(610, 360, "SSO and audit logs", "s"),
    label(610, 390, "Custom integrations", "s"),
    box(610, 480, 160, 44, "Contact sales"),
  ],
};

const dashboardSketch: SampleSketch = {
  id: "dashboard",
  label: "Dashboard",
  description: "Sidebar nav with stat cards and a chart",
  shapes: [
    box(40, 40, 180, 560),
    label(60, 70, "Acme", "l"),
    label(60, 130, "Home", "s"),
    label(60, 170, "Analytics", "s"),
    label(60, 210, "Projects", "s"),
    label(60, 250, "Team", "s"),
    label(60, 290, "Settings", "s"),

    label(260, 60, "Dashboard", "xl"),
    label(260, 110, "Welcome back, Alex", "s"),

    box(260, 160, 200, 110),
    label(280, 185, "Total users", "s"),
    label(280, 215, "12,438", "l"),

    box(480, 160, 200, 110),
    label(500, 185, "Revenue", "s"),
    label(500, 215, "$48.2k", "l"),

    box(700, 160, 200, 110),
    label(720, 185, "Active now", "s"),
    label(720, 215, "327", "l"),

    box(260, 300, 640, 280),
    label(280, 320, "Weekly traffic", "m"),
  ],
};

export const SAMPLE_SKETCHES: SampleSketch[] = [loginSketch, pricingSketch, dashboardSketch];

export function findSample(id: string): SampleSketch | undefined {
  return SAMPLE_SKETCHES.find((s) => s.id === id);
}
