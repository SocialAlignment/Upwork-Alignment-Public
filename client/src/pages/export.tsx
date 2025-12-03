import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, FileText, DollarSign, Image, ListChecks, MessageSquare, Sparkles, Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AnalysisResult {
  archetype: string;
  proficiency: number;
  skills: string[];
  projects: { name: string; type: string }[];
  recommendedKeywords: string[];
  signatureMechanism?: string;
}

interface PricingTier {
  title: string;
  description: string;
  deliveryDays: number;
  price: number;
  estimatedHours?: number;
}

interface PricingSelections {
  use3Tiers: boolean;
  targetHourlyRate?: number;
  tiers: {
    starter: PricingTier | null;
    standard: PricingTier;
    advanced: PricingTier | null;
  };
  serviceOptions: { name: string; starterIncluded: boolean; standardIncluded: boolean; advancedIncluded: boolean }[];
  addOns: { name: string; price: number }[];
}

interface GallerySuggestion {
  thumbnailPrompt: {
    prompt: string;
    styleNotes: string;
    colorPalette: string[];
    compositionTips: string;
    visualStyle?: string;
  };
  videoScript: {
    hook: string;
    introduction: string;
    mainPoints: { point: string; duration: string }[];
    callToAction: string;
    totalDuration: string;
    fullScript: string;
  };
  sampleDocuments: {
    title: string;
    description: string;
    fileType: string;
    dataEvidence: string;
  }[];
  galleryStrategy: string;
}

interface ProcessSelections {
  requirements: { text: string; isRequired: boolean }[];
  steps: { title: string; description: string }[];
}

interface DescriptionData {
  projectSummary: string;
  faqs: { question: string; answer: string; rationale?: string }[];
}

interface ExportData {
  projectTitle: string;
  projectCategory: string;
  projectIdea: string;
  searchTags: string[];
  pricing: PricingSelections | null;
  gallery: GallerySuggestion | null;
  process: ProcessSelections | null;
  description: DescriptionData | null;
  analysis: AnalysisResult | null;
}

export default function Export() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notionDialogOpen, setNotionDialogOpen] = useState(false);
  const [notionDatabaseId, setNotionDatabaseId] = useState(() => {
    return localStorage.getItem("notionDatabaseId") || "";
  });
  const [isExportingToNotion, setIsExportingToNotion] = useState(false);
  const [notionExportResult, setNotionExportResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);

  useEffect(() => {
    try {
      const analysisData = sessionStorage.getItem("analysisData");
      const projectIdea = sessionStorage.getItem("projectIdea");
      const projectTitle = sessionStorage.getItem("selectedProjectTitle");
      const projectCategory = sessionStorage.getItem("selectedProjectCategory");
      const searchTags = sessionStorage.getItem("selectedSearchTags");
      const pricingSelections = sessionStorage.getItem("pricingSelections");
      const gallerySuggestions = sessionStorage.getItem("gallerySuggestions");
      const processData = sessionStorage.getItem("processData") || sessionStorage.getItem("processSelections");
      const descriptionData = sessionStorage.getItem("descriptionData") || sessionStorage.getItem("descriptionSelections");

      if (!projectTitle || !projectIdea) {
        setError("Missing project data. Please complete the project creation flow first.");
        return;
      }

      setExportData({
        projectTitle: projectTitle || "Untitled Project",
        projectCategory: projectCategory || "General",
        projectIdea: projectIdea || "",
        searchTags: searchTags ? JSON.parse(searchTags) : [],
        pricing: pricingSelections ? JSON.parse(pricingSelections) : null,
        gallery: gallerySuggestions ? JSON.parse(gallerySuggestions) : null,
        process: processData ? JSON.parse(processData) : null,
        description: descriptionData ? JSON.parse(descriptionData) : null,
        analysis: analysisData ? JSON.parse(analysisData) : null,
      });
    } catch (e) {
      console.error("Error loading export data:", e);
      setError("Error loading project data. Please try again.");
    }
  }, []);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast({
        title: "Copied!",
        description: `${section} copied to clipboard`,
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try selecting and copying manually",
        variant: "destructive",
      });
    }
  };

  const exportToNotion = async () => {
    if (!notionDatabaseId.trim()) {
      toast({
        title: "Database ID Required",
        description: "Please enter your Notion Database ID",
        variant: "destructive",
      });
      return;
    }

    if (!exportData) {
      toast({
        title: "No Data",
        description: "No project data to export",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("notionDatabaseId", notionDatabaseId);
    setIsExportingToNotion(true);
    setNotionExportResult(null);

    try {
      const response = await fetch("/api/export-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          databaseId: notionDatabaseId.trim(),
          projectData: {
            title: exportData.projectTitle,
            category: exportData.projectCategory,
            pricing: exportData.pricing,
            gallery: exportData.gallery,
            process: exportData.process,
            description: exportData.description,
            profileContext: sessionStorage.getItem("profileContext") || undefined,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Export failed");
      }

      setNotionExportResult({ success: true, url: result.url });
      toast({
        title: "Exported to Notion!",
        description: "Your project has been created in Notion",
      });
    } catch (err: any) {
      setNotionExportResult({ success: false, error: err.message });
      toast({
        title: "Export Failed",
        description: err.message || "Could not export to Notion",
        variant: "destructive",
      });
    } finally {
      setIsExportingToNotion(false);
    }
  };

  const formatPricingForExport = (): string => {
    if (!exportData?.pricing) return "No pricing data available";
    
    const { pricing } = exportData;
    const targetRate = pricing.targetHourlyRate || 100;
    let output = "=== PRICING TIERS ===\n\n";
    output += `Target Hourly Rate: $${targetRate}/hr\n\n`;
    
    const formatTierWithProfitability = (tier: PricingTier, tierName: string) => {
      const hours = tier.estimatedHours || 0;
      const effectiveRate = hours > 0 ? tier.price / hours : 0;
      const isSustainable = hours > 0 && effectiveRate >= targetRate;
      
      let result = `${tierName.toUpperCase()} TIER:\n`;
      result += `  Title: ${tier.title}\n`;
      result += `  Description: ${tier.description}\n`;
      result += `  Price: $${tier.price}\n`;
      result += `  Delivery: ${tier.deliveryDays} days\n`;
      result += `  Estimated Hours: ${hours}h\n`;
      result += `  Effective Rate: $${effectiveRate.toFixed(0)}/hr\n`;
      result += `  Profitability: ${isSustainable ? "✓ SUSTAINABLE" : "⚠ LOW MARGIN"}\n\n`;
      return result;
    };
    
    if (pricing.use3Tiers && pricing.tiers.starter) {
      output += formatTierWithProfitability(pricing.tiers.starter, "Starter");
    }
    
    output += formatTierWithProfitability(pricing.tiers.standard, "Standard");
    
    if (pricing.use3Tiers && pricing.tiers.advanced) {
      output += formatTierWithProfitability(pricing.tiers.advanced, "Advanced");
    }
    
    if (pricing.serviceOptions && pricing.serviceOptions.length > 0) {
      output += `SERVICE OPTIONS:\n`;
      pricing.serviceOptions.forEach(opt => {
        const included = [];
        if (pricing.use3Tiers && opt.starterIncluded) included.push("Starter");
        if (opt.standardIncluded) included.push("Standard");
        if (pricing.use3Tiers && opt.advancedIncluded) included.push("Advanced");
        output += `  - ${opt.name} (included in: ${included.join(", ")})\n`;
      });
      output += "\n";
    }
    
    if (pricing.addOns && pricing.addOns.length > 0) {
      output += `ADD-ONS:\n`;
      pricing.addOns.forEach(addon => {
        output += `  - ${addon.name}: +$${addon.price}\n`;
      });
    }
    
    return output;
  };

  const formatGalleryForExport = (): string => {
    if (!exportData?.gallery) return "No gallery data available";
    
    const { gallery } = exportData;
    let output = "=== GALLERY CONTENT ===\n\n";
    
    output += `THUMBNAIL IMAGE PROMPT:\n`;
    output += `${gallery.thumbnailPrompt.prompt}\n\n`;
    output += `Style Notes: ${gallery.thumbnailPrompt.styleNotes}\n`;
    output += `Visual Style: ${gallery.thumbnailPrompt.visualStyle || "photorealistic"}\n`;
    output += `Color Palette: ${gallery.thumbnailPrompt.colorPalette.join(", ")}\n`;
    output += `Composition Tips: ${gallery.thumbnailPrompt.compositionTips}\n\n`;
    
    output += `VIDEO SCRIPT:\n`;
    output += `Hook: ${gallery.videoScript.hook}\n\n`;
    output += `Introduction: ${gallery.videoScript.introduction}\n\n`;
    output += `Main Points:\n`;
    gallery.videoScript.mainPoints.forEach((mp, idx) => {
      output += `  ${idx + 1}. ${mp.point} (${mp.duration})\n`;
    });
    output += `\nCall to Action: ${gallery.videoScript.callToAction}\n`;
    output += `Total Duration: ${gallery.videoScript.totalDuration}\n\n`;
    output += `FULL SCRIPT:\n${gallery.videoScript.fullScript}\n\n`;
    
    if (gallery.sampleDocuments && gallery.sampleDocuments.length > 0) {
      output += `SAMPLE DOCUMENTS:\n`;
      gallery.sampleDocuments.forEach((doc, idx) => {
        output += `  ${idx + 1}. ${doc.title} (${doc.fileType})\n`;
        output += `     ${doc.description}\n`;
        output += `     Evidence: ${doc.dataEvidence}\n\n`;
      });
    }
    
    output += `GALLERY STRATEGY:\n${gallery.galleryStrategy}\n`;
    
    return output;
  };

  const formatProcessForExport = (): string => {
    if (!exportData?.process) return "No process data available";
    
    const { process } = exportData;
    let output = "=== PROJECT REQUIREMENTS & STEPS ===\n\n";
    
    output += `REQUIREMENTS:\n`;
    process.requirements.forEach((req, idx) => {
      output += `  ${idx + 1}. ${req.text} ${req.isRequired ? "(Required)" : "(Optional)"}\n`;
    });
    output += "\n";
    
    output += `PROJECT STEPS:\n`;
    process.steps.forEach((step, idx) => {
      output += `  Step ${idx + 1}: ${step.title}\n`;
      output += `    ${step.description}\n\n`;
    });
    
    return output;
  };

  const formatDescriptionForExport = (): string => {
    if (!exportData?.description) return "No description data available";
    
    const { description } = exportData;
    let output = "=== PROJECT DESCRIPTION ===\n\n";
    
    output += `PROJECT SUMMARY:\n${description.projectSummary}\n\n`;
    
    if (description.faqs && description.faqs.length > 0) {
      output += `FREQUENTLY ASKED QUESTIONS:\n`;
      description.faqs.forEach((faq, idx) => {
        output += `  Q${idx + 1}: ${faq.question}\n`;
        output += `  A${idx + 1}: ${faq.answer}\n`;
        if (faq.rationale) {
          output += `  [Data Evidence: ${faq.rationale}]\n`;
        }
        output += "\n";
      });
    }
    
    return output;
  };

  const formatFullExport = (): string => {
    if (!exportData) return "";
    
    let output = "╔══════════════════════════════════════════════════════════════╗\n";
    output += "║           UPWORK PROJECT EXPORT - READY FOR CREATION          ║\n";
    output += "╚══════════════════════════════════════════════════════════════╝\n\n";
    
    output += `PROJECT TITLE: ${exportData.projectTitle}\n`;
    output += `CATEGORY: ${exportData.projectCategory}\n`;
    output += `SEARCH TAGS: ${exportData.searchTags.join(", ")}\n\n`;
    
    output += "═══════════════════════════════════════════════════════════════\n\n";
    
    output += formatDescriptionForExport() + "\n";
    output += "═══════════════════════════════════════════════════════════════\n\n";
    
    output += formatPricingForExport() + "\n";
    output += "═══════════════════════════════════════════════════════════════\n\n";
    
    output += formatProcessForExport() + "\n";
    output += "═══════════════════════════════════════════════════════════════\n\n";
    
    output += formatGalleryForExport() + "\n";
    output += "═══════════════════════════════════════════════════════════════\n\n";
    
    if (exportData.analysis) {
      output += "=== PROFILE CONTEXT (for reference) ===\n\n";
      output += `Archetype: ${exportData.analysis.archetype}\n`;
      output += `Proficiency Level: ${exportData.analysis.proficiency}/10\n`;
      output += `Key Skills: ${exportData.analysis.skills.slice(0, 10).join(", ")}\n`;
      output += `Recommended Keywords: ${exportData.analysis.recommendedKeywords.join(", ")}\n`;
      if (exportData.analysis.signatureMechanism) {
        output += `Signature Mechanism: ${exportData.analysis.signatureMechanism}\n`;
      }
    }
    
    output += "\n═══════════════════════════════════════════════════════════════\n";
    output += "Generated by Project Crafter | Ready for Perplexity Comet\n";
    
    return output;
  };

  const CopyButton = ({ section, content }: { section: string; content: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(content, section)}
      className="gap-2"
      data-testid={`button-copy-${section.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {copiedSection === section ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy
        </>
      )}
    </Button>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} data-testid="button-go-home">
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading export data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/description")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Step 7</Badge>
                <Badge variant="outline" className="text-xs">Final</Badge>
              </div>
              <h1 className="text-3xl font-bold font-serif mt-1">Export Project</h1>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">{exportData.projectTitle}</h2>
                  <p className="text-muted-foreground text-sm mb-2">{exportData.projectCategory}</p>
                  {exportData.searchTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exportData.searchTags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(formatFullExport(), "Full Export")}
                    className="gap-2"
                    data-testid="button-copy-all"
                  >
                    {copiedSection === "Full Export" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied All
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Copy Everything
                      </>
                    )}
                  </Button>
                  <Dialog open={notionDialogOpen} onOpenChange={setNotionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2" data-testid="button-export-notion">
                        <ExternalLink className="h-4 w-4" />
                        Export to Notion
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export to Notion</DialogTitle>
                        <DialogDescription>
                          Enter your Notion Database ID to create a new page with your project data.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="notion-database-id">Notion Database ID</Label>
                          <Input
                            id="notion-database-id"
                            placeholder="e.g., abc123def456..."
                            value={notionDatabaseId}
                            onChange={(e) => setNotionDatabaseId(e.target.value)}
                            data-testid="input-notion-database-id"
                          />
                          <p className="text-xs text-muted-foreground">
                            Find this in your Notion database URL after the workspace name and before the "?v=" parameter.
                          </p>
                        </div>
                        {notionExportResult && (
                          <div className={`p-3 rounded-lg ${notionExportResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {notionExportResult.success ? (
                              <div className="flex items-center justify-between">
                                <span>Successfully exported!</span>
                                {notionExportResult.url && (
                                  <a 
                                    href={notionExportResult.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="underline flex items-center gap-1"
                                  >
                                    Open in Notion <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span>{notionExportResult.error}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNotionDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={exportToNotion} 
                          disabled={isExportingToNotion}
                          data-testid="button-confirm-notion-export"
                        >
                          {isExportingToNotion ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Exporting...
                            </>
                          ) : (
                            "Export"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2" data-testid="tab-pricing">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2" data-testid="tab-gallery">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="process" className="gap-2" data-testid="tab-process">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Process</span>
            </TabsTrigger>
            <TabsTrigger value="description" className="gap-2" data-testid="tab-description">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Description</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Complete Export</CardTitle>
                  <CardDescription>All project data formatted for Perplexity Comet</CardDescription>
                </div>
                <CopyButton section="Full Export" content={formatFullExport()} />
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto" data-testid="text-full-export">
                  {formatFullExport()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Tiers
                  </CardTitle>
                  <CardDescription>Package structure and add-ons</CardDescription>
                </div>
                <CopyButton section="Pricing" content={formatPricingForExport()} />
              </CardHeader>
              <CardContent>
                {exportData.pricing ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span>Target Rate:</span>
                      <Badge variant="outline">${exportData.pricing.targetHourlyRate || 100}/hr</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {exportData.pricing.use3Tiers && exportData.pricing.tiers.starter && (() => {
                        const tier = exportData.pricing.tiers.starter;
                        const hours = tier.estimatedHours || 0;
                        const effectiveRate = hours > 0 ? tier.price / hours : 0;
                        const targetRate = exportData.pricing.targetHourlyRate || 100;
                        const isSustainable = hours > 0 && effectiveRate >= targetRate;
                        return (
                          <div className="p-4 border rounded-lg bg-muted/50">
                            <Badge className="mb-2">Starter</Badge>
                            <h4 className="font-semibold">{tier.title}</h4>
                            <p className="text-2xl font-bold text-primary">${tier.price}</p>
                            <p className="text-sm text-muted-foreground">{tier.deliveryDays} days | {hours}h estimated</p>
                            <p className="text-sm mt-2">{tier.description}</p>
                            <div className={`mt-3 p-2 rounded text-xs font-medium ${isSustainable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              ${effectiveRate.toFixed(0)}/hr - {isSustainable ? "Sustainable" : "Low Margin"}
                            </div>
                          </div>
                        );
                      })()}
                      {(() => {
                        const tier = exportData.pricing.tiers.standard;
                        const hours = tier.estimatedHours || 0;
                        const effectiveRate = hours > 0 ? tier.price / hours : 0;
                        const targetRate = exportData.pricing.targetHourlyRate || 100;
                        const isSustainable = hours > 0 && effectiveRate >= targetRate;
                        return (
                          <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                            <Badge variant="default" className="mb-2">Standard</Badge>
                            <h4 className="font-semibold">{tier.title}</h4>
                            <p className="text-2xl font-bold text-primary">${tier.price}</p>
                            <p className="text-sm text-muted-foreground">{tier.deliveryDays} days | {hours}h estimated</p>
                            <p className="text-sm mt-2">{tier.description}</p>
                            <div className={`mt-3 p-2 rounded text-xs font-medium ${isSustainable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              ${effectiveRate.toFixed(0)}/hr - {isSustainable ? "Sustainable" : "Low Margin"}
                            </div>
                          </div>
                        );
                      })()}
                      {exportData.pricing.use3Tiers && exportData.pricing.tiers.advanced && (() => {
                        const tier = exportData.pricing.tiers.advanced;
                        const hours = tier.estimatedHours || 0;
                        const effectiveRate = hours > 0 ? tier.price / hours : 0;
                        const targetRate = exportData.pricing.targetHourlyRate || 100;
                        const isSustainable = hours > 0 && effectiveRate >= targetRate;
                        return (
                          <div className="p-4 border rounded-lg bg-muted/50">
                            <Badge variant="secondary" className="mb-2">Advanced</Badge>
                            <h4 className="font-semibold">{tier.title}</h4>
                            <p className="text-2xl font-bold text-primary">${tier.price}</p>
                            <p className="text-sm text-muted-foreground">{tier.deliveryDays} days | {hours}h estimated</p>
                            <p className="text-sm mt-2">{tier.description}</p>
                            <div className={`mt-3 p-2 rounded text-xs font-medium ${isSustainable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              ${effectiveRate.toFixed(0)}/hr - {isSustainable ? "Sustainable" : "Low Margin"}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    {exportData.pricing.addOns && exportData.pricing.addOns.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Add-ons</h4>
                        <div className="flex flex-wrap gap-2">
                          {exportData.pricing.addOns.map((addon, idx) => (
                            <Badge key={idx} variant="outline">
                              {addon.name}: +${addon.price}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No pricing data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Gallery Content
                  </CardTitle>
                  <CardDescription>Thumbnail prompt, video script, and sample documents</CardDescription>
                </div>
                <CopyButton section="Gallery" content={formatGalleryForExport()} />
              </CardHeader>
              <CardContent>
                {exportData.gallery ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Thumbnail Prompt</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="mb-2">{exportData.gallery.thumbnailPrompt.prompt}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">Style: {exportData.gallery.thumbnailPrompt.visualStyle || "photorealistic"}</Badge>
                          {exportData.gallery.thumbnailPrompt.colorPalette.map((color, idx) => (
                            <Badge key={idx} variant="secondary">{color}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">Video Script</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Hook</p>
                          <p>{exportData.gallery.videoScript.hook}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Introduction</p>
                          <p>{exportData.gallery.videoScript.introduction}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Call to Action</p>
                          <p>{exportData.gallery.videoScript.callToAction}</p>
                        </div>
                      </div>
                    </div>
                    
                    {exportData.gallery.sampleDocuments && exportData.gallery.sampleDocuments.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Sample Documents</h4>
                          <div className="space-y-2">
                            {exportData.gallery.sampleDocuments.map((doc, idx) => (
                              <div key={idx} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{doc.title}</span>
                                  <Badge variant="outline">{doc.fileType}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No gallery data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Requirements & Steps
                  </CardTitle>
                  <CardDescription>Project requirements and workflow steps</CardDescription>
                </div>
                <CopyButton section="Process" content={formatProcessForExport()} />
              </CardHeader>
              <CardContent>
                {exportData.process ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Requirements</h4>
                      <div className="space-y-2">
                        {exportData.process.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                            <Badge variant={req.isRequired ? "default" : "outline"} className="mt-0.5 text-xs">
                              {req.isRequired ? "Required" : "Optional"}
                            </Badge>
                            <span className="text-sm">{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-3">Project Steps</h4>
                      <div className="space-y-3">
                        {exportData.process.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-4 p-3 border rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <h5 className="font-medium">{step.title}</h5>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No process data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Project Description
                  </CardTitle>
                  <CardDescription>Summary and frequently asked questions</CardDescription>
                </div>
                <CopyButton section="Description" content={formatDescriptionForExport()} />
              </CardHeader>
              <CardContent>
                {exportData.description ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Project Summary</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="whitespace-pre-wrap">{exportData.description.projectSummary}</p>
                      </div>
                    </div>
                    
                    {exportData.description.faqs && exportData.description.faqs.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">FAQs</h4>
                          <div className="space-y-3">
                            {exportData.description.faqs.map((faq, idx) => (
                              <div key={idx} className="p-4 border rounded-lg">
                                <p className="font-medium text-primary mb-2">Q: {faq.question}</p>
                                <p className="text-muted-foreground">A: {faq.answer}</p>
                                {faq.rationale && (
                                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t italic">
                                    Data Evidence: {faq.rationale}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No description data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-muted/50 rounded-lg border"
        >
          <div className="flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Ready to Create on Upwork</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Copy the full export above and paste it into Perplexity Comet. The agent will use this data to create your project on Upwork with all the optimized content.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
