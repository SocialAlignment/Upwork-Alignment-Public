import { Client } from '@notionhq/client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  return accessToken;
}

async function getUncachableNotionClient() {
  const accessToken = await getAccessToken();
  return new Client({ auth: accessToken });
}

interface PricingTier {
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  estimatedHours?: number;
  features?: string[];
}

interface ProjectData {
  title: string;
  category?: string;
  pricing?: {
    use3Tiers?: boolean;
    targetHourlyRate?: number;
    tiers: {
      starter: PricingTier | null;
      standard: PricingTier;
      advanced: PricingTier | null;
    };
    serviceOptions?: { name: string; starterIncluded: boolean; standardIncluded: boolean; advancedIncluded: boolean }[];
    addOns?: { name: string; price: number }[];
  };
  gallery?: {
    videoScript?: {
      fullScript: string;
      hook: string;
      introduction: string;
      mainPoints: { point: string; duration: string }[];
      callToAction: string;
    };
    thumbnailPrompt?: {
      prompt: string;
      styleNotes: string;
      colorPalette?: string[];
      compositionTips?: string;
      visualStyle?: string;
    };
    sampleDocuments?: {
      title: string;
      description: string;
      dataEvidence?: string;
    }[];
    galleryStrategy?: string;
  };
  process?: {
    requirements: { text: string; isRequired: boolean }[];
    steps: { title: string; description: string }[];
  };
  description?: {
    projectSummary: string;
    faqs: { question: string; answer: string; rationale?: string }[];
  };
  profileContext?: string;
}

export async function createNotionPage(databaseId: string, projectData: ProjectData): Promise<{ pageId: string; url: string }> {
  const notion = await getUncachableNotionClient();
  
  const children: any[] = [];

  children.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: 'Project Overview' } }]
    }
  });

  if (projectData.description?.projectSummary) {
    children.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: projectData.description.projectSummary } }]
      }
    });
  }

  if (projectData.pricing) {
    children.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Pricing Tiers' } }]
      }
    });

    const targetRate = projectData.pricing.targetHourlyRate || 100;
    children.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: `Target Hourly Rate: $${targetRate}/hr` } }]
      }
    });

    const tiers = [
      { key: 'starter', data: projectData.pricing.tiers.starter },
      { key: 'standard', data: projectData.pricing.tiers.standard },
      { key: 'advanced', data: projectData.pricing.tiers.advanced }
    ].filter(t => t.data);

    for (const tier of tiers) {
      if (tier.data) {
        const hours = tier.data.estimatedHours || 0;
        const effectiveRate = hours > 0 ? tier.data.price / hours : 0;
        const isSustainable = hours > 0 && effectiveRate >= targetRate;
        const profitabilityLabel = hours > 0 
          ? `${isSustainable ? '✓ Sustainable' : '⚠ Low Margin'} ($${effectiveRate.toFixed(0)}/hr)`
          : '';

        children.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: `${tier.key.charAt(0).toUpperCase() + tier.key.slice(1)}: ${tier.data.title} - $${tier.data.price}` } }]
          }
        });
        
        let tierDetails = `${tier.data.description} • ${tier.data.deliveryDays} days delivery`;
        if (hours > 0) {
          tierDetails += ` • ${hours}h estimated`;
        }
        if (profitabilityLabel) {
          tierDetails += ` • ${profitabilityLabel}`;
        }
        
        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: tierDetails } }]
          }
        });
        
        if (tier.data.features && tier.data.features.length > 0) {
          for (const feature of tier.data.features) {
            children.push({
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: [{ type: 'text', text: { content: feature } }]
              }
            });
          }
        }
      }
    }

    if (projectData.pricing.addOns && projectData.pricing.addOns.length > 0) {
      children.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: 'Add-Ons' } }]
        }
      });
      for (const addon of projectData.pricing.addOns) {
        children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: `${addon.name}: +$${addon.price}` } }]
          }
        });
      }
    }
  }

  if (projectData.gallery?.videoScript) {
    children.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Video Script' } }]
      }
    });

    if (projectData.gallery.videoScript.fullScript) {
      const scriptChunks = splitTextIntoChunks(projectData.gallery.videoScript.fullScript, 2000);
      for (const chunk of scriptChunks) {
        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: chunk } }]
          }
        });
      }
    }
  }

  if (projectData.gallery?.thumbnailPrompt) {
    children.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Thumbnail Prompt' } }]
      }
    });
    children.push({
      object: 'block',
      type: 'code',
      code: {
        rich_text: [{ type: 'text', text: { content: projectData.gallery.thumbnailPrompt.prompt } }],
        language: 'plain text'
      }
    });
    
    if (projectData.gallery.thumbnailPrompt.visualStyle) {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: `Visual Style: ${projectData.gallery.thumbnailPrompt.visualStyle}` } }]
        }
      });
    }
  }

  if (projectData.gallery?.sampleDocuments && projectData.gallery.sampleDocuments.length > 0) {
    children.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Sample Documents' } }]
      }
    });
    for (const doc of projectData.gallery.sampleDocuments) {
      children.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: doc.title } }]
        }
      });
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: doc.description } }]
        }
      });
      if (doc.dataEvidence) {
        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ 
              type: 'text', 
              text: { content: `Data Evidence: ${doc.dataEvidence}` },
              annotations: { italic: true, color: 'gray' }
            }]
          }
        });
      }
    }
  }

  if (projectData.process) {
    children.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Requirements' } }]
      }
    });
    for (const req of projectData.process.requirements) {
      children.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: req.text } }],
          checked: false
        }
      });
    }

    children.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Process Steps' } }]
      }
    });
    for (const step of projectData.process.steps) {
      children.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [{ 
            type: 'text', 
            text: { content: `${step.title}${step.description ? `: ${step.description}` : ''}` } 
          }]
        }
      });
    }
  }

  if (projectData.description?.faqs && projectData.description.faqs.length > 0) {
    children.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'FAQs' } }]
      }
    });
    for (const faq of projectData.description.faqs) {
      children.push({
        object: 'block',
        type: 'toggle',
        toggle: {
          rich_text: [{ type: 'text', text: { content: faq.question } }],
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: faq.answer } }]
              }
            }
          ]
        }
      });
    }
  }

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      title: {
        title: [{ text: { content: projectData.title || 'Untitled Project' } }]
      }
    },
    children: children
  });

  return {
    pageId: response.id,
    url: (response as any).url || `https://notion.so/${response.id.replace(/-/g, '')}`
  };
}

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }
    
    let splitIndex = remaining.lastIndexOf('\n', maxLength);
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      splitIndex = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      splitIndex = maxLength;
    }
    
    chunks.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex).trimStart();
  }
  
  return chunks;
}
