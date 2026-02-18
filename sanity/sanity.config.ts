import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const viteEnv = ((import.meta as { env?: Record<string, string | undefined> }).env ??
  {}) as Record<string, string | undefined>;
const nodeEnv = process.env ?? {};

const projectId =
  viteEnv.SANITY_STUDIO_PROJECT_ID ??
  viteEnv.NEXT_PUBLIC_SANITY_PROJECT_ID ??
  nodeEnv.SANITY_STUDIO_PROJECT_ID ??
  nodeEnv.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  viteEnv.SANITY_STUDIO_DATASET ??
  viteEnv.NEXT_PUBLIC_SANITY_DATASET ??
  nodeEnv.SANITY_STUDIO_DATASET ??
  nodeEnv.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "Missing Sanity config. Set SANITY_STUDIO_PROJECT_ID/SANITY_STUDIO_DATASET or NEXT_PUBLIC_SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_DATASET."
  );
}

export default defineConfig({
  name: "default",
  title: "Sourboo CMS",

  projectId,
  dataset,

  plugins: [structureTool({ structure })],

  schema: {
    types: schemaTypes,
  },
});
