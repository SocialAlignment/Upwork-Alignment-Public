import Anthropic from "@anthropic-ai/sdk";
import type { InsertAnalysisResult } from "@shared/schema";

const anthropic = new Anthropic();

interface ProfileData {
  resumeText: string;
  upworkUrl: string;
  linkedinUrl: string;
}

export async function analyzeProfile(profileData: ProfileData): Promise<Omit<InsertAnalysisResult, 'profileId'>> {
  const prompt = `You are an expert Upwork freelancer consultant. Analyze the following professional profile data and provide strategic insights.

RESUME CONTENT:
${profileData.resumeText}

UPWORK PROFILE: ${profileData.upworkUrl}
LINKEDIN PROFILE: ${profileData.linkedinUrl}

Based on this information, provide a comprehensive analysis in the following JSON format:

{
  "archetype": "A short professional title/archetype (e.g., 'Senior Full Stack Engineer', 'Technical Content Strategist')",
  "proficiency": A number between 1-100 representing overall technical proficiency based on experience,
  "skills": ["Array of 4-8 core technical skills extracted from the resume"],
  "projects": [
    {"name": "Project name from resume/experience", "type": "Project category (e.g., Enterprise, SaaS, Startup)"}
  ],
  "gapTitle": "A compelling title for the main strategic gap you identified",
  "gapDescription": "A 1-2 sentence description of a high-value positioning gap (e.g., missing consultancy keywords, undervaluing expertise)",
  "suggestedPivot": "A specific actionable suggestion for repositioning (e.g., 'Position as Technical Partner rather than Developer')",
  "missingSkillCluster": "Title of the skill category label",
  "missingSkill": "A specific in-demand skill they should add based on their background",
  "missingSkillDesc": "Why this skill is valuable given their profile (1 sentence)",
  "clientGapType": "Label for client type category",
  "clientGap": "A specific client vertical/industry they should target",
  "clientGapDesc": "Why their background fits this client type (1 sentence)",
  "recommendedKeywords": ["Array of 5-7 high-value keywords to add to their Upwork profile"]
}

IMPORTANT: 
- Be specific and actionable, not generic
- Base insights on actual resume content
- Focus on high-value market positioning
- Recommend keywords that command premium rates
- Identify genuine blindspots based on market research

Return ONLY valid JSON, no additional text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  const result = content.text;
  
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    archetype: parsed.archetype,
    proficiency: parsed.proficiency,
    skills: parsed.skills,
    projects: parsed.projects,
    gapTitle: parsed.gapTitle,
    gapDescription: parsed.gapDescription,
    suggestedPivot: parsed.suggestedPivot,
    missingSkillCluster: parsed.missingSkillCluster,
    missingSkill: parsed.missingSkill,
    missingSkillDesc: parsed.missingSkillDesc,
    clientGapType: parsed.clientGapType,
    clientGap: parsed.clientGap,
    clientGapDesc: parsed.clientGapDesc,
    recommendedKeywords: parsed.recommendedKeywords,
  };
}

export async function searchUpworkInsights(query: string): Promise<string> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are a freelance market research expert. Provide factual, current insights about Upwork trends, pricing, and successful strategies.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.2,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error("Perplexity API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
