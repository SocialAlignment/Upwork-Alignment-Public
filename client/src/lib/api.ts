export async function uploadProfile(data: {
  resume: File;
  upworkUrl: string;
  linkedinUrl: string;
}) {
  const formData = new FormData();
  formData.append("resume", data.resume);
  formData.append("upworkUrl", data.upworkUrl);
  formData.append("linkedinUrl", data.linkedinUrl);

  const response = await fetch("/api/upload-profile", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload profile");
  }

  return response.json();
}

export async function getAnalysis(profileId: string) {
  const response = await fetch(`/api/analysis/${profileId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch analysis");
  }

  return response.json();
}

export async function getUpworkCategories() {
  const response = await fetch("/api/upwork-knowledge/categories");
  return response.json();
}

export async function getUpworkAttributes() {
  const response = await fetch("/api/upwork-knowledge/attributes");
  return response.json();
}

export async function getTitleBestPractices() {
  const response = await fetch("/api/upwork-knowledge/title-best-practices");
  return response.json();
}

export async function getProjectSuggestions(analysisData: any, projectIdea: string) {
  const response = await fetch("/api/project-suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ analysisData, projectIdea }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get project suggestions");
  }

  return response.json();
}

export async function getPricingSuggestions(
  analysisData: any, 
  projectIdea: string, 
  projectTitle: string,
  projectCategory: string
) {
  const response = await fetch("/api/pricing-suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ analysisData, projectIdea, projectTitle, projectCategory }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get pricing suggestions");
  }

  return response.json();
}

export async function getGallerySuggestions(
  analysisData: any, 
  projectIdea: string, 
  projectTitle: string,
  projectCategory: string,
  pricingData?: any
) {
  const response = await fetch("/api/gallery-suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ analysisData, projectIdea, projectTitle, projectCategory, pricingData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get gallery suggestions");
  }

  return response.json();
}
