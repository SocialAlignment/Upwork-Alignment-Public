import Anthropic from "@anthropic-ai/sdk";
import type { InsertAnalysisResult, AnalysisResult, ProjectSuggestion, PricingSuggestion } from "@shared/schema";
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

export async function generatePricingSuggestions(
  analysisData: AnalysisResult,
  projectIdea: string,
  projectTitle: string,
  projectCategory: string
): Promise<PricingSuggestion> {
  const pricingResearchQuery = `What are the current pricing trends and strategies for Upwork freelancers offering: "${projectIdea.slice(0, 150)}"
  
  For a freelancer with:
  - Role: ${analysisData.archetype}
  - Skills: ${analysisData.skills.slice(0, 3).join(", ")}
  - Proficiency level: ${analysisData.proficiency}%
  
  Focus on:
  1. What are typical price ranges for starter, standard, and premium tiers for this type of service?
  2. What delivery timeframes are competitive but realistic?
  3. What features differentiate each pricing tier?
  4. What add-ons do successful freelancers offer?
  5. How do top-rated freelancers structure their 3-tier pricing?
  
  Provide specific dollar amounts and timeframes based on current Upwork market data.`;

  let pricingInsights = "";
  try {
    pricingInsights = await searchUpworkInsights(pricingResearchQuery);
  } catch (error) {
    console.error("Perplexity pricing research failed:", error);
    pricingInsights = "Pricing research unavailable - using general best practices.";
  }

  const prompt = `You are an expert Upwork pricing strategist. Based on the freelancer's profile, project, and current market research, generate optimal pricing tier recommendations.

PROJECT DETAILS:
- Title: ${projectTitle}
- Category: ${projectCategory}
- Description: ${projectIdea}

FREELANCER PROFILE:
- Archetype: ${analysisData.archetype}
- Proficiency: ${analysisData.proficiency}%
- Core Skills: ${analysisData.skills.join(", ")}
- Target Client: ${analysisData.clientGap}
- Strategic Position: ${analysisData.suggestedPivot}

CURRENT MARKET RESEARCH:
${pricingInsights}

Generate a comprehensive 3-tier pricing structure in this JSON format:
{
  "tiers": {
    "starter": {
      "name": "Starter",
      "title": "Short tier title (max 30 chars) - what client gets",
      "titleRationale": "Why this title works for the entry-level offering",
      "description": "2-3 sentence description of what's included (max 80 chars)",
      "descriptionRationale": "Why this description appeals to budget-conscious clients",
      "deliveryDays": 3,
      "deliveryRationale": "Why this timeframe is optimal for this tier",
      "price": 150,
      "priceRationale": "Why this price point works based on market data and proficiency level",
      "features": ["Feature 1", "Feature 2"],
      "featuresRationale": "Why these features are included at the starter level"
    },
    "standard": {
      "name": "Standard",
      "title": "Short tier title (max 30 chars) - best value proposition",
      "titleRationale": "Why this title works for the recommended tier",
      "description": "2-3 sentence description of enhanced value (max 80 chars)",
      "descriptionRationale": "Why this is positioned as the recommended option",
      "deliveryDays": 5,
      "deliveryRationale": "Why this timeframe balances speed and quality",
      "price": 350,
      "priceRationale": "Why this price represents best value based on market positioning",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "featuresRationale": "Why these features make this tier the sweet spot"
    },
    "advanced": {
      "name": "Advanced",
      "title": "Short tier title (max 30 chars) - premium offering",
      "titleRationale": "Why this title justifies premium pricing",
      "description": "2-3 sentence description of comprehensive service (max 80 chars)",
      "descriptionRationale": "Why this description attracts premium clients",
      "deliveryDays": 7,
      "deliveryRationale": "Why premium clients accept longer timelines for comprehensive work",
      "price": 750,
      "priceRationale": "Why this premium price is justified based on value and market rates",
      "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
      "featuresRationale": "Why these premium features command higher pricing"
    }
  },
  "serviceOptions": [
    {
      "name": "Source Files",
      "starterIncluded": false,
      "standardIncluded": true,
      "advancedIncluded": true,
      "rationale": "Why this service option is distributed this way across tiers"
    }
  ],
  "addOns": [
    {
      "name": "Express Delivery",
      "price": 50,
      "rationale": "Why clients would pay extra for this add-on"
    }
  ],
  "pricingStrategy": "A 2-3 sentence explanation of the overall pricing strategy and how the tiers are designed to maximize conversions",
  "marketContext": "A 2-3 sentence summary of current market conditions and how this pricing compares to competitors"
}

IMPORTANT PRICING GUIDELINES:
- Price based on proficiency level: ${analysisData.proficiency}% suggests ${analysisData.proficiency >= 80 ? 'premium' : analysisData.proficiency >= 60 ? 'mid-range' : 'competitive'} positioning
- Standard tier should be 2-2.5x the Starter price (anchoring effect)
- Advanced tier should be 2-2.5x the Standard price
- Delivery times should scale appropriately with complexity
- Each tier title must be under 30 characters
- Each tier description must be under 80 characters
- Service options should create clear differentiation between tiers
- Include 3-5 service options and 2-4 add-ons

Return ONLY valid JSON, no additional text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
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

  const defaultTier = {
    name: "",
    title: "",
    titleRationale: "",
    description: "",
    descriptionRationale: "",
    deliveryDays: 1,
    deliveryRationale: "",
    price: 0,
    priceRationale: "",
    features: [],
    featuresRationale: "",
  };

  return {
    tiers: {
      starter: { ...defaultTier, ...parsed.tiers?.starter, name: "Starter" },
      standard: { ...defaultTier, ...parsed.tiers?.standard, name: "Standard" },
      advanced: { ...defaultTier, ...parsed.tiers?.advanced, name: "Advanced" },
    },
    serviceOptions: parsed.serviceOptions || [],
    addOns: parsed.addOns || [],
    pricingStrategy: parsed.pricingStrategy || "",
    marketContext: parsed.marketContext || pricingInsights,
  };
}
