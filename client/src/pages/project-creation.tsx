import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle,
  X,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  level1Categories,
  getLevel2Categories,
  getLevel3Categories,
  hasLevel3,
  getProjectAttributes,
  type ProjectAttribute,
} from "@shared/upwork-categories";
import { getProjectSuggestions } from "@/lib/api";
import type { AnalysisResult, ProjectSuggestion } from "@shared/schema";

export default function ProjectCreation() {
  const [, navigate] = useLocation();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [suggestions, setSuggestions] = useState<ProjectSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [level1, setLevel1] = useState("");
  const [level2, setLevel2] = useState("");
  const [level3, setLevel3] = useState("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  
  const [projectAttributes, setProjectAttributes] = useState<ProjectAttribute[]>([]);

  useEffect(() => {
    const storedData = sessionStorage.getItem("analysisData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setAnalysisData(parsed);
        fetchSuggestions(parsed);
      } catch (e) {
        setError("Failed to load profile data. Please go back and try again.");
        setIsLoading(false);
      }
    } else {
      setError("No profile data found. Please complete the analysis first.");
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestions = async (data: AnalysisResult) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getProjectSuggestions(data);
      setSuggestions(result);
      
      if (result.titles?.length > 0) {
        setTitle(result.titles[0].text);
      }
      if (result.categories?.length > 0) {
        const cat = result.categories[0];
        setLevel1(cat.level1);
        setTimeout(() => {
          setLevel2(cat.level2);
          if (cat.level3) {
            setTimeout(() => setLevel3(cat.level3!), 100);
          }
        }, 100);
      }
      if (result.searchTags?.length > 0) {
        setSearchTags(result.searchTags.slice(0, 5).map((t: { tag: string; rationale: string }) => t.tag));
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (level1 && level2) {
      const attrs = getProjectAttributes(level1, level2, level3 || undefined);
      setProjectAttributes(attrs);
    } else {
      setProjectAttributes([]);
    }
  }, [level1, level2, level3]);

  const wordCount = title.trim().split(/\s+/).filter(Boolean).length;
  const charCount = title.length;
  const titleValid = wordCount >= 7 && charCount <= 75;

  const handleLevel1Change = (value: string) => {
    setLevel1(value);
    setLevel2("");
    setLevel3("");
    setSelectedAttributes({});
  };

  const handleLevel2Change = (value: string) => {
    setLevel2(value);
    setLevel3("");
    setSelectedAttributes({});
  };

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

  const applySuggestion = (type: "title" | "category" | "tag", index: number) => {
    if (!suggestions) return;
    
    if (type === "title" && suggestions.titles[index]) {
      setTitle(suggestions.titles[index].text);
    } else if (type === "category" && suggestions.categories[index]) {
      const cat = suggestions.categories[index];
      setLevel1(cat.level1);
      setTimeout(() => {
        setLevel2(cat.level2);
        if (cat.level3) {
          setTimeout(() => setLevel3(cat.level3!), 100);
        }
      }, 100);
    } else if (type === "tag" && suggestions.searchTags[index]) {
      const tag = suggestions.searchTags[index].tag;
      if (!searchTags.includes(tag) && searchTags.length < 5) {
        setSearchTags([...searchTags, tag]);
      }
    }
  };

  const getCategoryDisplay = () => {
    const parts = [level1, level2, level3].filter(Boolean);
    return parts.join(" > ");
  };

  const showLevel3Dropdown = level1 && level2 && hasLevel3(level1, level2);

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
              Go Back
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
              onClick={() => navigate("/")}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI-Powered
              </Badge>
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
                  Create Your Upwork Project
                </h1>
                <p className="text-muted-foreground">
                  AI-optimized suggestions based on your profile and current market trends
                </p>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-32" />
                      <div className="grid grid-cols-3 gap-3">
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Researching market trends and generating suggestions...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 space-y-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="title" className="text-base font-medium">Project Title</Label>
                        <span className={`text-xs ${charCount > 75 || wordCount < 7 ? "text-red-500" : "text-muted-foreground"}`}>
                          {charCount}/75 characters (min. 7 words)
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tell the client what you will deliver and how it benefits them.
                      </p>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="You will get a fantastic deliverable that drives impact"
                        className="h-12 text-base"
                        data-testid="input-project-title"
                      />
                      {!titleValid && title.length > 0 && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Please enter a title with at least 7 words and no more than 75 characters.
                        </p>
                      )}
                      
                      {suggestions?.titles && suggestions.titles.length > 1 && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            Alternative AI Suggestions
                          </p>
                          <div className="space-y-2">
                            {suggestions.titles.slice(1).map((t, idx) => (
                              <button
                                key={idx}
                                onClick={() => applySuggestion("title", idx + 1)}
                                className="w-full text-left p-2 text-sm rounded hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors group"
                                data-testid={`button-apply-title-${idx + 1}`}
                              >
                                <span className="font-medium">{t.text}</span>
                                <span className="text-xs text-muted-foreground block mt-0.5">{t.rationale}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Category</Label>
                      <p className="text-sm text-muted-foreground">
                        Select a category so it's easy for clients to find your project.
                      </p>
                      
                      {getCategoryDisplay() && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">{getCategoryDisplay()}</span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select value={level1} onValueChange={handleLevel1Change}>
                          <SelectTrigger data-testid="select-category-level1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {level1Categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select 
                          value={level2} 
                          onValueChange={handleLevel2Change}
                          disabled={!level1}
                        >
                          <SelectTrigger data-testid="select-category-level2">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {getLevel2Categories(level1).map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {showLevel3Dropdown && (
                          <Select value={level3} onValueChange={setLevel3}>
                            <SelectTrigger data-testid="select-category-level3">
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                            <SelectContent>
                              {getLevel3Categories(level1, level2).map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {suggestions?.categories && suggestions.categories.length > 1 && (
                        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Other Recommended Categories
                          </p>
                          <div className="space-y-2">
                            {suggestions.categories.slice(1).map((cat, idx) => (
                              <button
                                key={idx}
                                onClick={() => applySuggestion("category", idx + 1)}
                                className="w-full text-left p-2 text-sm rounded hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
                                data-testid={`button-apply-category-${idx + 1}`}
                              >
                                <span className="font-medium">
                                  {[cat.level1, cat.level2, cat.level3].filter(Boolean).join(" > ")}
                                </span>
                                <span className="text-xs text-muted-foreground block mt-0.5">{cat.rationale}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {projectAttributes.length > 0 && (
                      <div className="space-y-6 pt-4 border-t">
                        <h3 className="text-lg font-semibold">Project Attributes</h3>
                        
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
                      </div>
                    )}

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Search Tags</Label>
                        <span className="text-xs text-muted-foreground">{searchTags.length}/5 tags</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tags help clients find your project. Press Enter to add custom tags.
                      </p>
                      
                      {searchTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {searchTags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary"
                              className="gap-1 pr-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
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

                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a search tag..."
                        className="h-10"
                        disabled={searchTags.length >= 5}
                        data-testid="input-search-tags"
                      />

                      {suggestions?.searchTags && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {suggestions.searchTags
                            .filter(t => !searchTags.includes(t.tag))
                            .slice(0, 5)
                            .map((t, idx) => (
                              <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => applySuggestion("tag", suggestions.searchTags.findIndex(st => st.tag === t.tag))}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 transition-colors"
                                    disabled={searchTags.length >= 5}
                                    data-testid={`button-add-suggested-tag-${t.tag}`}
                                  >
                                    <Zap className="w-3 h-3" />
                                    + {t.tag}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-xs">{t.rationale}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => navigate("/")} data-testid="button-save-exit">
                  Save & Exit
                </Button>
                <Button 
                  className="gap-2"
                  disabled={!titleValid || !level1 || !level2 || isLoading}
                  data-testid="button-save-continue"
                >
                  Continue to Pricing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : suggestions?.marketInsights ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {suggestions.marketInsights}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Market insights will appear after analysis completes.
                  </p>
                )}
              </CardContent>
            </Card>

            {analysisData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                  <CardDescription>Used for AI suggestions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Archetype</p>
                    <p className="text-sm font-medium">{analysisData.archetype}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Core Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysisData.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Target Client</p>
                    <p className="text-sm">{analysisData.clientGap}</p>
                  </div>
                </CardContent>
              </Card>
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
                      Suggestions are based on real-time market research and your unique profile strengths.
                    </p>
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
