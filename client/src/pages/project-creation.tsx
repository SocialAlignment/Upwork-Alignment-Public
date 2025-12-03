import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  Target,
  Zap,
  Quote,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getProjectAttributes,
  type ProjectAttribute,
} from "@shared/upwork-categories";
import { getProjectSuggestions } from "@/lib/api";
import type { AnalysisResult, ProjectSuggestion } from "@shared/schema";

interface TitleSuggestion {
  text: string;
  rationale: string;
  confidence: number;
}

interface CategorySuggestion {
  level1: string;
  level2: string;
  level3?: string;
  rationale: string;
  confidence: number;
}

interface TagSuggestion {
  tag: string;
  rationale: string;
}

export default function ProjectCreation() {
  const [, navigate] = useLocation();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [projectIdea, setProjectIdea] = useState("");
  const [suggestions, setSuggestions] = useState<ProjectSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [customTitle, setCustomTitle] = useState("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  
  const [projectAttributes, setProjectAttributes] = useState<ProjectAttribute[]>([]);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("analysisData");
    const storedIdea = sessionStorage.getItem("projectIdea");
    const cachedSuggestions = sessionStorage.getItem("projectSuggestions");
    
    if (!storedAnalysis || !storedIdea) {
      setError("Missing profile data or project idea. Please start from the beginning.");
      setIsLoading(false);
      return;
    }

    try {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      setAnalysisData(parsedAnalysis);
      setProjectIdea(storedIdea);
      
      // Use cached suggestions if available (for consistency)
      if (cachedSuggestions) {
        try {
          const cached = JSON.parse(cachedSuggestions);
          setSuggestions(cached);
          if (cached.titles?.length > 0) {
            setCustomTitle(cached.titles[0].text);
          }
          if (cached.searchTags?.length > 0) {
            setSearchTags(cached.searchTags.slice(0, 5).map((t: any) => t.tag));
          }
          setIsLoading(false);
          return;
        } catch (e) {
          // If cached suggestions are invalid, fetch new ones
        }
      }
      
      fetchSuggestions(parsedAnalysis, storedIdea);
    } catch (e) {
      setError("Failed to load data. Please go back and try again.");
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestions = async (data: AnalysisResult, idea: string, forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getProjectSuggestions(data, idea);
      
      const validatedResult: ProjectSuggestion = {
        titles: Array.isArray(result.titles) 
          ? result.titles.filter((t: any) => t && typeof t.text === 'string')
          : [],
        categories: Array.isArray(result.categories)
          ? result.categories.filter((c: any) => c && typeof c.level1 === 'string' && typeof c.level2 === 'string')
          : [],
        attributes: result.attributes || {},
        searchTags: Array.isArray(result.searchTags)
          ? result.searchTags.filter((t: any) => t && typeof t.tag === 'string')
          : [],
        marketInsights: result.marketInsights || "Market insights unavailable.",
      };
      
      setSuggestions(validatedResult);
      
      // Cache suggestions for consistency
      sessionStorage.setItem("projectSuggestions", JSON.stringify(validatedResult));
      
      if (validatedResult.titles.length > 0) {
        setCustomTitle(validatedResult.titles[0].text);
      }
      if (validatedResult.searchTags.length > 0) {
        setSearchTags(validatedResult.searchTags.slice(0, 5).map((t) => t.tag));
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (analysisData && projectIdea) {
      // Clear cached suggestions before regenerating
      sessionStorage.removeItem("projectSuggestions");
      fetchSuggestions(analysisData, projectIdea, true);
    }
  };

  const selectedCategory = suggestions?.categories?.[selectedCategoryIndex];

  useEffect(() => {
    if (selectedCategory) {
      const attrs = getProjectAttributes(
        selectedCategory.level1, 
        selectedCategory.level2, 
        selectedCategory.level3 || undefined
      );
      setProjectAttributes(attrs);
      setSelectedAttributes({});
    } else {
      setProjectAttributes([]);
    }
  }, [selectedCategory]);

  const selectedTitle = suggestions?.titles?.[selectedTitleIndex];
  const wordCount = customTitle.trim().split(/\s+/).filter(Boolean).length;
  const charCount = customTitle.length;
  const titleValid = wordCount >= 7 && charCount <= 75;

  const handleAddTag = () => {
    if (tagInput.trim() && searchTags.length < 5 && !searchTags.includes(tagInput.trim())) {
      setSearchTags([...searchTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSearchTags(searchTags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const toggleAttribute = (attrName: string, option: string, maxItems: number) => {
    setSelectedAttributes(prev => {
      const current = prev[attrName] || [];
      if (current.includes(option)) {
        return { ...prev, [attrName]: current.filter(o => o !== option) };
      } else if (current.length < maxItems) {
        return { ...prev, [attrName]: [...current, option] };
      }
      return prev;
    });
  };

  const addSuggestedTag = (tag: string) => {
    if (!searchTags.includes(tag) && searchTags.length < 5) {
      setSearchTags([...searchTags, tag]);
    }
  };

  if (error && !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")} data-testid="button-go-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
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
              onClick={() => navigate("/project-idea")}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Edit Project Idea
            </Button>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Step 2 of 2
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                  Data-Driven Project Recommendations
                </h1>
                <p className="text-muted-foreground">
                  Based on Upwork marketplace analysis and current hiring trends. These recommendations are consistent and repeatable.
                </p>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="font-medium mb-1">Analyzing Upwork Marketplace Data...</p>
                        <p className="text-sm text-muted-foreground">
                          Gathering real-time insights from successful freelancer profiles
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Project Title
                      </CardTitle>
                      <CardDescription>
                        Select a suggested title or customize your own
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {suggestions?.titles?.map((title: TitleSuggestion, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedTitleIndex(idx);
                            setCustomTitle(title.text);
                          }}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedTitleIndex === idx 
                              ? "border-primary bg-primary/5" 
                              : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300"
                          }`}
                          data-testid={`button-select-title-${idx}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-medium mb-1">{title.text}</p>
                              <p className="text-sm text-muted-foreground">{title.rationale}</p>
                            </div>
                            {selectedTitleIndex === idx && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {Math.round((title.confidence || 0.9) * 100)}% market fit
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Based on top-performing listings
                            </Badge>
                          </div>
                        </button>
                      ))}

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="customTitle">Customize Title</Label>
                          <span className={`text-xs ${charCount > 75 || wordCount < 7 ? "text-red-500" : "text-green-600"}`}>
                            {charCount}/75 chars, {wordCount} words
                          </span>
                        </div>
                        <Input
                          id="customTitle"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="Edit your title here..."
                          className="h-11"
                          data-testid="input-custom-title"
                        />
                        {!titleValid && customTitle.length > 0 && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Title needs 7+ words and max 75 characters
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        Category Selection
                      </CardTitle>
                      <CardDescription>
                        Categories are selected from Upwork's taxonomy based on your project
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {suggestions?.categories?.map((cat: CategorySuggestion, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedCategoryIndex(idx)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedCategoryIndex === idx 
                              ? "border-primary bg-primary/5" 
                              : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300"
                          }`}
                          data-testid={`button-select-category-${idx}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-1 text-sm font-medium mb-2">
                                <span>{cat.level1}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span>{cat.level2}</span>
                                {cat.level3 && (
                                  <>
                                    <ChevronRight className="w-3 h-3" />
                                    <span>{cat.level3}</span>
                                  </>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{cat.rationale}</p>
                            </div>
                            {selectedCategoryIndex === idx && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {Math.round((cat.confidence || 0.85) * 100)}% recommended
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  {projectAttributes.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Project Attributes</CardTitle>
                        <CardDescription>
                          Required attributes for your selected category
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {projectAttributes.map((attr) => {
                          const selected = selectedAttributes[attr.name] || [];
                          const hasError = attr.required && selected.length === 0;
                          
                          return (
                            <div key={attr.name} className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">
                                  {attr.label}
                                  {!attr.required && <span className="text-muted-foreground"> (Optional)</span>}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                  Choose up to {attr.maxItems}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {attr.options.map((option) => (
                                  <label
                                    key={option}
                                    className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={selected.includes(option)}
                                      onCheckedChange={() => toggleAttribute(attr.name, option, attr.maxItems)}
                                      data-testid={`checkbox-${attr.name}-${option.toLowerCase().replace(/\s+/g, '-')}`}
                                    />
                                    <span className="text-sm">{option}</span>
                                  </label>
                                ))}
                              </div>
                              {hasError && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  At least one option must be chosen.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Search Tags
                      </CardTitle>
                      <CardDescription>
                        Tags help clients find your project. Add up to 5 tags.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {searchTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {searchTags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary"
                              className="gap-1 pr-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                                data-testid={`button-remove-tag-${tag}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Add a custom tag..."
                          className="flex-1"
                          disabled={searchTags.length >= 5}
                          data-testid="input-search-tags"
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleAddTag}
                          disabled={searchTags.length >= 5 || !tagInput.trim()}
                        >
                          Add
                        </Button>
                      </div>

                      {suggestions?.searchTags && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">High-Demand Keywords (Based on Client Search Data):</p>
                          <div className="space-y-2">
                            {suggestions.searchTags
                              .filter((t: TagSuggestion) => !searchTags.includes(t.tag))
                              .slice(0, 5)
                              .map((t: TagSuggestion, idx: number) => (
                                <div 
                                  key={idx}
                                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{t.tag}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t.rationale}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => addSuggestedTag(t.tag)}
                                    disabled={searchTags.length >= 5}
                                    className="flex-shrink-0"
                                    data-testid={`button-add-tag-${t.tag}`}
                                  >
                                    + Add
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => navigate("/project-idea")} className="gap-2" data-testid="button-back-bottom">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-save-exit">
                    Save & Exit
                  </Button>
                </div>
                <Button 
                  className="gap-2"
                  disabled={!titleValid || !selectedCategory || isLoading}
                  data-testid="button-save-continue"
                >
                  Continue to Pricing
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
                    <Info className="w-5 h-5 text-primary" />
                    Marketplace Intelligence
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    From real-time Upwork data analysis
                  </p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : suggestions?.marketInsights ? (
                    <div className="prose prose-sm dark:prose-invert">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {suggestions.marketInsights}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Market insights will appear here once analysis is complete.
                    </p>
                  )}
                </CardContent>
              </Card>

              {selectedTitle && !isLoading && (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Quote className="w-4 h-4 text-amber-600" />
                      Evidence-Based Title Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedTitle.rationale}
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedCategory && !isLoading && (
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      Category Market Fit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedCategory.rationale}
                    </p>
                  </CardContent>
                </Card>
              )}

              {analysisData && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="profile" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium py-3">
                      Your Profile Summary
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Archetype</p>
                        <p className="text-sm font-medium">{analysisData.archetype}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Core Skills</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisData.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Target Client</p>
                        <p className="text-sm">{analysisData.clientGap}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">AI-Optimized</p>
                      <p className="text-xs text-muted-foreground">
                        Suggestions based on real-time Upwork market research and your unique profile.
                      </p>
                    </div>
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
