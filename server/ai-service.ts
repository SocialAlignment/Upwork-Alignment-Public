import Anthropic from "@anthropic-ai/sdk";
import type { InsertAnalysisResult, AnalysisResult, ProjectSuggestion } from "@shared/schema";
import { level1Categories, getLevel2Categories, getLevel3Categories, hasLevel3 } from "@shared/upwork-categories";

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
    temperature: 0,
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

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    throw new Error("AI response contained invalid JSON format");
  }

  const requiredFields = [
    'archetype', 'proficiency', 'skills', 'projects', 'gapTitle', 
    'gapDescription', 'suggestedPivot', 'missingSkillCluster', 
    'missingSkill', 'missingSkillDesc', 'clientGapType', 
    'clientGap', 'clientGapDesc', 'recommendedKeywords'
  ];
  
  for (const field of requiredFields) {
    if (parsed[field] === undefined) {
      throw new Error(`AI response missing required field: ${field}`);
    }
  }
  
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
      temperature: 0,
      top_p: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error("Perplexity API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateProjectSuggestions(
  analysisData: AnalysisResult,
  projectIdea: string
): Promise<ProjectSuggestion> {
  const marketResearchQuery = `What are the current best practices for Upwork project catalog listings related to: "${projectIdea.slice(0, 200)}"
  
  For a freelancer with these skills: ${analysisData.skills.slice(0, 3).join(", ")}
  
  Focus on:
  1. What project titles are getting the most client interest for similar services?
  2. Which Upwork categories and subcategories have highest demand for this type of work?
  3. What search tags and keywords are clients using to find this type of service?
  4. What differentiates top-performing project listings from average ones?
  5. Any specific examples of successful project titles in this space?
  
  Please provide specific, actionable insights with examples based on current Upwork trends.`;

  let marketInsights = "";
  try {
    marketInsights = await searchUpworkInsights(marketResearchQuery);
  } catch (error) {
    console.error("Perplexity market research failed:", error);
    marketInsights = "Market research unavailable - using general best practices.";
  }

  const availableCategories = level1Categories.map(l1 => {
    const l2s = getLevel2Categories(l1);
    return `${l1}: ${l2s.slice(0, 5).join(", ")}${l2s.length > 5 ? '...' : ''}`;
  }).join("\n");

  const prompt = `You are an expert Upwork project optimization consultant. Based on the freelancer's project idea, profile analysis, and current market research, generate optimized project catalog suggestions.

PROJECT IDEA FROM FREELANCER:
${projectIdea}

FREELANCER PROFILE:
- Archetype: ${analysisData.archetype}
- Proficiency: ${analysisData.proficiency}%
- Core Skills: ${analysisData.skills.join(", ")}
- Project Experience: ${analysisData.projects.map((p: { name: string; type: string }) => `${p.name} (${p.type})`).join(", ")}
- Recommended Keywords: ${analysisData.recommendedKeywords.join(", ")}
- Strategic Gap: ${analysisData.gapTitle} - ${analysisData.gapDescription}
- Suggested Pivot: ${analysisData.suggestedPivot}
- Target Client: ${analysisData.clientGap}

CURRENT MARKET RESEARCH:
${marketInsights}

AVAILABLE UPWORK CATEGORIES (YOU MUST SELECT FROM THESE EXACT OPTIONS):
${availableCategories}

Generate optimized project suggestions in this JSON format:
{
  "titles": [
    {
      "text": "A compelling 7-12 word project title that sells the outcome to clients (max 75 chars)",
      "rationale": "Why this title works based on their profile and market trends",
      "confidence": 0.95
    }
  ],
  "categories": [
    {
      "level1": "Development & IT",
      "level2": "Web Programming",
      "level3": "Web Application Programming",
      "rationale": "Why this category matches their expertise and market demand",
      "confidence": 0.9
    }
  ],
  "attributes": {
    "categorySpecificAttribute": {
      "recommended": ["Option1", "Option2"],
      "rationale": "Why these attributes are recommended"
    }
  },
  "searchTags": [
    {
      "tag": "keyword",
      "rationale": "Why this tag will attract ideal clients"
    }
  ],
  "marketInsights": "A 2-3 sentence summary of key market insights for this freelancer"
}

IMPORTANT:
- Generate 3 title options, ranked by effectiveness
- Suggest 2-3 category paths that match their skills
- Recommend 5 high-impact search tags
- Titles MUST be 7+ words and under 75 characters
- Focus on client outcomes, not freelancer capabilities
- Use the market research to inform your suggestions

Return ONLY valid JSON, no additional text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    temperature: 0,
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

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    throw new Error("AI response contained invalid JSON format");
  }

  return {
    titles: parsed.titles || [],
    categories: parsed.categories || [],
    attributes: parsed.attributes || {},
    searchTags: parsed.searchTags || [],
    marketInsights: parsed.marketInsights || marketInsights,
  };
}
