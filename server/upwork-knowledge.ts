export const UPWORK_CATEGORIES = [
  {
    id: "web-mobile-software-dev",
    name: "Web, Mobile & Software Dev",
    subcategories: [
      { id: "web-dev", name: "Web Development" },
      { id: "mobile-dev", name: "Mobile Development" },
      { id: "desktop-dev", name: "Desktop Development" },
      { id: "ecommerce-dev", name: "Ecommerce Development" },
      { id: "game-dev", name: "Game Development" },
      { id: "database-dev", name: "Database Development" },
      { id: "qa-testing", name: "QA & Testing" },
      { id: "dev-ops", name: "DevOps & Solution Architecture" },
      { id: "blockchain", name: "Blockchain, NFT & Cryptocurrency" },
    ]
  },
  {
    id: "design-creative",
    name: "Design & Creative",
    subcategories: [
      { id: "graphic-design", name: "Graphic Design" },
      { id: "ui-ux", name: "UX & UI Design" },
      { id: "illustration", name: "Illustration" },
      { id: "branding", name: "Brand Identity & Guidelines" },
      { id: "video-animation", name: "Video & Animation" },
      { id: "3d-modeling", name: "3D Modeling & CAD" },
    ]
  },
  {
    id: "writing",
    name: "Writing",
    subcategories: [
      { id: "content-writing", name: "Content Writing" },
      { id: "copywriting", name: "Copywriting" },
      { id: "technical-writing", name: "Technical Writing" },
      { id: "creative-writing", name: "Creative Writing" },
      { id: "editing", name: "Editing & Proofreading" },
    ]
  },
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    subcategories: [
      { id: "digital-marketing", name: "Digital Marketing" },
      { id: "social-media", name: "Social Media Marketing" },
      { id: "seo", name: "Search Engine Optimization (SEO)" },
      { id: "email-marketing", name: "Email & Marketing Automation" },
      { id: "marketing-strategy", name: "Marketing Strategy" },
    ]
  },
  {
    id: "admin-support",
    name: "Admin & Customer Support",
    subcategories: [
      { id: "virtual-assistant", name: "Virtual Assistant" },
      { id: "data-entry", name: "Data Entry & Transcription Services" },
      { id: "customer-service", name: "Customer Service & Support" },
      { id: "project-management", name: "Project Management" },
    ]
  },
  {
    id: "engineering-architecture",
    name: "Engineering & Architecture",
    subcategories: [
      { id: "structural-engineering", name: "Structural Engineering" },
      { id: "mechanical-engineering", name: "Mechanical Engineering" },
      { id: "civil-engineering", name: "Civil & Environmental Engineering" },
      { id: "architecture", name: "Architecture & Interior Design" },
    ]
  },
  {
    id: "data-science-analytics",
    name: "Data Science & Analytics",
    subcategories: [
      { id: "data-analysis", name: "Data Analysis & Testing" },
      { id: "data-mining", name: "Data Mining & Management" },
      { id: "machine-learning", name: "Machine Learning & AI" },
      { id: "data-visualization", name: "Data Visualization" },
    ]
  },
  {
    id: "accounting-consulting",
    name: "Accounting & Consulting",
    subcategories: [
      { id: "accounting", name: "Accounting & Bookkeeping" },
      { id: "financial-planning", name: "Financial Planning" },
      { id: "business-consulting", name: "Business & Management Consulting" },
      { id: "hr-consulting", name: "HR & Recruitment Consulting" },
    ]
  },
];

export const PROJECT_ATTRIBUTES = {
  experienceLevel: [
    { id: "entry", name: "Entry Level", description: "Looking for someone relatively new to this field" },
    { id: "intermediate", name: "Intermediate", description: "Looking for substantial experience in this field" },
    { id: "expert", name: "Expert", description: "Looking for comprehensive and deep expertise in this field" },
  ],
  projectLength: [
    { id: "less-than-1-month", name: "Less than 1 month", description: "Short-term, one-off project" },
    { id: "1-3-months", name: "1 to 3 months", description: "Medium-term project" },
    { id: "3-6-months", name: "3 to 6 months", description: "Long-term project" },
    { id: "more-than-6-months", name: "More than 6 months", description: "Ongoing engagement" },
  ],
  projectSize: [
    { id: "small", name: "Small", description: "Quick and straightforward tasks (< $1,000)" },
    { id: "medium", name: "Medium", description: "Well-defined projects ($1,000 - $5,000)" },
    { id: "large", name: "Large", description: "Larger and more complex projects (> $5,000)" },
  ],
  budgetType: [
    { id: "hourly", name: "Hourly Rate", description: "Pay by the hour" },
    { id: "fixed", name: "Fixed Price", description: "One-time project fee" },
  ],
  timeCommitment: [
    { id: "less-than-30", name: "Less than 30 hrs/week", description: "Part-time availability" },
    { id: "more-than-30", name: "More than 30 hrs/week", description: "Full-time availability" },
    { id: "as-needed", name: "As needed", description: "Flexible hours, project-based" },
  ],
};

export const TITLE_BEST_PRACTICES = {
  rules: [
    "Be specific and descriptive (avoid vague terms like 'Help Needed')",
    "Include the main technology or skill required",
    "Keep it concise (50-80 characters is ideal)",
    "Mention the deliverable or outcome when possible",
    "Use proper capitalization and professional language",
    "Avoid excessive punctuation or ALL CAPS",
  ],
  examples: {
    good: [
      "React Developer Needed for E-commerce Dashboard Redesign",
      "Expert WordPress Developer for Custom Plugin Development",
      "Senior Full-Stack Engineer for SaaS Platform (Node.js + React)",
      "UX/UI Designer for Mobile App Redesign (Figma Experience Required)",
      "Python Data Analyst for Customer Behavior Analysis",
    ],
    bad: [
      "URGENT!! Need help ASAP!!!",
      "Website needed",
      "Looking for developer",
      "Quick job for someone who knows code",
      "Help with my project",
    ],
  },
  templates: {
    development: "[Skill/Tech] Developer for [Outcome/Deliverable]",
    design: "[Design Type] Designer for [Project Type]",
    writing: "[Content Type] Writer for [Industry/Topic]",
    marketing: "[Marketing Channel] Specialist for [Campaign/Goal]",
    dataScience: "[Data Role] for [Analysis/Model Type]",
  },
};

export const DESCRIPTION_BEST_PRACTICES = {
  structure: [
    "Project Overview: What you're building and why",
    "Scope of Work: Specific tasks and deliverables",
    "Required Skills: Must-have technical skills",
    "Nice-to-Have: Preferred but optional qualifications",
    "Success Criteria: How you'll measure completion",
    "Timeline: Start date, milestones, deadline",
  ],
  tips: [
    "Use bullet points for easy scanning",
    "Be transparent about budget and timeline",
    "Mention your availability for communication",
    "Include examples or references if helpful",
    "Specify any tools, platforms, or integrations required",
    "Mention if this could lead to ongoing work",
  ],
};
