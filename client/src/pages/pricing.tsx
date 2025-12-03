import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, DollarSign, Clock, Info, Check, Plus, X, Sparkles, TrendingUp, Lightbulb, AlertTriangle, CheckCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getPricingSuggestions } from "@/lib/api";
import type { PricingSuggestion, PricingTier, ServiceOption, AddOn } from "@shared/schema";

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

export default function Pricing() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [projectIdea, setProjectIdea] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [suggestions, setSuggestions] = useState<PricingSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [use3Tiers, setUse3Tiers] = useState(true);
  
  const [starterTitle, setStarterTitle] = useState("");
  const [starterDesc, setStarterDesc] = useState("");
  const [starterDays, setStarterDays] = useState(1);
  const [starterPrice, setStarterPrice] = useState(0);
  
  const [standardTitle, setStandardTitle] = useState("");
  const [standardDesc, setStandardDesc] = useState("");
  const [standardDays, setStandardDays] = useState(3);
  const [standardPrice, setStandardPrice] = useState(0);
  
  const [advancedTitle, setAdvancedTitle] = useState("");
  const [advancedDesc, setAdvancedDesc] = useState("");
  const [advancedDays, setAdvancedDays] = useState(7);
  const [advancedPrice, setAdvancedPrice] = useState(0);
  
  const [starterHours, setStarterHours] = useState(2);
  const [standardHours, setStandardHours] = useState(5);
  const [advancedHours, setAdvancedHours] = useState(10);
  const [targetHourlyRate, setTargetHourlyRate] = useState(100);
  
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [customAddOn, setCustomAddOn] = useState("");
  const [customAddOnPrice, setCustomAddOnPrice] = useState("");
  
  const [selectedRationale, setSelectedRationale] = useState<{
    field: string;
    tier?: string;
    rationale: string;
  } | null>(null);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("analysisData");
    const storedIdea = sessionStorage.getItem("projectIdea");
    const storedTitle = sessionStorage.getItem("selectedProjectTitle");
    const storedCategory = sessionStorage.getItem("selectedProjectCategory");
    const cachedPricing = sessionStorage.getItem("pricingSuggestions");
    
    if (!storedAnalysis || !storedIdea) {
      setError("Missing profile data or project idea. Please start from the beginning.");
      setIsLoading(false);
      return;
    }

    try {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      setAnalysisData(parsedAnalysis);
      setProjectIdea(storedIdea);
      setProjectTitle(storedTitle || "Your Project");
      setProjectCategory(storedCategory || "General");
      
      if (cachedPricing) {
        try {
          const cached = JSON.parse(cachedPricing);
          applySuggestions(cached);
          setSuggestions(cached);
          setIsLoading(false);
          return;
        } catch (e) {
        }
      }
      
      fetchSuggestions(parsedAnalysis, storedIdea, storedTitle || "Your Project", storedCategory || "General");
    } catch (e) {
      setError("Failed to load data. Please go back and try again.");
      setIsLoading(false);
    }
  }, []);

  const applySuggestions = (data: PricingSuggestion) => {
    if (data.tiers?.starter) {
      setStarterTitle(data.tiers.starter.title || "");
      setStarterDesc(data.tiers.starter.description || "");
      setStarterDays(data.tiers.starter.deliveryDays || 1);
      setStarterPrice(data.tiers.starter.price || 0);
      setStarterHours(data.tiers.starter.estimatedHours || 2);
    }
    if (data.tiers?.standard) {
      setStandardTitle(data.tiers.standard.title || "");
      setStandardDesc(data.tiers.standard.description || "");
      setStandardDays(data.tiers.standard.deliveryDays || 3);
      setStandardPrice(data.tiers.standard.price || 0);
      setStandardHours(data.tiers.standard.estimatedHours || 5);
    }
    if (data.tiers?.advanced) {
      setAdvancedTitle(data.tiers.advanced.title || "");
      setAdvancedDesc(data.tiers.advanced.description || "");
      setAdvancedDays(data.tiers.advanced.deliveryDays || 7);
      setAdvancedPrice(data.tiers.advanced.price || 0);
      setAdvancedHours(data.tiers.advanced.estimatedHours || 10);
    }
    if (data.serviceOptions) {
      setServiceOptions(data.serviceOptions);
    }
    if (data.addOns) {
      setAddOns(data.addOns);
    }
  };

  const fetchSuggestions = async (
    data: AnalysisResult, 
    idea: string, 
    title: string,
    category: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getPricingSuggestions(data, idea, title, category);
      
      setSuggestions(result);
      applySuggestions(result);
      
      sessionStorage.setItem("pricingSuggestions", JSON.stringify(result));
    } catch (e: any) {
      setError(e.message || "Failed to generate pricing suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (analysisData && projectIdea) {
      sessionStorage.removeItem("pricingSuggestions");
      fetchSuggestions(analysisData, projectIdea, projectTitle, projectCategory);
    }
  };

  const toggleServiceOption = (index: number, tier: 'starter' | 'standard' | 'advanced') => {
    setServiceOptions(prev => {
      const updated = [...prev];
      if (tier === 'starter') {
        updated[index] = { ...updated[index], starterIncluded: !updated[index].starterIncluded };
      } else if (tier === 'standard') {
        updated[index] = { ...updated[index], standardIncluded: !updated[index].standardIncluded };
      } else {
        updated[index] = { ...updated[index], advancedIncluded: !updated[index].advancedIncluded };
      }
      return updated;
    });
  };

  const handleAddCustomAddOn = () => {
    if (customAddOn.trim() && customAddOnPrice) {
      setAddOns(prev => [...prev, {
        name: customAddOn.trim(),
        price: parseFloat(customAddOnPrice) || 0,
        rationale: "Custom add-on created by you"
      }]);
      setCustomAddOn("");
      setCustomAddOnPrice("");
    }
  };

  const removeAddOn = (index: number) => {
    setAddOns(prev => prev.filter((_, i) => i !== index));
  };

  const showRationale = (field: string, rationale: string, tier?: string) => {
    setSelectedRationale({ field, tier, rationale });
  };

  const renderTierCard = (
    tierName: string,
    title: string,
    setTitle: (v: string) => void,
    desc: string,
    setDesc: (v: string) => void,
    days: number,
    setDays: (v: number) => void,
    price: number,
    setPrice: (v: number) => void,
    hours: number,
    setHours: (v: number) => void,
    tierData: PricingTier | undefined,
    isRecommended = false
  ) => {
    const effectiveRate = hours > 0 ? price / hours : 0;
    const isSustainable = hours > 0 && effectiveRate >= targetHourlyRate;
    
    return (
      <Card className={`relative ${isRecommended ? 'border-primary border-2 shadow-lg' : ''}`}>
        {isRecommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-center">{tierName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tier Title</Label>
              {tierData?.titleRationale && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => showRationale("Title", tierData.titleRationale, tierName)}
                  data-testid={`button-rationale-title-${tierName.toLowerCase()}`}
                >
                  <Info className="w-3 h-3 mr-1" />
                  Why?
                </Button>
              )}
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tier title..."
              maxLength={30}
              data-testid={`input-title-${tierName.toLowerCase()}`}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/30</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Description</Label>
              {tierData?.descriptionRationale && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => showRationale("Description", tierData.descriptionRationale, tierName)}
                  data-testid={`button-rationale-desc-${tierName.toLowerCase()}`}
                >
                  <Info className="w-3 h-3 mr-1" />
                  Why?
                </Button>
              )}
            </div>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's included..."
              maxLength={80}
              className="h-20 resize-none"
              data-testid={`input-desc-${tierName.toLowerCase()}`}
            />
            <p className="text-xs text-muted-foreground text-right">{desc.length}/80</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Delivery Days</Label>
              {tierData?.deliveryRationale && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => showRationale("Delivery Time", tierData.deliveryRationale, tierName)}
                  data-testid={`button-rationale-days-${tierName.toLowerCase()}`}
                >
                  <Info className="w-3 h-3 mr-1" />
                  Why?
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                min={1}
                max={365}
                className="w-24"
                data-testid={`input-days-${tierName.toLowerCase()}`}
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Estimated Hours</Label>
              {tierData?.estimatedHoursRationale && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => showRationale("Estimated Hours", tierData.estimatedHoursRationale, tierName)}
                  data-testid={`button-rationale-hours-${tierName.toLowerCase()}`}
                >
                  <Info className="w-3 h-3 mr-1" />
                  Why?
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 1)}
                min={0.5}
                step={0.5}
                className="w-24"
                data-testid={`input-hours-${tierName.toLowerCase()}`}
              />
              <span className="text-sm text-muted-foreground">hrs</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Price</Label>
              {tierData?.priceRationale && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => showRationale("Price", tierData.priceRationale, tierName)}
                  data-testid={`button-rationale-price-${tierName.toLowerCase()}`}
                >
                  <Info className="w-3 h-3 mr-1" />
                  Why?
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                min={0}
                step={5}
                className="w-32"
                data-testid={`input-price-${tierName.toLowerCase()}`}
              />
            </div>
          </div>

          <div className="pt-3 border-t space-y-3">
            <p className="text-2xl font-bold text-center">${price.toFixed(2)}</p>
            
            <div className={`rounded-lg p-3 ${isSustainable ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800'}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                {isSustainable ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400" data-testid={`badge-sustainable-${tierName.toLowerCase()}`}>Sustainable</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400" data-testid={`badge-low-margin-${tierName.toLowerCase()}`}>Low Margin</span>
                  </>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Effective Rate: <span className={`font-semibold ${isSustainable ? 'text-green-600' : 'text-orange-600'}`}>${effectiveRate.toFixed(0)}/hr</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
              onClick={() => navigate("/project-creation")}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Project
            </Button>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Price & Scope
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
                  Data-Driven Pricing Strategy
                </h1>
                <p className="text-muted-foreground">
                  AI-optimized pricing tiers based on your skills, market research, and competitive analysis.
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
                        <p className="text-xs text-muted-foreground">Used to calculate if each tier is sustainable for you</p>
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

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="font-medium mb-1">Analyzing Market Pricing Data...</p>
                        <p className="text-sm text-muted-foreground">
                          Researching competitive rates and optimal pricing strategies
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
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Create Pricing Tiers
                          </CardTitle>
                          <CardDescription>
                            Customize your project with 1 or 3 pricing tiers
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="tier-toggle" className="text-sm">3 Tiers</Label>
                          <Switch 
                            id="tier-toggle"
                            checked={use3Tiers}
                            onCheckedChange={setUse3Tiers}
                            data-testid="switch-3-tiers"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`grid gap-4 ${use3Tiers ? 'grid-cols-1 md:grid-cols-3' : 'max-w-md mx-auto'}`}>
                        {use3Tiers ? (
                          <>
                            {renderTierCard(
                              "Starter",
                              starterTitle, setStarterTitle,
                              starterDesc, setStarterDesc,
                              starterDays, setStarterDays,
                              starterPrice, setStarterPrice,
                              starterHours, setStarterHours,
                              suggestions?.tiers?.starter
                            )}
                            {renderTierCard(
                              "Standard",
                              standardTitle, setStandardTitle,
                              standardDesc, setStandardDesc,
                              standardDays, setStandardDays,
                              standardPrice, setStandardPrice,
                              standardHours, setStandardHours,
                              suggestions?.tiers?.standard,
                              true
                            )}
                            {renderTierCard(
                              "Advanced",
                              advancedTitle, setAdvancedTitle,
                              advancedDesc, setAdvancedDesc,
                              advancedDays, setAdvancedDays,
                              advancedPrice, setAdvancedPrice,
                              advancedHours, setAdvancedHours,
                              suggestions?.tiers?.advanced
                            )}
                          </>
                        ) : (
                          renderTierCard(
                            "Standard",
                            standardTitle, setStandardTitle,
                            standardDesc, setStandardDesc,
                            standardDays, setStandardDays,
                            standardPrice, setStandardPrice,
                            standardHours, setStandardHours,
                            suggestions?.tiers?.standard
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {use3Tiers && serviceOptions.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-blue-600" />
                          Service Tier Options
                        </CardTitle>
                        <CardDescription>
                          Define what's included in each tier
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-3 font-medium">Feature</th>
                                <th className="text-center py-2 px-3 font-medium">Starter</th>
                                <th className="text-center py-2 px-3 font-medium">Standard</th>
                                <th className="text-center py-2 px-3 font-medium">Advanced</th>
                                <th className="text-left py-2 px-3 font-medium w-12"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {serviceOptions.map((option, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="py-3 px-3">
                                    <span className="font-medium">{option.name}</span>
                                  </td>
                                  <td className="text-center py-3 px-3">
                                    <Checkbox 
                                      checked={option.starterIncluded}
                                      onCheckedChange={() => toggleServiceOption(idx, 'starter')}
                                      data-testid={`checkbox-${option.name.toLowerCase().replace(/\s+/g, '-')}-starter`}
                                    />
                                  </td>
                                  <td className="text-center py-3 px-3">
                                    <Checkbox 
                                      checked={option.standardIncluded}
                                      onCheckedChange={() => toggleServiceOption(idx, 'standard')}
                                      data-testid={`checkbox-${option.name.toLowerCase().replace(/\s+/g, '-')}-standard`}
                                    />
                                  </td>
                                  <td className="text-center py-3 px-3">
                                    <Checkbox 
                                      checked={option.advancedIncluded}
                                      onCheckedChange={() => toggleServiceOption(idx, 'advanced')}
                                      data-testid={`checkbox-${option.name.toLowerCase().replace(/\s+/g, '-')}-advanced`}
                                    />
                                  </td>
                                  <td className="py-3 px-3">
                                    {option.rationale && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-2"
                                        onClick={() => showRationale(option.name, option.rationale)}
                                        data-testid={`button-rationale-${option.name.toLowerCase().replace(/\s+/g, '-')}`}
                                      >
                                        <Info className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-purple-600" />
                        Choose Add-ons (Optional)
                      </CardTitle>
                      <CardDescription>
                        Extra services clients can purchase
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addOns.map((addOn, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox defaultChecked data-testid={`checkbox-addon-${idx}`} />
                              <div>
                                <p className="font-medium text-sm">{addOn.name}</p>
                                <p className="text-xs text-muted-foreground">+${addOn.price}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {addOn.rationale && addOn.rationale !== "Custom add-on created by you" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2"
                                  onClick={() => showRationale(addOn.name, addOn.rationale)}
                                  data-testid={`button-rationale-addon-${idx}`}
                                >
                                  <Info className="w-3 h-3" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-red-500 hover:text-red-700"
                                onClick={() => removeAddOn(idx)}
                                data-testid={`button-remove-addon-${idx}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="flex items-center gap-3">
                        <Plus className="w-4 h-4 text-muted-foreground" />
                        <Input
                          value={customAddOn}
                          onChange={(e) => setCustomAddOn(e.target.value)}
                          placeholder="Custom add-on name"
                          className="flex-1"
                          data-testid="input-custom-addon-name"
                        />
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={customAddOnPrice}
                            onChange={(e) => setCustomAddOnPrice(e.target.value)}
                            placeholder="Price"
                            className="w-24"
                            data-testid="input-custom-addon-price"
                          />
                        </div>
                        <Button 
                          variant="outline"
                          onClick={handleAddCustomAddOn}
                          disabled={!customAddOn.trim() || !customAddOnPrice}
                          data-testid="button-add-custom-addon"
                        >
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                  disabled={isLoading || (use3Tiers ? !starterPrice || !standardPrice || !advancedPrice : !standardPrice)}
                  onClick={() => {
                    const pricingSelections = {
                      use3Tiers,
                      tiers: {
                        starter: use3Tiers ? {
                          title: starterTitle,
                          description: starterDesc,
                          deliveryDays: starterDays,
                          price: starterPrice
                        } : null,
                        standard: {
                          title: standardTitle,
                          description: standardDesc,
                          deliveryDays: standardDays,
                          price: standardPrice
                        },
                        advanced: use3Tiers ? {
                          title: advancedTitle,
                          description: advancedDesc,
                          deliveryDays: advancedDays,
                          price: advancedPrice
                        } : null
                      },
                      serviceOptions: serviceOptions.filter(opt => 
                        opt.starterIncluded || opt.standardIncluded || opt.advancedIncluded
                      ),
                      addOns: addOns
                    };
                    sessionStorage.setItem("pricingSelections", JSON.stringify(pricingSelections));
                    sessionStorage.removeItem("gallerySuggestions");
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
                    Pricing Strategy
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Based on marketplace intelligence
                  </p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : suggestions?.pricingStrategy ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestions.pricingStrategy}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Strategy insights will appear once analysis is complete.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Market Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : suggestions?.marketContext ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestions.marketContext}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Market context will appear once analysis is complete.
                    </p>
                  )}
                </CardContent>
              </Card>

              {selectedRationale && (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Why This {selectedRationale.field}?
                      {selectedRationale.tier && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {selectedRationale.tier}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedRationale.rationale}
                    </p>
                  </CardContent>
                </Card>
              )}

              {analysisData && !isLoading && (
                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      Your Profile Advantage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Proficiency</span>
                      <Badge variant="outline" className={
                        analysisData.proficiency >= 80 ? "bg-green-100 text-green-700" :
                        analysisData.proficiency >= 60 ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }>
                        {analysisData.proficiency}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Position</span>
                      <span className="text-xs font-medium">
                        {analysisData.proficiency >= 80 ? 'Premium' :
                         analysisData.proficiency >= 60 ? 'Mid-Range' : 'Competitive'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
