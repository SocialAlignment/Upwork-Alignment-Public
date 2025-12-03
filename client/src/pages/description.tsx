import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, Plus, X, Info, Lightbulb, MessageSquare, FileText, HelpCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getDescriptionSuggestions } from "@/lib/api";
import type { DescriptionSuggestion, FAQ } from "@shared/schema";

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
  signatureMechanism?: string;
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

interface ProcessSelections {
  requirements: { text: string; isRequired: boolean }[];
  steps: { title: string; description: string }[];
}

interface EditableFAQ {
  id: string;
  question: string;
  answer: string;
  rationale: string;
}

export default function Description() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [projectIdea, setProjectIdea] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [pricingData, setPricingData] = useState<PricingSelections | null>(null);
  const [processData, setProcessData] = useState<ProcessSelections | null>(null);
  const [suggestions, setSuggestions] = useState<DescriptionSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [projectSummary, setProjectSummary] = useState("");
  const [faqs, setFaqs] = useState<EditableFAQ[]>([]);
  const [showRationale, setShowRationale] = useState<string | null>(null);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("analysisData");
    const storedIdea = sessionStorage.getItem("projectIdea");
    const storedTitle = sessionStorage.getItem("selectedProjectTitle");
    const storedCategory = sessionStorage.getItem("selectedProjectCategory");
    const storedPricing = sessionStorage.getItem("pricingSelections");
    const storedProcess = sessionStorage.getItem("processData") || sessionStorage.getItem("processSelections");
    const cachedDescription = sessionStorage.getItem("descriptionSuggestions");
    const savedSelections = sessionStorage.getItem("descriptionSelections");
    
    if (!storedAnalysis || !storedIdea) {
      setError("Missing profile data or project idea. Please start from the beginning.");
      setIsLoading(false);
      return;
    }

    try {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      const parsedPricing = storedPricing ? JSON.parse(storedPricing) : null;
      const parsedProcess = storedProcess ? JSON.parse(storedProcess) : null;
      setAnalysisData(parsedAnalysis);
      setProjectIdea(storedIdea);
      setProjectTitle(storedTitle || "Your Project");
      setProjectCategory(storedCategory || "General");
      setPricingData(parsedPricing);
      setProcessData(parsedProcess);
      
      if (savedSelections) {
        try {
          const saved = JSON.parse(savedSelections);
          setProjectSummary(saved.projectSummary || "");
          setFaqs(saved.faqs.map((faq: any, idx: number) => ({
            id: `faq-${idx}`,
            question: faq.question || "",
            answer: faq.answer || "",
            rationale: faq.rationale || "",
          })));
          if (cachedDescription) {
            setSuggestions(JSON.parse(cachedDescription));
          }
          setIsLoading(false);
        } catch (e) {
          console.error("Error parsing saved selections:", e);
        }
      }
      
      if (!savedSelections) {
        if (cachedDescription) {
          const cached = JSON.parse(cachedDescription);
          setSuggestions(cached);
          applySuggestions(cached);
          setIsLoading(false);
        } else {
          loadSuggestions(parsedAnalysis, storedIdea, storedTitle || "Your Project", storedCategory || "General", parsedPricing, parsedProcess);
        }
      }
    } catch (e) {
      console.error("Error parsing stored data:", e);
      setError("Error loading stored data. Please start from the beginning.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectSummary || faqs.length > 0) {
      const selections = {
        projectSummary,
        faqs: faqs.map(faq => ({
          question: faq.question,
          answer: faq.answer,
          rationale: faq.rationale,
        })),
      };
      sessionStorage.setItem("descriptionSelections", JSON.stringify(selections));
    }
  }, [projectSummary, faqs]);

  const loadSuggestions = async (
    analysis: AnalysisResult,
    idea: string,
    title: string,
    category: string,
    pricing: PricingSelections | null,
    process: ProcessSelections | null
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getDescriptionSuggestions(
        analysis,
        idea,
        title,
        category,
        pricing,
        process
      );
      setSuggestions(result);
      sessionStorage.setItem("descriptionSuggestions", JSON.stringify(result));
      applySuggestions(result);
    } catch (err: any) {
      console.error("Error loading description suggestions:", err);
      setError(err.message || "Failed to load description suggestions");
      toast({
        title: "Error",
        description: err.message || "Failed to load AI suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestions = (data: DescriptionSuggestion) => {
    setProjectSummary(data.projectSummary || "");
    setFaqs(data.faqs?.map((faq, idx) => ({
      id: `faq-${idx}`,
      question: faq.question,
      answer: faq.answer,
      rationale: faq.rationale,
    })) || []);
  };

  const handleRegenerate = async () => {
    if (!analysisData) return;
    
    sessionStorage.removeItem("descriptionSuggestions");
    sessionStorage.removeItem("descriptionSelections");
    
    await loadSuggestions(
      analysisData,
      projectIdea,
      projectTitle,
      projectCategory,
      pricingData,
      processData
    );
    
    toast({
      title: "Regenerated",
      description: "Description suggestions have been refreshed with new AI content.",
    });
  };

  const addFaq = () => {
    if (faqs.length >= 5) {
      toast({
        title: "Maximum FAQs reached",
        description: "You can add up to 5 FAQs.",
        variant: "destructive",
      });
      return;
    }
    
    const newFaq: EditableFAQ = {
      id: `faq-${Date.now()}`,
      question: "",
      answer: "",
      rationale: "",
    };
    setFaqs([...faqs, newFaq]);
  };

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
  };

  const handleContinue = () => {
    if (projectSummary.length < 120) {
      toast({
        title: "Summary too short",
        description: "Project summary must be at least 120 characters.",
        variant: "destructive",
      });
      return;
    }
    
    if (projectSummary.length > 1200) {
      toast({
        title: "Summary too long",
        description: "Project summary must be 1200 characters or less.",
        variant: "destructive",
      });
      return;
    }
    
    const descriptionData = {
      projectSummary,
      faqs: faqs.filter(faq => faq.question.trim() && faq.answer.trim()).map(faq => ({
        question: faq.question,
        answer: faq.answer,
        rationale: faq.rationale,
      })),
    };
    sessionStorage.setItem("descriptionData", JSON.stringify(descriptionData));
    
    navigate("/export");
  };
  
  const isValidSummary = projectSummary.length >= 120 && projectSummary.length <= 1200;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Info className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")} data-testid="button-start-over">
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/process")}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Process
            </Button>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <FileText className="w-3 h-3" />
                Description
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
                  Project Description
                </h1>
                <p className="text-muted-foreground">
                  Craft a compelling summary and answer common questions to reduce back-and-forth.
                </p>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="font-medium mb-1">Generating Description Content...</p>
                        <p className="text-sm text-muted-foreground">
                          AI is crafting a compelling summary and FAQs based on your profile
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Project Summary
                          </CardTitle>
                          <CardDescription>
                            Briefly explain what sets you and your project apart
                          </CardDescription>
                        </div>
                        {suggestions?.projectSummaryRationale && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                                <Lightbulb className="w-4 h-4" />
                                Why this?
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-sm">
                              <p>{suggestions.projectSummaryRationale}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={projectSummary}
                        onChange={(e) => setProjectSummary(e.target.value)}
                        placeholder="EXAMPLE: You will get a polished logo design that will bring your company to the next level. With over 5 years of experience in freelance and agency environments, I care deeply about helping startups tell their story through design. The work I deliver is 100% original and high quality."
                        className="min-h-[180px] resize-none"
                        data-testid="textarea-project-summary"
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className={`${projectSummary.length < 120 ? 'text-orange-500' : projectSummary.length > 1200 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {projectSummary.length}/1,200 characters (min. 120)
                        </span>
                        {projectSummary.length >= 120 && projectSummary.length <= 1200 && (
                          <Badge variant="secondary" className="text-green-600">
                            Valid length
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-purple-600" />
                            Frequently Asked Questions (optional)
                          </CardTitle>
                          <CardDescription>
                            Write answers to common questions your clients ask. Add up to 5 questions.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {faqs.map((faq, index) => (
                          <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-3">
                                <div>
                                  <Label className="text-sm font-medium">Question {index + 1}</Label>
                                  <Input
                                    value={faq.question}
                                    onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                                    placeholder="e.g., How many revisions are included?"
                                    className="mt-1"
                                    data-testid={`input-faq-question-${index}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Answer</Label>
                                  <Textarea
                                    value={faq.answer}
                                    onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                                    placeholder="Your answer here..."
                                    className="mt-1 min-h-[80px] resize-none"
                                    data-testid={`textarea-faq-answer-${index}`}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {faq.rationale && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-blue-600">
                                        <Lightbulb className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-xs">
                                      <p>{faq.rationale}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFaq(faq.id)}
                                  className="text-red-500 hover:text-red-600"
                                  data-testid={`button-remove-faq-${index}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {faqs.length < 5 && (
                        <Button
                          variant="outline"
                          onClick={addFaq}
                          className="gap-2 w-full"
                          data-testid="button-add-faq"
                        >
                          <Plus className="w-4 h-4" />
                          Add a question
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/process")}
                      data-testid="button-back-bottom"
                    >
                      Back
                    </Button>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Progress saved",
                            description: "Your description has been saved.",
                          });
                        }}
                        data-testid="button-save-exit"
                      >
                        Save & exit
                      </Button>
                      <Button
                        onClick={handleContinue}
                        className="gap-2"
                        disabled={!isValidSummary}
                        data-testid="button-save-continue"
                      >
                        Save & Continue
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <p className="text-muted-foreground">Add more details about your offering and why clients should work with you.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <p className="text-muted-foreground">Show potential clients the steps you take to complete your project.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <p className="text-muted-foreground">Address common client questions to save the back and forth.</p>
                  </div>
                </CardContent>
              </Card>

              {suggestions?.descriptionStrategy && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      AI Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {suggestions.descriptionStrategy}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Project Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Title</span>
                    <p className="text-sm font-medium truncate">{projectTitle}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Category</span>
                    <p className="text-sm font-medium truncate">{projectCategory}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Archetype</span>
                    <p className="text-sm font-medium truncate">{analysisData?.archetype}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
