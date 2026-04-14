import type { GeneratedProject } from "@/lib/schemas";

type SandpackFiles = Record<string, { code: string }>;

const APP_WRAPPER = `
import Page from "./page";
export default function App() { return <Page />; }
`.trim();

const BASE_PKG = {
  name: "sketch2app-preview",
  main: "/App.tsx",
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.454.0",
  },
};

export function projectToSandpackFiles(project: GeneratedProject): SandpackFiles {
  const files: SandpackFiles = {
    "/App.tsx": { code: APP_WRAPPER },
    "/package.json": { code: JSON.stringify(BASE_PKG, null, 2) },
  };
  for (const f of project.files) {
    const sandpackPath = "/src/" + f.path.replace(/^app\//, "").replace(/^components\//, "components/");
    files[sandpackPath] = { code: f.contents };
  }
  return files;
}
