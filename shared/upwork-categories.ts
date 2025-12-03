export interface CategoryLevel3 {
  hasLevel3: boolean;
  level3: string[];
}

export interface CategoryTaxonomy {
  [level1: string]: {
    [level2: string]: CategoryLevel3;
  };
}

export interface ProjectAttribute {
  name: string;
  label: string;
  required: boolean;
  maxItems: number;
  options: string[];
}

export interface CategoryAttributes {
  [categoryKey: string]: ProjectAttribute[];
}

export const categoryTaxonomy: CategoryTaxonomy = {
  "Admin & Customer Support": {
    "Data Entry": { hasLevel3: false, level3: [] },
    "Ecommerce Management": {
      hasLevel3: true,
      level3: [
        "Product Research",
        "Product Upload",
        "Store Management",
        "Supplier & Vendor Sourcing",
        "Other Ecommerce Management"
      ]
    },
    "File Conversion": {
      hasLevel3: true,
      level3: [
        "Convert to a Fillable Form",
        "Convert to an Ebook",
        "Convert to an Editable File",
        "Convert to Another File"
      ]
    },
    "Flyer Distribution": { hasLevel3: false, level3: [] },
    "Project Management": {
      hasLevel3: true,
      level3: [
        "Digital Marketing Projects",
        "General Project Services",
        "Graphics & Design Projects",
        "Music & Audio Projects",
        "Programming & Tech Projects",
        "Video & Animation Projects",
        "Writing & Translation Projects",
        "Other Project Management"
      ]
    },
    "Transcripts": { hasLevel3: false, level3: [] },
    "Virtual Assistant": {
      hasLevel3: true,
      level3: [
        "Administration",
        "Call Center & Calling",
        "Customer Support",
        "File Conversion",
        "Research",
        "Other Virtual Assistance"
      ]
    },
    "Other Admin & Customer Support": { hasLevel3: false, level3: [] }
  },
  "Consulting & HR": {
    "Business Consulting": { hasLevel3: false, level3: [] },
    "Business Plans": { hasLevel3: false, level3: [] },
    "Financial Consulting": {
      hasLevel3: true,
      level3: [
        "Accounting & Bookkeeping",
        "Analysis, Valuation & Optimization",
        "Financial Forecasting & Modeling",
        "Online Trading Lessons",
        "Personal Finance & Wealth Management",
        "Tax Consulting",
        "Other Financial Consulting"
      ]
    },
    "Human Resources": {
      hasLevel3: true,
      level3: [
        "Compensation & Benefits",
        "Employee Learning & Development",
        "HR Information Systems",
        "Organizational Development",
        "Performance Management",
        "Talent Acquisition & Recruitment",
        "Other Human Resources"
      ]
    },
    "Legal Consulting": { hasLevel3: false, level3: [] },
    "Other Consulting & HR": { hasLevel3: false, level3: [] }
  },
  "Design": {
    "Album Cover Design": { hasLevel3: false, level3: [] },
    "AR Filters & Lenses": { hasLevel3: false, level3: [] },
    "Architecture & Interior Design": {
      hasLevel3: true,
      level3: [
        "2D Architectural Drawings & Floor Plans",
        "3D Architectural Modeling & Rendering",
        "Diagrams & Mapping",
        "Planning & Design",
        "Virtual Staging",
        "Other Architecture & Interior Design"
      ]
    },
    "Banner Ads": { hasLevel3: false, level3: [] },
    "Book Design": {
      hasLevel3: true,
      level3: ["Book Cover Design", "Book Layout Design & Typesetting", "Other Book Design"]
    },
    "Brand Style Guides": { hasLevel3: false, level3: [] },
    "Brand Voice & Tone": { hasLevel3: false, level3: [] },
    "Branding Services": { hasLevel3: false, level3: [] },
    "Brochure Design": { hasLevel3: false, level3: [] },
    "Building Information Modeling": {
      hasLevel3: true,
      level3: [
        "3D BIM Modeling",
        "4D Construction Simulation",
        "BIM Family Creation",
        "BIM Training & Implementation",
        "Coordination & Clash Detection",
        "Other Building Information Modeling"
      ]
    },
    "Business Cards & Stationery Design": { hasLevel3: false, level3: [] },
    "Car Wraps": { hasLevel3: false, level3: [] },
    "Cartoons & Comics": { hasLevel3: false, level3: [] },
    "Catalog Design": { hasLevel3: false, level3: [] },
    "Character Modeling": { hasLevel3: false, level3: [] },
    "Fashion Design": {
      hasLevel3: true,
      level3: [
        "3D Fashion Design",
        "Fashion Illustration",
        "Full Fashion Design Process",
        "Pattern Making",
        "Technical Drawing & Tech Pack",
        "Other Fashion Design"
      ]
    },
    "Flyer Design": { hasLevel3: false, level3: [] },
    "Game Design": {
      hasLevel3: true,
      level3: [
        "Backgrounds & Environments",
        "Character Design",
        "Game UI & UX",
        "Props & Objects",
        "Other Game Design"
      ]
    },
    "Graphics for Streamers": { hasLevel3: false, level3: [] },
    "Illustration": { hasLevel3: false, level3: [] },
    "Industrial & Product Design": {
      hasLevel3: true,
      level3: [
        "2D Product Drawing",
        "3D Product Modeling & Rendering",
        "Concept Development",
        "Product Manufacturing",
        "Prototyping & 3D Printing",
        "Other Industrial & Product Design"
      ]
    },
    "Infographic Design": { hasLevel3: false, level3: [] },
    "Invitation Design": { hasLevel3: false, level3: [] },
    "Landscape Design": {
      hasLevel3: true,
      level3: [
        "2D Landscape Drawings & Site Plans",
        "3D Landscape Modeling & Rendering",
        "Landscape Planning & Design",
        "Other Landscape Design"
      ]
    },
    "Local Photography": { hasLevel3: false, level3: [] },
    "Logo Design": { hasLevel3: false, level3: [] },
    "Menu Design": { hasLevel3: false, level3: [] },
    "NFT Art": { hasLevel3: false, level3: [] },
    "Packaging Design": { hasLevel3: false, level3: [] },
    "Pattern Design": { hasLevel3: false, level3: [] },
    "Photoshop Editing": { hasLevel3: false, level3: [] },
    "Podcast Cover Art": { hasLevel3: false, level3: [] },
    "Portraits & Caricatures": { hasLevel3: false, level3: [] },
    "Postcard Design": { hasLevel3: false, level3: [] },
    "Poster Design": { hasLevel3: false, level3: [] },
    "Presentation Design": { hasLevel3: false, level3: [] },
    "Product Photography": { hasLevel3: false, level3: [] },
    "Resume Design": { hasLevel3: false, level3: [] },
    "Signage Design": { hasLevel3: false, level3: [] },
    "Social Media Design": {
      hasLevel3: true,
      level3: ["Headers & Covers", "Social Posts & Banners", "Thumbnails", "Other Social Media Design"]
    },
    "Storyboards": { hasLevel3: false, level3: [] },
    "T-Shirts & Merchandise Design": { hasLevel3: false, level3: [] },
    "Tattoo Design": { hasLevel3: false, level3: [] },
    "Trade Show Booth Design": { hasLevel3: false, level3: [] },
    "Vector Tracing": { hasLevel3: false, level3: [] },
    "Web & Mobile Design": {
      hasLevel3: true,
      level3: ["Graphic UI", "Icons & Buttons", "Wireframe UX", "Other Web & Mobile Design"]
    },
    "Other Design": { hasLevel3: false, level3: [] }
  },
  "Development & IT": {
    "AI & Machine Learning": {
      hasLevel3: true,
      level3: ["Chatbots", "Generative AI", "Machine Learning", "Other AI & Machine Learning"]
    },
    "Blockchain, NFT & Cryptocurrency": {
      hasLevel3: true,
      level3: [
        "Blockchain & NFT Development",
        "Crypto Coins & Tokens",
        "Crypto Wallet Development",
        "Other Blockchain, NFT & Cryptocurrency"
      ]
    },
    "Cybersecurity & Data Protection": {
      hasLevel3: true,
      level3: [
        "Assessments & Penetration Testing",
        "Cybersecurity & Data Compliance Services",
        "Cybersecurity Management",
        "Other Cybersecurity & Data Protection"
      ]
    },
    "Data Analysis & Reports": {
      hasLevel3: true,
      level3: [
        "Data Entry & Cleaning",
        "Data Mining & Web Scraping",
        "Data Modeling",
        "Data Visualization",
        "VBA & Macros",
        "Other Data Analysis & Reports"
      ]
    },
    "Databases": {
      hasLevel3: true,
      level3: ["Database Optimization & Design", "Database Queries", "Other Databases"]
    },
    "Desktop Apps": {
      hasLevel3: true,
      level3: ["Custom Desktop Apps", "Desktop App Improvements & Bug Fixes", "Other Desktop Apps"]
    },
    "Development for Streamers": {
      hasLevel3: true,
      level3: [
        "Stream Add-Ons & Customization",
        "Stream Setup & Installation",
        "Other Development for Streamers"
      ]
    },
    "Ecommerce Development": {
      hasLevel3: true,
      level3: [
        "Ecommerce Backup, Cloning & Migration",
        "Ecommerce Bug Fixes",
        "Ecommerce Customization",
        "Ecommerce Performance & Security",
        "Ecommerce Theme & Plugin Installation",
        "Full Ecommerce Website Creation",
        "Other Ecommerce Development"
      ]
    },
    "Game Development": {
      hasLevel3: true,
      level3: [
        "Full Game Creation",
        "Game Customization",
        "Game Prototyping",
        "Video Game Bug Fixes",
        "Other Game Development"
      ]
    },
    "Mobile Apps": {
      hasLevel3: true,
      level3: [
        "Custom Mobile Apps",
        "Mobile App Bug Fixes",
        "Mobile App Improvements",
        "Website to App Conversion",
        "Other Mobile Apps"
      ]
    },
    "Online Coding Lessons": { hasLevel3: false, level3: [] },
    "QA Testing": { hasLevel3: false, level3: [] },
    "Support & IT": { hasLevel3: false, level3: [] },
    "User Testing": { hasLevel3: false, level3: [] },
    "Web Programming": {
      hasLevel3: true,
      level3: [
        "Custom Website Programming",
        "Email Template Programming",
        "Landing Page Programming",
        "PSD File Conversion",
        "Scripting",
        "Web Application Programming",
        "Web Programming Bug Fixes",
        "Other Web Programming"
      ]
    },
    "Website Builders & CMS": {
      hasLevel3: true,
      level3: [
        "Full Website Creation",
        "Website & CMS Bug Fixes",
        "Website & CMS Customization",
        "Website Backup, Cloning & Migration",
        "Website Landing Page",
        "Website Performance & Security",
        "Website Theme & Plugin Installation",
        "Other Website Builders & CMS"
      ]
    },
    "WordPress": {
      hasLevel3: true,
      level3: [
        "Full WordPress Website Creation",
        "WordPress Backup, Cloning & Migration",
        "WordPress Bug Fixes",
        "WordPress Customization",
        "WordPress Installation & Theme Setup",
        "WordPress Landing Page",
        "WordPress Performance & SEO",
        "WordPress Security",
        "Other WordPress"
      ]
    },
    "Other Development & IT": { hasLevel3: false, level3: [] }
  },
  "Lifestyle": {
    "Arts & Crafts": { hasLevel3: false, level3: [] },
    "Career Counseling": {
      hasLevel3: true,
      level3: ["Career Coaching", "Interview Prep", "Job Application Assistance", "Other Career Counseling"]
    },
    "Cooking Lessons": { hasLevel3: false, level3: [] },
    "Craft Lessons": { hasLevel3: false, level3: [] },
    "Family & Genealogy": { hasLevel3: false, level3: [] },
    "Gaming": {
      hasLevel3: true,
      level3: ["Game Coaching", "Game Sessions", "Other Gaming"]
    },
    "Online Language Lessons": { hasLevel3: false, level3: [] },
    "Online Tutoring": { hasLevel3: false, level3: [] },
    "Personal Styling": { hasLevel3: false, level3: [] },
    "Personal Training": { hasLevel3: false, level3: [] },
    "Traveling": {
      hasLevel3: true,
      level3: ["Local Advisors", "Trip Plans", "Other Traveling"]
    },
    "Wellness": { hasLevel3: false, level3: [] },
    "Other Lifestyle": { hasLevel3: false, level3: [] }
  },
  "Marketing": {
    "Book & Ebook Marketing": { hasLevel3: false, level3: [] },
    "Community Management": {
      hasLevel3: true,
      level3: [
        "Growth, Partnership & Monetization",
        "Management & Engagement",
        "Planning, Strategy & Setup",
        "Sourcing & Recruitment",
        "Other Community Management"
      ]
    },
    "Content Marketing": {
      hasLevel3: true,
      level3: ["Content Creation", "Content Strategy & Research", "Guest Posting", "Other Content Marketing"]
    },
    "Crowdfunding": {
      hasLevel3: true,
      level3: ["Campaign Creation", "Campaign Marketing", "Other Crowdfunding"]
    },
    "Domain Research": { hasLevel3: false, level3: [] },
    "Ecommerce Marketing": {
      hasLevel3: true,
      level3: ["Product & Storefront SEO", "Product Listings", "Other Ecommerce Marketing"]
    },
    "Email Marketing": {
      hasLevel3: true,
      level3: ["Email Audience Development", "Email Platform Support", "Email Templates", "Other Email Marketing"]
    },
    "Influencer Marketing": {
      hasLevel3: true,
      level3: ["Shoutouts & Promotion", "Strategy & Research", "Other Influencer Marketing"]
    },
    "Lead Generation": { hasLevel3: false, level3: [] },
    "Local SEO": {
      hasLevel3: true,
      level3: ["Google My Business", "Local Citations & Directories", "Other Local SEO"]
    },
    "Market Research": { hasLevel3: false, level3: [] },
    "Marketing Strategy": { hasLevel3: false, level3: [] },
    "Mobile Marketing & Advertising": {
      hasLevel3: true,
      level3: ["App Store Optimization", "Mobile Ad Campaigns", "Other Mobile Marketing & Advertising"]
    },
    "Music Promotion": {
      hasLevel3: true,
      level3: [
        "Music Streaming Services",
        "Organic Music Promotion",
        "Paid Music Advertising",
        "Playlists & Placements",
        "Other Music Promotion"
      ]
    },
    "Podcast Marketing": {
      hasLevel3: true,
      level3: ["Advertising within Podcasts", "Podcast Promotion", "Other Podcast Marketing"]
    },
    "Public Relations": {
      hasLevel3: true,
      level3: [
        "Events, Conferences & Awards",
        "PR Strategy & Planning",
        "Press Release Distribution",
        "Other Public Relations"
      ]
    },
    "Search Engine Marketing": {
      hasLevel3: true,
      level3: [
        "Ad Review & Optimization",
        "Display Advertising Campaigns",
        "Product Ad Campaigns",
        "Remarketing",
        "Search Engine Marketing Management",
        "Other Search Engine Marketing"
      ]
    },
    "SEO": {
      hasLevel3: true,
      level3: [
        "Competitor Analysis",
        "Keyword Research",
        "Off-Page SEO",
        "On-Page SEO",
        "Technical SEO",
        "Voice Search SEO",
        "Other SEO"
      ]
    },
    "Social Media Advertising": {
      hasLevel3: true,
      level3: [
        "Social Media Ad Analytics & Tracking",
        "Social Media Ad Setup & Management",
        "Social Media Ad Strategy & Planning",
        "Other Social Media Advertising"
      ]
    },
    "Social Media Management": {
      hasLevel3: true,
      level3: [
        "Posting & Engagement",
        "Profile Setup & Integration",
        "Social Content Management",
        "Social Media Audience Research",
        "Social Media Management Analytics & Tracking",
        "Other Social Media Management"
      ]
    },
    "Surveys": {
      hasLevel3: true,
      level3: ["Survey Analysis", "Survey Creation", "Other Surveys"]
    },
    "Video Marketing": {
      hasLevel3: true,
      level3: [
        "Social Video Enhancements",
        "Video Ad Campaigns",
        "Video Marketing Audience Research",
        "Video Promotion & Distribution",
        "Video SEO",
        "Other Video Marketing"
      ]
    },
    "Web Analytics": {
      hasLevel3: true,
      level3: [
        "Conversion Rate Optimization",
        "Web Analytics Bug Fixes",
        "Web Analytics Setup",
        "Web Analytics Tracking & Reporting",
        "Other Web Analytics"
      ]
    },
    "Web Traffic Optimization": { hasLevel3: false, level3: [] },
    "Other Marketing": { hasLevel3: false, level3: [] }
  },
  "Video & Audio": {
    "3D Product Animation": { hasLevel3: false, level3: [] },
    "Animated GIFs": { hasLevel3: false, level3: [] },
    "Animated Whiteboard & Explainer Videos": { hasLevel3: false, level3: [] },
    "Animation for Kids": { hasLevel3: false, level3: [] },
    "Animation for Streamers": { hasLevel3: false, level3: [] },
    "App & Website Promo Videos": { hasLevel3: false, level3: [] },
    "Article to Video": { hasLevel3: false, level3: [] },
    "Audio Ads Production": { hasLevel3: false, level3: [] },
    "Audiobook Production": { hasLevel3: false, level3: [] },
    "Book Trailers": { hasLevel3: false, level3: [] },
    "Character Animation": { hasLevel3: false, level3: [] },
    "Dialogue Editing": {
      hasLevel3: true,
      level3: ["Phone Systems & IVR", "Radio Ads", "Video Games", "Videos & Films", "Other Dialogue Editing"]
    },
    "DJ Drops & Producer Tags": { hasLevel3: false, level3: [] },
    "Elearning Video Production": { hasLevel3: false, level3: [] },
    "Game Trailers": { hasLevel3: false, level3: [] },
    "Intro & Outro Animation": { hasLevel3: false, level3: [] },
    "Jingles & Intros": {
      hasLevel3: true,
      level3: ["Intro & Outro Audio", "Jingles & Sound Bites", "Other Jingles & Intros"]
    },
    "Live Action Explainers": { hasLevel3: false, level3: [] },
    "Logo Animation": { hasLevel3: false, level3: [] },
    "Lyric & Music Videos": { hasLevel3: false, level3: [] },
    "Mixing & Mastering": { hasLevel3: false, level3: [] },
    "Music Production": {
      hasLevel3: true,
      level3: ["Beat Making", "Full Song Production", "Instrumentals", "Other Music Production"]
    },
    "Music Videos": { hasLevel3: false, level3: [] },
    "Online Music Lessons": { hasLevel3: false, level3: [] },
    "Podcast Production": {
      hasLevel3: true,
      level3: ["Podcast Editing", "Podcast Recording", "Podcast Show Notes", "Other Podcast Production"]
    },
    "Producers & Composers": { hasLevel3: false, level3: [] },
    "Promo Video Production": { hasLevel3: false, level3: [] },
    "Short Video Ads": { hasLevel3: false, level3: [] },
    "Singers & Vocalists": { hasLevel3: false, level3: [] },
    "Social Media Videos": { hasLevel3: false, level3: [] },
    "Sound Design": { hasLevel3: false, level3: [] },
    "Subtitles & Captions": { hasLevel3: false, level3: [] },
    "Testimonial Videos": { hasLevel3: false, level3: [] },
    "Video Editing": { hasLevel3: false, level3: [] },
    "Visual Effects": { hasLevel3: false, level3: [] },
    "Voice Over": {
      hasLevel3: true,
      level3: [
        "Animation Voice Over",
        "Audiobook Voice Over",
        "Commercial Voice Over",
        "Elearning Voice Over",
        "Narration Voice Over",
        "Podcast Voice Over",
        "Video Game Voice Over",
        "Other Voice Over"
      ]
    },
    "Other Video & Audio": { hasLevel3: false, level3: [] }
  },
  "Writing & Translation": {
    "Ad Copy": { hasLevel3: false, level3: [] },
    "Articles & Blog Posts": { hasLevel3: false, level3: [] },
    "Beta Reading": { hasLevel3: false, level3: [] },
    "Book Editing": { hasLevel3: false, level3: [] },
    "Book Writing": { hasLevel3: false, level3: [] },
    "Brand Voice & Tone": { hasLevel3: false, level3: [] },
    "Case Studies": { hasLevel3: false, level3: [] },
    "Cover Letters": { hasLevel3: false, level3: [] },
    "Creative Writing": { hasLevel3: false, level3: [] },
    "Email Copy": { hasLevel3: false, level3: [] },
    "Grant Writing": { hasLevel3: false, level3: [] },
    "Podcast Writing": { hasLevel3: false, level3: [] },
    "Press Releases": { hasLevel3: false, level3: [] },
    "Product Descriptions": { hasLevel3: false, level3: [] },
    "Proofreading & Editing": { hasLevel3: false, level3: [] },
    "Proposals": { hasLevel3: false, level3: [] },
    "Resume Writing": { hasLevel3: false, level3: [] },
    "Sales Copy": { hasLevel3: false, level3: [] },
    "Script Writing": { hasLevel3: false, level3: [] },
    "Social Media Copy": { hasLevel3: false, level3: [] },
    "Speechwriting": { hasLevel3: false, level3: [] },
    "Technical Writing": { hasLevel3: false, level3: [] },
    "Translation": {
      hasLevel3: true,
      level3: ["General Translation", "Legal Translation", "Medical Translation", "Technical Translation", "Other Translation"]
    },
    "UX Writing": { hasLevel3: false, level3: [] },
    "Website Copy": { hasLevel3: false, level3: [] },
    "White Papers": { hasLevel3: false, level3: [] },
    "Other Writing & Translation": { hasLevel3: false, level3: [] }
  }
};

export const level1Categories = Object.keys(categoryTaxonomy);

export function getLevel2Categories(level1: string): string[] {
  if (!level1) return [];
  const level1Data = categoryTaxonomy[level1];
  if (!level1Data) return [];
  return Object.keys(level1Data);
}

export function getLevel3Categories(level1: string, level2: string): string[] {
  if (!level1 || !level2) return [];
  const level1Data = categoryTaxonomy[level1];
  if (!level1Data) return [];
  const level2Data = level1Data[level2];
  if (!level2Data) return [];
  return level2Data.hasLevel3 ? level2Data.level3 : [];
}

export function hasLevel3(level1: string, level2: string): boolean {
  if (!level1 || !level2) return false;
  const level1Data = categoryTaxonomy[level1];
  if (!level1Data) return false;
  const level2Data = level1Data[level2];
  if (!level2Data) return false;
  return level2Data.hasLevel3;
}

export const projectAttributes: CategoryAttributes = {
  "Admin & Customer Support|Data Entry": [
    {
      name: "dataEntryType",
      label: "Data Entry Type",
      required: true,
      maxItems: 6,
      options: ["Copy Paste", "Data Cleansing", "Document Conversion", "Error Detection", "Online Research", "Word Processing"]
    },
    {
      name: "dataEntryTool",
      label: "Data Entry Tool",
      required: false,
      maxItems: 8,
      options: ["CRM Software", "ERP Software", "Google Docs", "Google Sheets", "Medical Records Software", "Microsoft Excel", "Microsoft Office", "Microsoft Word"]
    }
  ],
  "Admin & Customer Support|Ecommerce Management|Product Research": [
    {
      name: "industry",
      label: "Industry",
      required: false,
      maxItems: 29,
      options: [
        "Arts", "Business", "Consumer Goods", "Cryptocurrency & Blockchain", "Cybersecurity",
        "Education", "Environmental", "Ecommerce", "Financial Services/Banking", "Games",
        "Government & Public Sector", "Health & Wellness", "Hospitality & Tourism", "Insurance",
        "Kids & Family", "Legal", "Logistics & Supply Chain Management", "Manufacturing",
        "Media & Entertainment", "Medical & Pharmaceutical", "Music", "News", "Nonprofit",
        "Real Estate", "Retail & Wholesale", "Society & Culture", "Sports & Recreation",
        "Technology & Internet", "Transportation & Automotive"
      ]
    },
    {
      name: "platform",
      label: "Platform",
      required: false,
      maxItems: 3,
      options: [
        "Alibaba", "Amazon", "Big Cartel", "BigCommerce", "eBay", "Ecwid", "Etsy",
        "Facebook Shops", "JD", "Magento", "OpenCart", "OsCommerce", "PrestaShop",
        "Shopify", "Shopware", "Squarespace", "Swell", "Volusion", "VTEX", "Webflow",
        "Wix", "WooCommerce", "Walmart", "Other"
      ]
    },
    {
      name: "language",
      label: "Language",
      required: false,
      maxItems: 1,
      options: [
        "English", "Albanian", "Arabic", "Bengali", "Bosnian", "Bulgarian", "Catalan",
        "Chinese (Simplified)", "Chinese (Traditional)", "Croatian", "Czech", "Danish",
        "Dari", "Dutch", "Estonian", "Filipino", "Finnish", "French", "Georgian",
        "German", "Greek", "Haitian Creole", "Hawaiian", "Hebrew", "Hindi", "Hungarian",
        "Icelandic", "Indonesian", "Irish", "Italian", "Jamaican Creole", "Japanese",
        "Kazakh", "Korean", "Latin", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian",
        "Malay", "Maltese", "Nepali", "Nigerian", "Norwegian", "Oriya", "Persian",
        "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Serbian", "Slovak",
        "Slovene", "Somali", "Spanish", "Swahili", "Swedish", "Tagalog", "Tamil",
        "Thai", "Turkish", "Urdu", "Vietnamese", "Welsh", "Other"
      ]
    }
  ]
};

export function getProjectAttributes(level1: string, level2: string, level3?: string): ProjectAttribute[] {
  const key = level3 ? `${level1}|${level2}|${level3}` : `${level1}|${level2}`;
  return projectAttributes[key] || [];
}
