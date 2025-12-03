import Anthropic from "@anthropic-ai/sdk";
import type { InsertAnalysisResult, AnalysisResult, ProjectSuggestion, PricingSuggestion, GallerySuggestion, ProcessSuggestion, DescriptionSuggestion } from "@shared/schema";
import { level1Categories, getLevel2Categories, getLevel3Categories, hasLevel3 } from "@shared/upwork-categories";

const anthropic = new Anthropic();

interface ProfileData {
  resumeText: string;
  upworkUrl: string;
  linkedinUrl: string;
  profileContext?: string;
}

export async function analyzeProfile(profileData: ProfileData): Promise<Omit<InsertAnalysisResult, 'profileId'>> {
  const resumeSnippet = profileData.resumeText.slice(0, 1500);
  
  const marketContext = await searchUpworkInsights(
    `Identify the top 3 high-value freelancer archetypes and common client complaints for a professional with this experience: ${resumeSnippet}`
  );

  if (!marketContext || marketContext.trim() === "") {
    throw new Error("Market Research Failed: Perplexity returned empty response. Cannot proceed without live data.");
  }

  const marketSection = `LIVE MARKET RESEARCH (Current Upwork trends and insights):
${marketContext}

`;

  const existingOverviewSection = profileData.profileContext 
    ? `EXISTING UPWORK OVERVIEW (User's current profile text - understand their tone and positioning):
${profileData.profileContext}

` : '';

  const prompt = `You are an expert Upwork freelancer consultant. Analyze the following professional profile data and provide strategic insights.

${marketSection}${existingOverviewSection}RESUME CONTENT:
${profileData.resumeText}

UPWORK PROFILE: ${profileData.upworkUrl}
LINKEDIN PROFILE: ${profileData.linkedinUrl}

Based on the profile data and market research, provide a comprehensive analysis in the following JSON format:

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
  "recommendedKeywords": ["Array of 5-7 high-value keywords to add to their Upwork profile"],
  "signatureMechanism": "A unique, branded name for their proprietary process or methodology, e.g., 'The 4-Phase Growth Protocol', 'The Rapid MVP Framework', 'The Client-First Discovery System'. This should sound professional, memorable, and differentiate them from competitors."
}

IMPORTANT: 
- Be specific and actionable, not generic
- Base insights on actual resume content
- Focus on high-value market positioning
- Recommend keywords that command premium rates
- Identify genuine blindspots in their positioning
- The signatureMechanism should be unique and branded to this specific freelancer's expertise
- If EXISTING UPWORK OVERVIEW is provided: Use it to understand their current tone, voice, and positioning style. Match their communication style in recommendations. However, use the RESUME to identify the "Strategic Gap" - skills, experience, or positioning they are missing or underutilizing in their current overview.

Return ONLY valid JSON, no additional text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
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
    signatureMechanism: parsed.signatureMechanism || `The ${parsed.archetype} Framework`,
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
      model: "sonar",
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
    const errorText = await response.text().catch(() => 'Unable to read error body');
    console.error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`);
    throw new Error(`Perplexity API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("Perplexity API returned empty content");
  }
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    const textParts = content
      .map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.text) return item.text;
        return null;
      })
      .filter(Boolean);
    
    if (textParts.length === 0) {
      throw new Error("Perplexity API returned no usable text content");
    }
    return textParts.join('\n');
  }
  
  if (typeof content === 'object' && content.text) {
    return content.text;
  }
  
  throw new Error("Perplexity API returned unexpected content format");
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

  const marketInsights = await searchUpworkInsights(marketResearchQuery);

  if (!marketInsights || marketInsights.trim() === "") {
    throw new Error("Market Research Failed: Perplexity returned empty response. Cannot proceed without live data.");
  }

  const availableCategories = level1Categories.map(l1 => {
    const l2s = getLevel2Categories(l1);
    return `${l1}: ${l2s.slice(0, 5).join(", ")}${l2s.length > 5 ? '...' : ''}`;
  }).join("\n");

  const marketSection = `CURRENT MARKET RESEARCH:
${marketInsights}

`;

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

${marketSection}AVAILABLE UPWORK CATEGORIES (YOU MUST SELECT FROM THESE EXACT OPTIONS):
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
- Base suggestions on the freelancer's actual skills and experience

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

  const pricingInsights = await searchUpworkInsights(pricingResearchQuery);

  if (!pricingInsights || pricingInsights.trim() === "") {
    throw new Error("Market Research Failed: Perplexity returned empty pricing response. Cannot proceed without live data.");
  }

  const marketSection = `CURRENT MARKET RESEARCH:
${pricingInsights}

`;

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

${marketSection}EFFORT ANALYSIS REQUIREMENT:
For each tier, you MUST estimate the actual "Labor Hours" required to fulfill the deliverables. This is critical for the freelancer to assess profitability and avoid burnout. Consider:
- Time for initial client communication and requirements gathering
- Actual production/development/creation time
- Revision rounds typically needed at each tier level
- Final delivery and handoff time

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
      "featuresRationale": "Why these features are included at the starter level",
      "estimatedHours": 2,
      "estimatedHoursRationale": "Breakdown: 0.5hr client call, 1hr production, 0.5hr revisions and delivery"
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
      "featuresRationale": "Why these features make this tier the sweet spot",
      "estimatedHours": 5,
      "estimatedHoursRationale": "Breakdown: 1hr discovery, 3hr production, 1hr revisions and delivery"
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
      "featuresRationale": "Why these premium features command higher pricing",
      "estimatedHours": 10,
      "estimatedHoursRationale": "Breakdown: 1.5hr strategy/discovery, 6hr production, 2.5hr revisions, handoff, and support"
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
      "rationale": "High-margin: Requires minimal extra effort (under 30 mins) but offers significant client value"
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

EFFORT ANALYSIS GUIDELINES:
- estimatedHours must be realistic based on the deliverables - be honest, not optimistic
- Include ALL time: communication, production, revisions, delivery
- estimatedHoursRationale must show the breakdown (e.g., "1hr discovery + 3hr production + 1hr revisions")

HIGH-MARGIN ADD-ONS REQUIREMENT:
- Add-ons should be "High-Margin": items that offer high client value but require minimal fulfillment time (under 30 minutes of additional work)
- Examples: Priority support queue, expedited delivery, additional file formats, extended license
- Avoid low-margin add-ons that significantly increase work time

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

export async function generateGallerySuggestions(
  analysisData: AnalysisResult,
  projectIdea: string,
  projectTitle: string,
  projectCategory: string,
  pricingData?: {
    use3Tiers: boolean;
    tiers: {
      starter: { title: string; description: string; deliveryDays: number; price: number } | null;
      standard: { title: string; description: string; deliveryDays: number; price: number };
      advanced: { title: string; description: string; deliveryDays: number; price: number } | null;
    };
    serviceOptions?: { name: string; starterIncluded: boolean; standardIncluded: boolean; advancedIncluded: boolean }[];
    addOns?: { name: string; price: number }[];
  }
): Promise<GallerySuggestion> {
  const pricingSection = pricingData ? `
PRICING TIERS (User has set these exact prices - you MUST reference these specific prices in video script and content):
${pricingData.tiers.starter ? `- Starter: "${pricingData.tiers.starter.title}" - $${pricingData.tiers.starter.price} (${pricingData.tiers.starter.deliveryDays} days) - ${pricingData.tiers.starter.description}` : ""}
- Standard: "${pricingData.tiers.standard.title}" - $${pricingData.tiers.standard.price} (${pricingData.tiers.standard.deliveryDays} days) - ${pricingData.tiers.standard.description}
${pricingData.tiers.advanced ? `- Advanced: "${pricingData.tiers.advanced.title}" - $${pricingData.tiers.advanced.price} (${pricingData.tiers.advanced.deliveryDays} days) - ${pricingData.tiers.advanced.description}` : ""}
${pricingData.addOns && pricingData.addOns.length > 0 ? `
ADD-ONS AVAILABLE:
${pricingData.addOns.map(addon => `- ${addon.name}: +$${addon.price}`).join("\n")}` : ""}
` : "";

  const projectsSection = analysisData.projects && analysisData.projects.length > 0 
    ? `PAST PROJECT EXPERIENCE (Use these to inform document suggestions):
${analysisData.projects.map((p: { name: string; type: string }) => `- ${p.name} (${p.type})`).join("\n")}`
    : "";

  const prompt = `You are an expert Upwork project marketing strategist. Generate compelling gallery content for a freelancer's project listing.

PROJECT DETAILS:
- Title: ${projectTitle}
- Category: ${projectCategory}
- Description: ${projectIdea}
${pricingSection}
FREELANCER PROFILE:
- Archetype: ${analysisData.archetype}
- Core Skills: ${analysisData.skills.join(", ")}
- Proficiency Level: ${analysisData.proficiency}%
- Target Client: ${analysisData.clientGap}
- Strategic Position: ${analysisData.suggestedPivot}
- Missing Skill to Highlight: ${analysisData.missingSkill} - ${analysisData.missingSkillDesc}
- Recommended Keywords: ${analysisData.recommendedKeywords.join(", ")}
${projectsSection}

UPWORK COVER IMAGE BEST PRACTICES (Apply these to thumbnail prompt):
- Image size: 1000x750px (4:3 aspect ratio) for Upwork Project Catalog
- Show OUTCOMES and RESULTS, not just process (before/after comparisons, metrics, data visualizations)
- 3-second clarity rule: clients should understand the offer instantly while browsing
- Simple compositions beat cluttered collages
- High contrast and professional color schemes
- Include industry-specific signals (relevant tech logos, tool interfaces, device mockups)
- For design/dev: show Figma screens, code snippets, device mockups with actual deliverables
- For marketing: show GA4 dashboards, engagement graphs, ROI charts
- Avoid: generic stock photos, text-heavy designs, pixelated images, multiple unrelated services

VIDEO SCRIPT TONE OF VOICE REQUIREMENTS (CRITICAL - Apply these to all script sections):

Core Voice Formula: Systematic Expert + Trenches Experience + Direct Challenge + Transformative Enthusiasm

Voice Characteristics:
- Calm operator energy: "I've solved this problem before"
- No-BS directness: "Here's what actually works"
- Systematic confidence: "Let's build this step by step"
- Confident, conversational, and a little witty
- Enthusiasm without hype, authenticity over polish

Sentence Rhythm:
- Use short, punchy sentences when making key points
- Lead with outcomes, not process: "Save 10 hours a week" before "Here's how"
- Use conversation tone: Write like talking to a friend - casual but clear
- 3-Beat Structure: Hook/Problem (short) → Bridge/Insight (medium) → Resolution/Action (definitive)

Signature Language Patterns:
- "Here's the thing..." (transition into key points)
- "Let's be honest" (addressing uncomfortable truths)
- "Here's what actually works" (contrasting with failed approaches)
- "No BS" or "Real talk" (directness without profanity)
- Use active voice: "You get..." not "This is provided..."

What to ALWAYS do:
- Lead with client outcome, not process
- Challenge assumptions before presenting solutions
- Use "amplify your expertise" not "replace your work"
- Make it accessible - if a busy business owner can't understand it, simplify
- Ground claims in real examples and specific results
- End with clear next step

What to NEVER do:
- Use generic AI hype like "revolutionary" or "game-changing"
- Promise "set it and forget it" or magic solutions
- Sound like a corporate brochure or academic paper
- Use passive voice excessively
- Be arrogant - confident but not cocky
- Make unsubstantiated claims without evidence

Rhetorical Techniques:
- Use the Rule of Three: "Build systems. Scale authority. Reclaim time."
- Problem-solution contrasts: "You don't need more tools - you need one system that works"
- Before-after framing: "Yesterday: 15 tools, scattered results. Today: One system, systematic results"
- Strategic questions: "How many hours are you wasting on tasks that could be automated?"

Energy Progression for Video:
- Hook: High energy, scroll-stopping, challenge an assumption
- Introduction: Confident, establish credibility quickly, genuine
- Main Points: Systematic delivery, proof points, client outcomes
- Call to Action: Warm invitation, clear next step, empowering not pushy

Generate comprehensive gallery content in this JSON format:
{
  "thumbnailPrompt": {
    "prompt": "A detailed prompt for high-quality Imagen 3 / Nano Banana image generation. MUST follow the Outcome-First composition rule: Foreground should feature a tangible deliverable (dashboard mockup, report page, app screen, polished document) with 'floating UI elements' to show depth and professionalism. Use cinematic lighting and 8k resolution. Background MUST be clean, solid, or gradient (NEVER blurry or bokeh backgrounds - these underperform on Upwork's white interface). Include specific industry-relevant visual elements that signal expertise. The prompt should be 3-4 sentences ready for copy/paste into Gemini.",
    "styleNotes": "Style direction matching one of: 'Photorealistic Studio', '3D Isometric Tech', 'Abstract Data Flow', or 'Minimalist Brand' - choose based on the project category and target client",
    "colorPalette": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
    "compositionTips": "Specific layout guidance: primary deliverable in left two-thirds, floating accent elements in right third, clean background with subtle gradient. Ensure 3-second clarity - viewer should instantly understand what the freelancer delivers.",
    "visualStyle": "One of: photorealistic, 3d-isometric, abstract-data, minimalist-brand - based on project type"
  },
  "videoScript": {
    "hook": "Opening 5-10 second scroll-stopper. Challenge an assumption, state a bold truth, or ask a thought-provoking question. High energy, direct, NO hype words like 'revolutionary'. Example tone: 'Here's the thing most people get wrong about [topic]...'",
    "introduction": "15-second confident intro. Establish credibility fast with specific experience. Use 'I've solved this' energy. Be genuine, not salesy. Example: 'I'm [name], and after [specific experience], here's what actually works...'",
    "mainPoints": [
      {
        "point": "Outcome-focused selling point using 3-beat rhythm: Problem → Insight → Result. Lead with what client GETS, not what you DO. Use active voice.",
        "duration": "15 seconds",
        "visualSuggestion": "What to show on screen during this segment"
      },
      {
        "point": "Second selling point with proof/example. Use 'Here's the thing...' or 'Let's be honest...' transitions. Ground in real results.", 
        "duration": "15 seconds",
        "visualSuggestion": "Visual suggestion for this segment"
      },
      {
        "point": "Third selling point addressing objection or gap. Use problem-solution contrast. Be direct but not pushy.",
        "duration": "15 seconds",
        "visualSuggestion": "Visual suggestion for this segment"
      }
    ],
    "callToAction": "Final 10-second warm invitation. Clear next step, empowering tone. NOT pushy or desperate. Use 'Let's...' or 'Ready to...' framing. Example: 'Ready to [outcome]? Let's make it happen.'",
    "totalDuration": "60 seconds",
    "fullScript": "Complete word-for-word script combining all sections. MUST follow tone of voice: conversational yet confident, systematic expert energy, no corporate speak, no hype. Use short punchy sentences for emphasis, contractions for natural flow. Read aloud should feel like a trusted expert friend talking directly to you."
  },
  "sampleDocuments": [
    {
      "title": "SPECIFIC document title based on freelancer's skills and project type (NOT generic)",
      "description": "How this document relates to their actual expertise: ${analysisData.skills.slice(0,3).join(', ')}",
      "contentOutline": ["Section based on their archetype", "Section using their core skills", "Section targeting their ideal client"],
      "purpose": "Why this document helps showcase expertise specifically for a ${analysisData.archetype}",
      "dataEvidence": "Which skill or project from the profile this document is based on"
    },
    {
      "title": "Second document title tailored to their strategic position",
      "description": "How this addresses their target client: ${analysisData.clientGap}",
      "contentOutline": ["Relevant section 1", "Relevant section 2"],
      "purpose": "Why this is valuable for their specific positioning",
      "dataEvidence": "Which skill or project from the profile this document is based on"
    }
  ],
  "galleryStrategy": "A 2-3 sentence explanation of why this gallery content will attract ideal clients and how it showcases the freelancer's unique value"
}

IMPORTANT GUIDELINES:
- Thumbnail prompt should be specific and ready to paste into Gemini/Imagen 3
- THUMBNAIL QUALITY: MUST include "cinematic lighting", "8k resolution" in the prompt. NEVER suggest blurry/bokeh backgrounds - use clean, solid, or gradient backgrounds only
- OUTCOME-FIRST COMPOSITION: The foreground MUST feature a tangible deliverable (dashboard, report, app screen) with floating UI elements for depth
- visualStyle MUST be one of: "photorealistic", "3d-isometric", "abstract-data", "minimalist-brand"
- CRITICAL: If pricing tiers are provided above, the video script MUST mention the EXACT prices (e.g., "Starting at $${pricingData?.tiers?.starter?.price || pricingData?.tiers?.standard?.price || 'X'}"). Do NOT invent different prices.
- The video script should reference the actual tier names and prices the user selected
- Focus on client outcomes and benefits, not just features

VIDEO SCRIPT QUALITY REQUIREMENTS:
- MUST sound like a trusted expert friend, NOT a corporate brochure
- Use short sentences. Punchy delivery. Real talk.
- Include contractions (you're, here's, I've, let's) for natural flow
- The hook MUST challenge an assumption or state a surprising truth
- Each main point should use the 3-beat rhythm: Problem → Insight → Result
- NO generic hype words: "revolutionary," "game-changing," "cutting-edge," "seamless"
- Ground all claims in specific outcomes (save X hours, increase Y%, deliver in Z days)
- Call to action should be a warm invitation, not a pushy demand
- The fullScript MUST read like natural speech - test by reading aloud

CRITICAL SAMPLE DOCUMENT REQUIREMENTS (Evidence-Based Only):
- Each document suggestion MUST be derived from the freelancer's actual skills, projects, or archetype
- Do NOT suggest generic templates like "Project Requirements Template" - make them specific to THIS freelancer
- The "dataEvidence" field MUST reference which specific skill or past project from the profile justifies this document
- Document titles should reflect their archetype (${analysisData.archetype}) and target client (${analysisData.clientGap})
- Content outlines should incorporate their actual core skills: ${analysisData.skills.slice(0, 4).join(", ")}
- If they have past projects, base at least one document on demonstrating similar deliverables
- Suggest 2-3 sample documents that prove competence to their target clients

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

  const thumbnailPrompt = parsed.thumbnailPrompt || {};
  return {
    thumbnailPrompt: {
      prompt: thumbnailPrompt.prompt || "",
      styleNotes: thumbnailPrompt.styleNotes || "",
      colorPalette: thumbnailPrompt.colorPalette || [],
      compositionTips: thumbnailPrompt.compositionTips || "",
      visualStyle: thumbnailPrompt.visualStyle || "photorealistic",
    },
    videoScript: parsed.videoScript || {
      hook: "",
      introduction: "",
      mainPoints: [],
      callToAction: "",
      totalDuration: "",
      fullScript: "",
    },
    sampleDocuments: parsed.sampleDocuments || [],
    galleryStrategy: parsed.galleryStrategy || "",
  };
}

export async function generateProcessSuggestions(
  analysisData: AnalysisResult,
  projectIdea: string,
  projectTitle: string,
  projectCategory: string,
  pricingData?: {
    use3Tiers: boolean;
    tiers: {
      starter: { title: string; description: string; deliveryDays: number; price: number } | null;
      standard: { title: string; description: string; deliveryDays: number; price: number };
      advanced: { title: string; description: string; deliveryDays: number; price: number } | null;
    };
    serviceOptions?: { name: string; starterIncluded: boolean; standardIncluded: boolean; advancedIncluded: boolean }[];
    addOns?: { name: string; price: number }[];
  }
): Promise<ProcessSuggestion> {
  const pricingSection = pricingData ? `
PRICING TIERS (Context for deliverables and timelines):
${pricingData.tiers.starter ? `- Starter: "${pricingData.tiers.starter.title}" - $${pricingData.tiers.starter.price} (${pricingData.tiers.starter.deliveryDays} days) - ${pricingData.tiers.starter.description}` : ""}
- Standard: "${pricingData.tiers.standard.title}" - $${pricingData.tiers.standard.price} (${pricingData.tiers.standard.deliveryDays} days) - ${pricingData.tiers.standard.description}
${pricingData.tiers.advanced ? `- Advanced: "${pricingData.tiers.advanced.title}" - $${pricingData.tiers.advanced.price} (${pricingData.tiers.advanced.deliveryDays} days) - ${pricingData.tiers.advanced.description}` : ""}
${pricingData.serviceOptions && pricingData.serviceOptions.length > 0 ? `
SERVICE OPTIONS:
${pricingData.serviceOptions.map(opt => `- ${opt.name}`).join("\n")}` : ""}
${pricingData.addOns && pricingData.addOns.length > 0 ? `
ADD-ONS:
${pricingData.addOns.map(addon => `- ${addon.name}: +$${addon.price}`).join("\n")}` : ""}
` : "";

  const projectsSection = analysisData.projects && analysisData.projects.length > 0 
    ? `PAST PROJECT EXPERIENCE (Reference for typical workflow):
${analysisData.projects.map((p: { name: string; type: string }) => `- ${p.name} (${p.type})`).join("\n")}`
    : "";

  const prompt = `You are an expert Upwork project consultant. Generate requirements and process steps for a freelancer's project listing.

PROJECT DETAILS:
- Title: ${projectTitle}
- Category: ${projectCategory}
- Description: ${projectIdea}
${pricingSection}
FREELANCER PROFILE:
- Archetype: ${analysisData.archetype}
- Core Skills: ${analysisData.skills.join(", ")}
- Proficiency Level: ${analysisData.proficiency}%
- Target Client: ${analysisData.clientGap}
- Strategic Position: ${analysisData.suggestedPivot}
${projectsSection}

UPWORK REQUIREMENTS BEST PRACTICES:
- Requirements should ask for information the freelancer GENUINELY needs before starting work
- Be specific: "Brand guidelines document" is better than "Project details"
- Include file formats when relevant (PSD, PDF, CSV, etc.)
- Mark truly blocking items as "required" (client must answer before work begins)
- Keep requirements concise (max 350 characters each)
- Aim for 3-5 requirements that reduce back-and-forth communication
- Requirements should reflect the archetype's professional workflow

UPWORK PROCESS STEPS BEST PRACTICES:
- Steps should show clients exactly how the project will unfold
- Use action verbs: "Review," "Design," "Develop," "Test," "Deliver"
- Include milestones that give clients visibility into progress
- Match step complexity to the tier structure (more steps for advanced tiers)
- Step titles should be clear (max 75 characters)
- Descriptions are optional but helpful for complex steps
- Aim for 4-6 steps that build client confidence

Generate contextual requirements and steps in this JSON format:
{
  "requirements": [
    {
      "text": "Specific information or file the freelancer needs (max 350 chars)",
      "isRequired": true/false (true = client MUST provide before work starts),
      "rationale": "Why this information is needed for THIS specific project type"
    }
  ],
  "steps": [
    {
      "title": "Clear action-oriented step title (max 75 chars)",
      "description": "Optional detailed description of what happens in this step (max 250 chars)",
      "estimatedDuration": "Optional: e.g., '1-2 days' or 'Day 1-3'",
      "rationale": "Why this step matters for THIS project and client type"
    }
  ],
  "processStrategy": "2-3 sentence explanation of how this process flow builds client confidence and reduces friction",
  "clientCommunicationTip": "One specific tip for communicating with ${analysisData.clientGap} during this project type"
}

IMPORTANT GUIDELINES:
- Requirements must be SPECIFIC to this project type (${projectCategory}), not generic
- Steps must reflect the freelancer's actual expertise: ${analysisData.skills.slice(0, 3).join(", ")}
- Consider the target client type (${analysisData.clientGap}) when phrasing requirements
- If pricing tiers are provided, align step complexity to the standard tier deliverables
- Use professional but accessible language (avoid jargon unless it's industry-standard)
- Generate 3-5 requirements and 4-6 steps
- Each requirement and step must have a clear rationale showing contextual relevance

Return ONLY valid JSON, no additional text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
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
    requirements: parsed.requirements || [],
    steps: parsed.steps || [],
    processStrategy: parsed.processStrategy || "",
    clientCommunicationTip: parsed.clientCommunicationTip || "",
  };
}

export async function generateDescriptionSuggestions(
  analysisData: AnalysisResult,
  projectIdea: string,
  projectTitle: string,
  projectCategory: string,
  pricingData?: {
    use3Tiers: boolean;
    tiers: {
      starter: { title: string; description: string; deliveryDays: number; price: number } | null;
      standard: { title: string; description: string; deliveryDays: number; price: number };
      advanced: { title: string; description: string; deliveryDays: number; price: number } | null;
    };
    serviceOptions?: { name: string; starterIncluded: boolean; standardIncluded: boolean; advancedIncluded: boolean }[];
    addOns?: { name: string; price: number }[];
  },
  processData?: {
    requirements: { text: string; isRequired: boolean }[];
    steps: { title: string; description: string }[];
  }
): Promise<DescriptionSuggestion> {
  const descriptionResearchQuery = `What are successful project descriptions and FAQ strategies for Upwork freelancers offering: "${projectIdea.slice(0, 150)}"
  
  For a freelancer with:
  - Role: ${analysisData.archetype}
  - Skills: ${analysisData.skills.slice(0, 3).join(", ")}
  - Target client: ${analysisData.clientGap}
  
  Focus on:
  1. What messaging resonates with clients looking for this type of service?
  2. What common questions do clients ask before purchasing?
  3. What objections need to be addressed in the description?
  4. What makes project descriptions convert better?
  
  Provide specific examples and insights based on current Upwork trends.`;

  const descriptionInsights = await searchUpworkInsights(descriptionResearchQuery);

  if (!descriptionInsights || descriptionInsights.trim() === "") {
    throw new Error("Market Research Failed: Perplexity returned empty response. Cannot proceed without live data.");
  }

  const marketSection = `CURRENT MARKET RESEARCH:
${descriptionInsights}

`;

  const pricingSection = pricingData ? `
PRICING TIERS:
${pricingData.tiers.starter ? `- Starter: "${pricingData.tiers.starter.title}" - $${pricingData.tiers.starter.price}` : ""}
- Standard: "${pricingData.tiers.standard.title}" - $${pricingData.tiers.standard.price}
${pricingData.tiers.advanced ? `- Advanced: "${pricingData.tiers.advanced.title}" - $${pricingData.tiers.advanced.price}` : ""}
` : "";

  const processSection = processData ? `
PROJECT PROCESS:
Requirements: ${processData.requirements.map(r => r.text).join("; ")}
Steps: ${processData.steps.map(s => s.title).join(" → ")}
` : "";

  const projectsSection = analysisData.projects && analysisData.projects.length > 0 
    ? `PAST PROJECTS (Reference for credibility):
${analysisData.projects.map((p: { name: string; type: string }) => `- ${p.name} (${p.type})`).join("\n")}`
    : "";

  const prompt = `You are an expert Upwork project consultant. Based on market research, generate a compelling project summary and FAQs for a freelancer's project listing.

${marketSection}PROJECT DETAILS:
- Title: ${projectTitle}
- Category: ${projectCategory}
- Description: ${projectIdea}
${pricingSection}${processSection}
FREELANCER PROFILE:
- Archetype: ${analysisData.archetype}
- Core Skills: ${analysisData.skills.join(", ")}
- Proficiency Level: ${analysisData.proficiency}%
- Target Client: ${analysisData.clientGap}
- Strategic Position: ${analysisData.suggestedPivot}
- Signature Method: ${analysisData.signatureMechanism || "Not defined"}
${projectsSection}

UPWORK PROJECT SUMMARY BEST PRACTICES:
- Must be 120-1200 characters
- Open with what makes YOU and your project unique (not generic "I will...")
- Reference your specific experience level and approach
- Include your signature methodology if it fits naturally
- Address your target client's pain points directly
- End with what the client gets and why they should work with you
- Write in first person, professional but approachable tone
- Avoid buzzwords like "revolutionary," "game-changing," "cutting-edge"

FAQ BEST PRACTICES:
- Answer common client concerns BEFORE they ask
- Focus on questions that prevent back-and-forth messages
- Include: timeline expectations, revision process, communication style
- Questions should feel natural, not corporate
- Answers should be concise but thorough (50-200 characters)
- Generate 3-5 FAQs that save the back and forth

Generate in this JSON format:
{
  "projectSummary": "Compelling 120-1200 character project summary that sells the freelancer's unique value",
  "projectSummaryRationale": "Why this summary works for this specific archetype and target client",
  "projectSummarySource": "Based on [Specific Data Point] found in market research: cite the specific insight from CURRENT MARKET RESEARCH that informed this summary",
  "faqs": [
    {
      "question": "Natural question clients commonly ask about this type of project",
      "answer": "Concise, helpful answer (50-200 chars)",
      "rationale": "Why this FAQ addresses a key concern for ${analysisData.clientGap}",
      "rationaleSource": "Based on [Specific Data Point] found in market research: cite the specific insight that shows this is a common question"
    }
  ],
  "descriptionStrategy": "2-3 sentence explanation of how this description positions the freelancer effectively",
  "descriptionStrategySource": "Based on [Specific Data Point] found in market research: cite the specific insight that informed this strategy"
}

CRITICAL ZERO-HALLUCINATION REQUIREMENTS:
- EVERY suggestion MUST have a corresponding "Source" field citing specific data from CURRENT MARKET RESEARCH
- Do NOT invent or assume market data - only use what is provided in the research above
- Each "rationaleSource" and "Source" field MUST start with "Based on [Specific Data Point] found in market research:"
- If you cannot cite specific research data for a suggestion, do not include it

IMPORTANT GUIDELINES:
- Project summary must reflect the ${analysisData.archetype} archetype
- FAQs should anticipate concerns of ${analysisData.clientGap}
- Reference actual skills: ${analysisData.skills.slice(0, 3).join(", ")}
- If signature mechanism exists, weave it into the summary naturally
- Keep language confident but not arrogant
- Focus on outcomes and client benefits, not just features

Return ONLY valid JSON, no additional text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
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

  if (!parsed.projectSummarySource || !parsed.projectSummarySource.includes("Based on")) {
    throw new Error("Zero Hallucination Policy Violation: projectSummarySource must cite market research data");
  }
  
  if (!parsed.descriptionStrategySource || !parsed.descriptionStrategySource.includes("Based on")) {
    throw new Error("Zero Hallucination Policy Violation: descriptionStrategySource must cite market research data");
  }
  
  const faqs = parsed.faqs || [];
  for (const faq of faqs) {
    if (!faq.rationaleSource || !faq.rationaleSource.includes("Based on")) {
      throw new Error("Zero Hallucination Policy Violation: Each FAQ rationaleSource must cite market research data");
    }
  }

  return {
    projectSummary: parsed.projectSummary || "",
    projectSummaryRationale: parsed.projectSummaryRationale || "",
    projectSummarySource: parsed.projectSummarySource || "",
    faqs: faqs,
    descriptionStrategy: parsed.descriptionStrategy || "",
    descriptionStrategySource: parsed.descriptionStrategySource || "",
  };
}
