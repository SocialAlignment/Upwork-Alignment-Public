import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, Plus, X, GripVertical, Info, Lightbulb, MessageSquare, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getProcessSuggestions } from "@/lib/api";
import type { ProcessSuggestion, ProjectRequirement, ProjectStep } from "@shared/schema";

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

interface EditableRequirement {
  id: string;
  text: string;
  isRequired: boolean;
  rationale: string;
}

interface EditableStep {
  id: string;
  title: string;
  description: string;
  estimatedDuration?: string;
  rationale: string;
}

export default function Process() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [projectIdea, setProjectIdea] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [pricingData, setPricingData] = useState<PricingSelections | null>(null);
  const [suggestions, setSuggestions] = useState<ProcessSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [requirements, setRequirements] = useState<EditableRequirement[]>([]);
  const [steps, setSteps] = useState<EditableStep[]>([]);
  const [showRationale, setShowRationale] = useState<string | null>(null);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("analysisData");
    const storedIdea = sessionStorage.getItem("projectIdea");
    const storedTitle = sessionStorage.getItem("selectedProjectTitle");
    const storedCategory = sessionStorage.getItem("selectedProjectCategory");
    const storedPricing = sessionStorage.getItem("pricingSelections");
    const cachedProcess = sessionStorage.getItem("processSuggestions");
    const savedSelections = sessionStorage.getItem("processSelections");
    
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
      
      if (savedSelections) {
        try {
          const saved = JSON.parse(savedSelections);
          setRequirements(saved.requirements.map((req: any, idx: number) => ({
            id: `req-${idx}`,
            text: req.text || "",
            isRequired: req.isRequired ?? false,
            rationale: req.rationale || "",
          })));
          setSteps(saved.steps.map((step: any, idx: number) => ({
            id: `step-${idx}`,
            title: step.title || "",
            description: step.description || "",
            estimatedDuration: step.estimatedDuration || "",
            rationale: step.rationale || "",
          })));
          if (cachedProcess) {
            setSuggestions(JSON.parse(cachedProcess));
          }
          setIsLoading(false);
          return;
        } catch (e) {
        }
      }
      
      if (cachedProcess) {
        try {
          const cached = JSON.parse(cachedProcess);
          setSuggestions(cached);
          initializeFromSuggestions(cached);
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

  const initializeFromSuggestions = (data: ProcessSuggestion) => {
    setRequirements(data.requirements.map((req, idx) => ({
      id: `req-${idx}`,
      text: req.text || "",
      isRequired: req.isRequired ?? false,
      rationale: req.rationale || "",
    })));
    setSteps(data.steps.map((step, idx) => ({
      id: `step-${idx}`,
      title: step.title || "",
      description: step.description || "",
      estimatedDuration: step.estimatedDuration || "",
      rationale: step.rationale || "",
    })));
  };

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
      const result = await getProcessSuggestions(data, idea, title, category, pricing);
      
      setSuggestions(result);
      initializeFromSuggestions(result);
      sessionStorage.setItem("processSuggestions", JSON.stringify(result));
    } catch (e: any) {
      setError(e.message || "Failed to generate process suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (analysisData && projectIdea) {
      sessionStorage.removeItem("processSuggestions");
      sessionStorage.removeItem("processSelections");
      fetchSuggestions(analysisData, projectIdea, projectTitle, projectCategory, pricingData);
    }
  };

  const addRequirement = () => {
    const newReqs = [...requirements, {
      id: `req-${requirements.length}`,
      text: "",
      isRequired: false,
      rationale: "Custom requirement added by user",
    }];
    setRequirements(newReqs);
    saveToSession(newReqs, steps);
  };

  const updateRequirement = (id: string, field: keyof EditableRequirement, value: string | boolean) => {
    const updated = requirements.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    );
    setRequirements(updated);
    saveToSession(updated, steps);
  };

  const removeRequirement = (id: string) => {
    if (requirements.length > 1) {
      const updated = requirements.filter(req => req.id !== id);
      setRequirements(updated);
      saveToSession(updated, steps);
    }
  };

  const addStep = () => {
    const newSteps = [...steps, {
      id: `step-${steps.length}`,
      title: "",
      description: "",
      rationale: "Custom step added by user",
    }];
    setSteps(newSteps);
    saveToSession(requirements, newSteps);
  };

  const updateStep = (id: string, field: keyof EditableStep, value: string) => {
    const updated = steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    );
    setSteps(updated);
    saveToSession(requirements, updated);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      const updated = steps.filter(step => step.id !== id);
      setSteps(updated);
      saveToSession(requirements, updated);
    }
  };

  const saveToSession = (reqs: EditableRequirement[], stps: EditableStep[]) => {
    const processData = {
      requirements: reqs.map(r => ({
        text: r.text,
        isRequired: r.isRequired,
        rationale: r.rationale,
      })),
      steps: stps.map(s => ({
        title: s.title,
        description: s.description,
        estimatedDuration: s.estimatedDuration,
        rationale: s.rationale,
      })),
    };
    sessionStorage.setItem("processSelections", JSON.stringify(processData));
  };

  const handleContinue = () => {
    const validRequirements = requirements.filter(r => r.text.trim().length >= 10);
    const validSteps = steps.filter(s => s.title.trim().length >= 3);

    if (validRequirements.length === 0) {
      toast({
        title: "Requirements needed",
        description: "Please add at least one requirement (minimum 10 characters)",
        variant: "destructive",
      });
      return;
    }

    if (validSteps.length === 0) {
      toast({
        title: "Steps needed",
        description: "Please add at least one step (minimum 3 characters for title)",
        variant: "destructive",
      });
      return;
    }

    const processData = {
      requirements: validRequirements.map(r => ({
        text: r.text,
        isRequired: r.isRequired,
      })),
      steps: validSteps.map(s => ({
        title: s.title,
        description: s.description,
      })),
    };

    sessionStorage.setItem("processData", JSON.stringify(processData));
    navigate("/description");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
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
              onClick={() => navigate("/gallery")}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Button>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <GripVertical className="w-3 h-3" />
                Process
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
                  Requirements and Steps
                </h1>
                <p className="text-muted-foreground">
                  Define what you need from clients and how you'll deliver their project.
                </p>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="font-medium mb-1">Generating Process Suggestions...</p>
                        <p className="text-sm text-muted-foreground">
                          Creating requirements and steps based on your project
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Info you'll need from the client
                      </CardTitle>
                      <CardDescription>
                        Ask for information or materials you need before starting work. The client can provide short answers or attach files. Add at least 1 requirement.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {requirements.map((req, index) => (
                          <motion.div
                            key={req.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border rounded-lg p-4 space-y-3 bg-white dark:bg-slate-900"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Requirement {index + 1}
                                  </span>
                                  {req.rationale && req.rationale !== "Custom requirement added by user" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => setShowRationale(showRationale === req.id ? null : req.id)}
                                      data-testid={`button-rationale-req-${index}`}
                                    >
                                      <Lightbulb className="w-3 h-3 mr-1" />
                                      Why this?
                                    </Button>
                                  )}
                                </div>
                                <Textarea
                                  value={req.text}
                                  onChange={(e) => updateRequirement(req.id, "text", e.target.value)}
                                  placeholder="What information or materials do you need from the client?"
                                  className="min-h-[60px]"
                                  maxLength={350}
                                  data-testid={`textarea-requirement-${index}`}
                                />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`required-${req.id}`}
                                      checked={req.isRequired}
                                      onCheckedChange={(checked) => 
                                        updateRequirement(req.id, "isRequired", checked === true)
                                      }
                                      data-testid={`checkbox-required-${index}`}
                                    />
                                    <Label 
                                      htmlFor={`required-${req.id}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      Client needs to answer before I can start working
                                    </Label>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {req.text.length}/350 characters (min. 10)
                                  </span>
                                </div>
                                
                                <AnimatePresence>
                                  {showRationale === req.id && req.rationale && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                    >
                                      <p className="text-sm text-amber-800 dark:text-amber-200">
                                        <Lightbulb className="w-4 h-4 inline mr-2" />
                                        {req.rationale}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRequirement(req.id)}
                                disabled={requirements.length <= 1}
                                className="text-muted-foreground hover:text-destructive shrink-0"
                                data-testid={`button-remove-req-${index}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <Button
                        variant="outline"
                        onClick={addRequirement}
                        className="w-full gap-2"
                        data-testid="button-add-requirement"
                      >
                        <Plus className="w-4 h-4" />
                        Add a requirement
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        Steps you'll take to get the project done
                      </CardTitle>
                      <CardDescription>
                        Share your step-by-step process so the client will know how you'll work on their project. Add at least 1 step.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {steps.map((step, index) => (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border rounded-lg p-4 space-y-3 bg-white dark:bg-slate-900"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Step {index + 1}
                                  </span>
                                  {step.rationale && step.rationale !== "Custom step added by user" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => setShowRationale(showRationale === step.id ? null : step.id)}
                                      data-testid={`button-rationale-step-${index}`}
                                    >
                                      <Lightbulb className="w-3 h-3 mr-1" />
                                      Why this?
                                    </Button>
                                  )}
                                </div>
                                
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">
                                    Step title
                                  </Label>
                                  <Input
                                    value={step.title}
                                    onChange={(e) => updateStep(step.id, "title", e.target.value)}
                                    placeholder="e.g., Review project requirements"
                                    maxLength={75}
                                    data-testid={`input-step-title-${index}`}
                                  />
                                  <span className="text-xs text-muted-foreground mt-1 block text-right">
                                    {step.title.length}/75 characters (min. 3)
                                  </span>
                                </div>

                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">
                                    Description (optional)
                                  </Label>
                                  <Textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(step.id, "description", e.target.value)}
                                    placeholder="What happens in this step?"
                                    className="min-h-[60px]"
                                    maxLength={250}
                                    data-testid={`textarea-step-desc-${index}`}
                                  />
                                  <span className="text-xs text-muted-foreground mt-1 block text-right">
                                    {step.description.length}/250 characters
                                  </span>
                                </div>

                                <AnimatePresence>
                                  {showRationale === step.id && step.rationale && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                    >
                                      <p className="text-sm text-amber-800 dark:text-amber-200">
                                        <Lightbulb className="w-4 h-4 inline mr-2" />
                                        {step.rationale}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStep(step.id)}
                                disabled={steps.length <= 1}
                                className="text-muted-foreground hover:text-destructive shrink-0"
                                data-testid={`button-remove-step-${index}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <Button
                        variant="outline"
                        onClick={addStep}
                        className="w-full gap-2"
                        data-testid="button-add-step"
                      >
                        <Plus className="w-4 h-4" />
                        Add a step
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/gallery")}
                      className="gap-2"
                      data-testid="button-back-bottom"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleContinue}
                      className="gap-2"
                      data-testid="button-continue"
                    >
                      Save & Continue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Tips if you're stuck
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Requirements</h4>
                  <p className="text-muted-foreground text-xs">
                    Pretend you're meeting with the client for the first time. What information or materials do you need them to send you?
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-1">Steps</h4>
                  <p className="text-muted-foreground text-xs">
                    Think of steps like your milestones or to-do list. What will you need to do to finish this project?
                  </p>
                </div>
                
                {suggestions?.clientCommunicationTip && (
                  <>
                    <Separator />
                    <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                            Communication Tip
                          </h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            {suggestions.clientCommunicationTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {suggestions?.processStrategy && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Strategy
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {suggestions.processStrategy}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project</span>
                    <span className="font-medium truncate max-w-[150px]" title={projectTitle}>
                      {projectTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium truncate max-w-[150px]" title={projectCategory}>
                      {projectCategory.split(" > ").pop()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requirements</span>
                    <Badge variant="secondary">
                      {requirements.filter(r => r.text.trim().length >= 10).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Steps</span>
                    <Badge variant="secondary">
                      {steps.filter(s => s.title.trim().length >= 3).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
