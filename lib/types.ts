import { Type } from "@google/genai";

export interface CampaignData {
  subjectLines: string[];
  headline: string;
  bodyCopy: string;
  ctaText: string;
  imagePrompt: string;
  visualDescription: string;
}

export const campaignSchema = {
  type: Type.OBJECT,
  properties: {
    subjectLines: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 catchy subject lines for the email.",
    },
    headline: {
      type: Type.STRING,
      description: "A strong, punchy headline for the email body.",
    },
    bodyCopy: {
      type: Type.STRING,
      description: "The main content of the email in Markdown format. Personal, engaging, and clear.",
    },
    ctaText: {
      type: Type.STRING,
      description: "A clear call to action button text.",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A detailed, descriptive prompt for generating a high-quality visual asset for this email. Style: photorealistic or artistic as appropriate.",
    },
    visualDescription: {
      type: Type.STRING,
      description: "A brief description of what the visual should represent.",
    },
  },
  required: ["subjectLines", "headline", "bodyCopy", "ctaText", "imagePrompt", "visualDescription"],
};
