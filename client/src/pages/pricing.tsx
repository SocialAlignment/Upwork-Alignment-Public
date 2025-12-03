import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, DollarSign, TrendingUp, Lightbulb, Image, Sparkles, CheckCircle, AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/file-upload";
import { analyzePricingScreenshot } from "@/lib/api";

interface FieldRecommendation {
  label: string;
  value: string;
  rationale: string;
}

interface ExtractedTier {
  title: string;
  price: number;
  deliveryDays: number;
  description: string;
  estimatedHours: number;
}

interface PricingAnalysis {
  fields: FieldRecommendation[];
  estimatedProfitability: "High" | "Medium" | "Low";
  strategyNote: string;
  extractedPricing?: {
    starter?: ExtractedTier;
    standard?: ExtractedTier;
    advanced?: ExtractedTier;
  };
}

interface AnalysisData {
  archetype: string;
  proficiency: number;
  skills: string[];
  projects: { name: string; type: string }[];
  gapTitle: string;
  gapDescription: string;
  suggestedPivot: string;
  clientGap: string;
  recommendedKeywords: string[];
}

export default function Pricing() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [projectIdea, setProjectIdea] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [targetHourlyRate, setTargetHourlyRate] = useState(100);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("analysisData");
    const storedIdea = sessionStorage.getItem("projectIdea");
    const storedTitle = sessionStorage.getItem("selectedProjectTitle");
    const storedCategory = sessionStorage.getItem("selectedProjectCategory");
    const cachedPricingAnalysis = sessionStorage.getItem("pricingAnalysis");
    const storedRate = sessionStorage.getItem("targetHourlyRate");

    if (!storedAnalysis || !storedIdea) {
      setError("Missing profile data or project idea. Please start from the beginning.");
      return;
    }

    try {
      setAnalysisData(JSON.parse(storedAnalysis));
      setProjectIdea(storedIdea);
      setProjectTitle(storedTitle || "Your Project");
      setProjectCategory(storedCategory || "General");
      
      if (storedRate) {
        setTargetHourlyRate(parseFloat(storedRate) || 100);
      }

      if (cachedPricingAnalysis) {
        setAnalysis(JSON.parse(cachedPricingAnalysis));
      }
    } catch (e) {
      setError("Failed to load data. Please go back and try again.");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!screenshot) {
      toast({
        title: "Screenshot Required",
        description: "Please upload a screenshot of the Upwork pricing page first.",
        variant: "destructive",
      });
      return;
    }

    if (!analysisData) {
      toast({
        title: "Missing Profile Data",
        description: "Please complete the profile analysis first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyzePricingScreenshot({
        screenshot,
        analysisData,
        projectIdea,
        projectTitle,
        projectCategory,
        targetHourlyRate,
      });

      setAnalysis(result);
      sessionStorage.setItem("pricingAnalysis", JSON.stringify(result));
      sessionStorage.setItem("targetHourlyRate", targetHourlyRate.toString());
      
      toast({
        title: "Analysis Complete",
        description: "Your pricing recommendations are ready.",
      });
    } catch (e: any) {
      setError(e.message || "Failed to analyze screenshot. Please try again.");
      toast({
        title: "Analysis Failed",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, fieldLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldLabel);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied!",
        description: `${fieldLabel} value copied to clipboard.`,
      });
    } catch (e) {
      toast({
        title: "Copy Failed",
        description: "Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const getProfitabilityColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Low":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProfitabilityIcon = (level: string) => {
    switch (level) {
      case "High":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "Low":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (error && !screenshot) {
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
              onClick={() => navigate("/project-creation")}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Project
            </Button>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Visual Pricing Analysis
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                  Visual-First Pricing Strategy
                </h1>
                <p className="text-muted-foreground">
                  Upload a screenshot of your Upwork pricing page and let AI tell you exactly what to fill in each field.
                </p>
              </div>

              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">My Target Hourly Rate</h3>
                        <p className="text-xs text-muted-foreground">AI will calculate if prices meet your profitability goal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={targetHourlyRate}
                          onChange={(e) => setTargetHourlyRate(parseFloat(e.target.value) || 50)}
                          min={10}
                          max={1000}
                          step={10}
                          className="w-20 h-8 border-0 p-0 text-center font-semibold"
                          data-testid="input-target-hourly-rate"
                        />
                        <span className="text-sm text-muted-foreground">/hr</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-primary" />
                    Upload Pricing Page Screenshot
                  </CardTitle>
                  <CardDescription>
                    Take a screenshot of the Upwork pricing form for your project category. The AI will identify every field and tell you what to enter.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FileUpload
                    onFileSelect={setScreenshot}
                    selectedFile={screenshot}
                    accept="image/*"
                    label="Upload Screenshot"
                    description="Drag & drop your Upwork pricing page screenshot, or click to browse"
                  />

                  {screenshot && (
                    <div className="rounded-lg border overflow-hidden">
                      <img
                        src={URL.createObjectURL(screenshot)}
                        alt="Pricing page screenshot"
                        className="w-full h-auto max-h-96 object-contain bg-slate-100 dark:bg-slate-800"
                        data-testid="image-screenshot-preview"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={!screenshot || isLoading}
                    className="w-full gap-2"
                    size="lg"
                    data-testid="button-analyze"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing Screenshot...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Pricing Page
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {isLoading && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="font-medium mb-1">Analyzing Your Pricing Page...</p>
                        <p className="text-sm text-muted-foreground">
                          Identifying fields, calculating optimal values, and checking profitability
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            AI Field Recommendations
                          </CardTitle>
                          <CardDescription>
                            Copy these values to your Upwork pricing form
                          </CardDescription>
                        </div>
                        <Badge className={getProfitabilityColor(analysis.estimatedProfitability)}>
                          {getProfitabilityIcon(analysis.estimatedProfitability)}
                          <span className="ml-1">{analysis.estimatedProfitability} Profitability</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.fields.map((field, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 space-y-3"
                            data-testid={`field-recommendation-${idx}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Label className="font-semibold text-sm">{field.label}</Label>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <code className="px-3 py-2 rounded bg-white dark:bg-slate-900 border text-sm font-mono flex-1">
                                    {field.value}
                                  </code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(field.value, field.label)}
                                    className="shrink-0"
                                    data-testid={`button-copy-field-${idx}`}
                                  >
                                    {copiedField === field.label ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                              <span className="font-medium text-amber-700 dark:text-amber-400">Rationale: </span>
                              {field.rationale}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {analysis.strategyNote && (
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                          Pricing Strategy Note
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {analysis.strategyNote}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => navigate("/project-creation")} className="gap-2" data-testid="button-back-bottom">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-save-exit">
                    Save & Exit
                  </Button>
                </div>
                <Button 
                  className="gap-2"
                  disabled={!analysis}
                  onClick={() => {
                    sessionStorage.setItem("pricingAnalysis", JSON.stringify(analysis));
                    sessionStorage.setItem("targetHourlyRate", targetHourlyRate.toString());
                    
                    const ep = analysis?.extractedPricing;
                    const has3Tiers = !!(ep?.starter && ep?.advanced);
                    
                    const backwardCompatiblePricing = {
                      use3Tiers: has3Tiers,
                      targetHourlyRate,
                      tiers: {
                        starter: ep?.starter ? {
                          title: ep.starter.title,
                          description: ep.starter.description,
                          deliveryDays: ep.starter.deliveryDays,
                          price: ep.starter.price,
                          estimatedHours: ep.starter.estimatedHours,
                        } : null,
                        standard: ep?.standard ? {
                          title: ep.standard.title,
                          description: ep.standard.description,
                          deliveryDays: ep.standard.deliveryDays,
                          price: ep.standard.price,
                          estimatedHours: ep.standard.estimatedHours,
                        } : {
                          title: "Standard",
                          description: "Professional service",
                          deliveryDays: 5,
                          price: 200,
                          estimatedHours: 5,
                        },
                        advanced: ep?.advanced ? {
                          title: ep.advanced.title,
                          description: ep.advanced.description,
                          deliveryDays: ep.advanced.deliveryDays,
                          price: ep.advanced.price,
                          estimatedHours: ep.advanced.estimatedHours,
                        } : null,
                      },
                      serviceOptions: [],
                      addOns: [],
                      visualAnalysis: analysis,
                    };
                    sessionStorage.setItem("pricingSelections", JSON.stringify(backwardCompatiblePricing));
                    
                    navigate("/gallery");
                  }}
                  data-testid="button-continue"
                >
                  Continue to Gallery
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
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Project Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Project Title</Label>
                    <p className="font-medium text-sm">{projectTitle}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <p className="font-medium text-sm">{projectCategory}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Project Idea</Label>
                    <p className="text-sm text-muted-foreground line-clamp-3">{projectIdea}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="font-semibold text-amber-600">1.</span>
                      Go to your Upwork project and open the pricing form
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-amber-600">2.</span>
                      Take a screenshot of the entire pricing page
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-amber-600">3.</span>
                      Upload it here and click "Analyze"
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-amber-600">4.</span>
                      Copy each recommended value to Upwork
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
