import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, Image, Video, FileText, Copy, Check, Sparkles, Palette, Clock, Info, Lightbulb, Upload, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getGallerySuggestions } from "@/lib/api";
import type { GallerySuggestion, VideoScript, SampleDocument } from "@shared/schema";

interface AnalysisResult {
  archetype: string;
  proficiency: number;
  skills: string[];
  projects: { name: string; type: string }[];
  gapTitle: string;
  gapDescription: string;
  suggestedPivot: string;
  missingSkillCluster: string;
  missingSkill: string;
  missingSkillDesc: string;
  clientGapType: string;
  clientGap: string;
  clientGapDesc: string;
  recommendedKeywords: string[];
}

interface PricingTier {
  title: string;
  description: string;
  deliveryDays: number;
  price: number;
}

interface PricingSelections {
  use3Tiers: boolean;
  tiers: {
    starter: PricingTier | null;
    standard: PricingTier;
    advanced: PricingTier | null;
  };
  serviceOptions: { name: string; starterIncluded: boolean; standardIncluded: boolean; advancedIncluded: boolean }[];
  addOns: { name: string; price: number }[];
}

export default function Gallery() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [projectIdea, setProjectIdea] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [pricingData, setPricingData] = useState<PricingSelections | null>(null);
  const [suggestions, setSuggestions] = useState<GallerySuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [heroImageDescription, setHeroImageDescription] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [compositionTips, setCompositionTips] = useState("");
  const [noTextOnImage, setNoTextOnImage] = useState(false);
  const [basePrompt, setBasePrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("analysisData");
    const storedIdea = sessionStorage.getItem("projectIdea");
    const storedTitle = sessionStorage.getItem("selectedProjectTitle");
    const storedCategory = sessionStorage.getItem("selectedProjectCategory");
    const storedPricing = sessionStorage.getItem("pricingSelections");
    const cachedGallery = sessionStorage.getItem("gallerySuggestions");
    
    if (!storedAnalysis || !storedIdea) {
      setError("Missing profile data or project idea. Please start from the beginning.");
      setIsLoading(false);
      return;
    }

    try {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      const parsedPricing = storedPricing ? JSON.parse(storedPricing) : null;
      setAnalysisData(parsedAnalysis);
      setProjectIdea(storedIdea);
      setProjectTitle(storedTitle || "Your Project");
      setProjectCategory(storedCategory || "General");
      setPricingData(parsedPricing);
      
      if (cachedGallery) {
        try {
          const cached = JSON.parse(cachedGallery);
          setSuggestions(cached);
          setIsLoading(false);
          return;
        } catch (e) {
        }
      }
      
      fetchSuggestions(parsedAnalysis, storedIdea, storedTitle || "Your Project", storedCategory || "General", parsedPricing);
    } catch (e) {
      setError("Failed to load data. Please go back and try again.");
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestions = async (
    data: AnalysisResult, 
    idea: string, 
    title: string,
    category: string,
    pricing: PricingSelections | null
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getGallerySuggestions(data, idea, title, category, pricing);
      
      setSuggestions(result);
      sessionStorage.setItem("gallerySuggestions", JSON.stringify(result));
    } catch (e: any) {
      setError(e.message || "Failed to generate gallery suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (analysisData && projectIdea) {
      sessionStorage.removeItem("gallerySuggestions");
      fetchSuggestions(analysisData, projectIdea, projectTitle, projectCategory, pricingData);
    }
  };

  useEffect(() => {
    if (suggestions?.thumbnailPrompt) {
      setBasePrompt(suggestions.thumbnailPrompt.prompt || "");
      setStyleNotes(suggestions.thumbnailPrompt.styleNotes || "");
      setColorPalette(suggestions.thumbnailPrompt.colorPalette || []);
      setCompositionTips(suggestions.thumbnailPrompt.compositionTips || "");
    }
  }, [suggestions]);

  const generateCombinedPrompt = () => {
    let prompt = basePrompt;
    
    if (heroImageDescription.trim()) {
      prompt = `Feature a professional photo/headshot of the freelancer: ${heroImageDescription.trim()}. ${prompt}`;
    }
    
    if (styleNotes.trim()) {
      prompt += ` Style: ${styleNotes.trim()}.`;
    }
    
    if (colorPalette.length > 0) {
      prompt += ` Color palette: ${colorPalette.join(", ")}.`;
    }
    
    if (compositionTips.trim()) {
      prompt += ` Composition: ${compositionTips.trim()}.`;
    }
    
    prompt += " Image dimensions: 1000x750px (4:3 aspect ratio, Upwork Project Catalog standard). High-resolution, professional quality.";
    
    if (noTextOnImage) {
      prompt += " IMPORTANT: Do NOT include any text, captions, titles, labels, or typography on the image. The image should be purely visual with no written elements.";
    }
    
    return prompt;
  };

  const addColor = (color: string) => {
    if (color && !colorPalette.includes(color)) {
      setColorPalette([...colorPalette, color]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColorPalette(colorPalette.filter(c => c !== colorToRemove));
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy manually",
        variant: "destructive",
      });
    }
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, fieldName)}
      className="gap-2"
      data-testid={`button-copy-${fieldName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {copiedField === fieldName ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy
        </>
      )}
    </Button>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => navigate("/")} data-testid="button-go-home">
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/pricing")}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Pricing
            </Button>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Gallery
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRegenerate}
                disabled={isLoading}
                className="gap-2"
                data-testid="button-regenerate"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                  AI-Generated Gallery Content
                </h1>
                <p className="text-muted-foreground">
                  Ready-to-use prompts and scripts for your project thumbnail, video, and sample documents.
                </p>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="font-medium mb-1">Generating Gallery Content...</p>
                        <p className="text-sm text-muted-foreground">
                          Creating thumbnail prompts, video scripts, and document ideas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="thumbnail" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="thumbnail" className="gap-2" data-testid="tab-thumbnail">
                      <Image className="w-4 h-4" />
                      Thumbnail
                    </TabsTrigger>
                    <TabsTrigger value="video" className="gap-2" data-testid="tab-video">
                      <Video className="w-4 h-4" />
                      Video Script
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2" data-testid="tab-documents">
                      <FileText className="w-4 h-4" />
                      Documents
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="thumbnail" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5 text-purple-600" />
                          Your Hero Image Description
                        </CardTitle>
                        <CardDescription>
                          Describe how you want to appear in the thumbnail (e.g., "Professional woman with brown hair, wearing a navy blazer, confident smile")
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Describe your appearance for the AI to include you in the thumbnail. Example: 'Professional man in his 30s with short dark hair, wearing a blue button-up shirt, friendly expression, clean-shaven'"
                          value={heroImageDescription}
                          onChange={(e) => setHeroImageDescription(e.target.value)}
                          className="min-h-[80px]"
                          data-testid="textarea-hero-description"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          Base Prompt
                        </CardTitle>
                        <CardDescription>
                          AI-generated prompt based on your project. Edit to customize.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={basePrompt}
                          onChange={(e) => setBasePrompt(e.target.value)}
                          className="min-h-[120px] font-mono text-sm"
                          data-testid="textarea-base-prompt"
                        />
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Palette className="w-4 h-4 text-purple-500" />
                            Style Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            placeholder="e.g., Modern minimalist, tech-forward professional"
                            value={styleNotes}
                            onChange={(e) => setStyleNotes(e.target.value)}
                            className="min-h-[60px]"
                            data-testid="textarea-style-notes"
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Color Palette</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {colorPalette.map((color, idx) => (
                              <div 
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 rounded border bg-white dark:bg-slate-800"
                              >
                                <div 
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-mono">{color}</span>
                                <button
                                  onClick={() => removeColor(color)}
                                  className="ml-1 text-muted-foreground hover:text-destructive"
                                  data-testid={`button-remove-color-${idx}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 h-8 p-1 cursor-pointer"
                              onChange={(e) => addColor(e.target.value)}
                              data-testid="input-color-picker"
                            />
                            <Input
                              placeholder="Add hex color (e.g., #1a237e)"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement;
                                  if (input.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                                    addColor(input.value);
                                    input.value = '';
                                  }
                                }
                              }}
                              data-testid="input-hex-color"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Composition Tips</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="e.g., Place subject on left third, flowing elements on right"
                          value={compositionTips}
                          onChange={(e) => setCompositionTips(e.target.value)}
                          className="min-h-[60px]"
                          data-testid="textarea-composition"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="noText"
                            checked={noTextOnImage}
                            onCheckedChange={(checked) => setNoTextOnImage(checked === true)}
                            data-testid="checkbox-no-text"
                          />
                          <Label htmlFor="noText" className="text-sm font-medium cursor-pointer">
                            No captions, no text on image
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          Check this to ensure the generated image contains no text or typography
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-primary/20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary" />
                              Complete Prompt (Ready to Copy)
                            </CardTitle>
                            <CardDescription>
                              This combines all your settings into one prompt for Gemini, DALL-E, or Midjourney
                            </CardDescription>
                          </div>
                          <CopyButton 
                            text={generateCombinedPrompt()} 
                            fieldName="Complete Prompt" 
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border">
                          <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap" data-testid="text-combined-prompt">
                            {generateCombinedPrompt()}
                          </p>
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs text-amber-800 dark:text-amber-200">
                            <strong>Upwork Best Practice:</strong> Images should be 1000×750px (4:3 ratio). Show outcomes/results, use simple compositions, and ensure 3-second clarity. High contrast and professional colors perform best.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Video className="w-5 h-5 text-red-600" />
                              Video Script
                            </CardTitle>
                            <CardDescription>
                              A complete script for your 60-90 second project video
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Clock className="w-3 h-3" />
                              {suggestions?.videoScript?.totalDuration || "60 seconds"}
                            </Badge>
                            <CopyButton 
                              text={suggestions?.videoScript?.fullScript || ""} 
                              fieldName="Full Script" 
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm text-red-700 dark:text-red-400">Hook (5-10 sec)</h4>
                              <CopyButton text={suggestions?.videoScript?.hook || ""} fieldName="Hook" />
                            </div>
                            <p className="text-sm">{suggestions?.videoScript?.hook || "No hook generated"}</p>
                          </div>

                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm text-blue-700 dark:text-blue-400">Introduction (15 sec)</h4>
                              <CopyButton text={suggestions?.videoScript?.introduction || ""} fieldName="Introduction" />
                            </div>
                            <p className="text-sm">{suggestions?.videoScript?.introduction || "No introduction generated"}</p>
                          </div>

                          {suggestions?.videoScript?.mainPoints?.map((point, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">Point {idx + 1} ({point.duration})</h4>
                              </div>
                              <p className="text-sm mb-2">{point.point}</p>
                              <p className="text-xs text-muted-foreground italic">
                                Visual: {point.visualSuggestion}
                              </p>
                            </div>
                          ))}

                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm text-green-700 dark:text-green-400">Call to Action (10 sec)</h4>
                              <CopyButton text={suggestions?.videoScript?.callToAction || ""} fieldName="Call to Action" />
                            </div>
                            <p className="text-sm">{suggestions?.videoScript?.callToAction || "No CTA generated"}</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Complete Script</h4>
                            <CopyButton text={suggestions?.videoScript?.fullScript || ""} fieldName="Complete Script" />
                          </div>
                          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border max-h-64 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {suggestions?.videoScript?.fullScript || "No complete script generated"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Sample Documents to Create
                        </CardTitle>
                        <CardDescription>
                          These documents will showcase your expertise to potential clients
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {suggestions?.sampleDocuments?.map((doc, idx) => (
                          <div 
                            key={idx}
                            className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 space-y-3"
                            data-testid={`card-document-${idx}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium" data-testid={`text-document-title-${idx}`}>{doc.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1" data-testid={`text-document-desc-${idx}`}>{doc.description}</p>
                              </div>
                              <Badge variant="outline" data-testid={`badge-document-${idx}`}>Document {idx + 1}</Badge>
                            </div>

                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Suggested Content:</h5>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {doc.contentOutline?.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Purpose:</span> {doc.purpose}
                              </p>
                            </div>
                          </div>
                        )) || (
                          <p className="text-sm text-muted-foreground">No document suggestions generated</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => navigate("/pricing")} className="gap-2" data-testid="button-back-bottom">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-save-exit">
                    Save & Exit
                  </Button>
                </div>
                <Button 
                  className="gap-2"
                  disabled={isLoading}
                  data-testid="button-continue"
                >
                  Continue to Process
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Gallery Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : suggestions?.galleryStrategy ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestions.galleryStrategy}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Strategy will appear once content is generated.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    Gallery Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p><strong>Images:</strong> Up to 20 images, JPG/PNG, max 10MB each</p>
                  <p><strong>Video:</strong> One MP4, under 100MB, 60-90 seconds ideal</p>
                  <p><strong>Documents:</strong> Up to 2 PDFs, max 2MB each</p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Use the thumbnail prompt with Gemini's image generation (nano banana pro) for best results. The prompt is optimized for professional, eye-catching visuals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
