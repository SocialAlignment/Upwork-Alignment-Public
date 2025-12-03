import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle,
  ChevronDown,
  X,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  categoryTaxonomy,
  level1Categories,
  getLevel2Categories,
  getLevel3Categories,
  hasLevel3,
  getProjectAttributes,
  type ProjectAttribute,
} from "@shared/upwork-categories";

const steps = [
  { id: 1, name: "Overview", description: "Title & Category" },
  { id: 2, name: "Pricing", description: "Set your rates" },
  { id: 3, name: "Gallery", description: "Add samples" },
  { id: 4, name: "Process", description: "Define workflow" },
  { id: 5, name: "Description", description: "Write details" },
  { id: 6, name: "Review", description: "Final check" },
];

export default function ProjectCreation() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [title, setTitle] = useState("");
  const [level1, setLevel1] = useState("");
  const [level2, setLevel2] = useState("");
  const [level3, setLevel3] = useState("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  
  const [projectAttributes, setProjectAttributes] = useState<ProjectAttribute[]>([]);
  
  useEffect(() => {
    if (level1 && level2) {
      const attrs = getProjectAttributes(level1, level2, level3 || undefined);
      setProjectAttributes(attrs);
      setSelectedAttributes({});
    } else {
      setProjectAttributes([]);
      setSelectedAttributes({});
    }
  }, [level1, level2, level3]);

  const wordCount = title.trim().split(/\s+/).filter(Boolean).length;
  const charCount = title.length;
  const titleValid = wordCount >= 7 && charCount <= 75;

  const handleLevel1Change = (value: string) => {
    setLevel1(value);
    setLevel2("");
    setLevel3("");
  };

  const handleLevel2Change = (value: string) => {
    setLevel2(value);
    setLevel3("");
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

  const getCategoryDisplay = () => {
    const parts = [level1, level2, level3].filter(Boolean);
    return parts.join(" > ");
  };

  const showLevel3Dropdown = level1 && level2 && hasLevel3(level1, level2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3">
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
              <span className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-1 mb-8">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={`hidden md:block ml-2 text-sm ${
                step.id === currentStep ? "font-medium text-foreground" : "text-muted-foreground"
              }`}>
                {step.name}
              </span>
              {idx < steps.length - 1 && (
                <div className="w-8 md:w-12 h-0.5 mx-2 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Project overview</h1>
                <p className="text-muted-foreground">Define your project for Upwork clients</p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-base font-medium">Title</Label>
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
                      className="h-12"
                      data-testid="input-project-title"
                    />
                    {!titleValid && title.length > 0 && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Please enter a title with at least 7 words and no more than 75 characters.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Category</Label>
                    <p className="text-sm text-muted-foreground">
                      Select a category so it's easy for clients to find your project.
                    </p>
                    
                    {getCategoryDisplay() && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
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

                    <button className="text-sm text-primary hover:underline">
                      Browse all categories
                    </button>
                  </div>

                  {projectAttributes.length > 0 && (
                    <div className="space-y-6 pt-4 border-t">
                      <h3 className="text-lg font-semibold">Project attributes</h3>
                      
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
                      <Label className="text-base font-medium">Search tags (optional)</Label>
                      <span className="text-xs text-muted-foreground">{searchTags.length}/5 tags</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Start typing to view & select options. If entering your own tags, press Enter to save.
                    </p>
                    <div className="relative">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a search tag..."
                        className="h-10"
                        disabled={searchTags.length >= 5}
                        data-testid="input-search-tags"
                      />
                    </div>
                    {searchTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {searchTags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full p-0.5"
                              data-testid={`button-remove-tag-${tag}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" data-testid="button-save-exit">
                  Save & exit
                </Button>
                <Button 
                  className="gap-2"
                  disabled={!titleValid || !level1 || !level2}
                  data-testid="button-save-continue"
                >
                  Save & Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Need help getting started?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Review these resources to learn how to create a great project.
                </p>
                <div className="space-y-2">
                  <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <HelpCircle className="w-4 h-4" />
                    Step-by-step videos on how to create a project
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <HelpCircle className="w-4 h-4" />
                    Tips for planning and improving your project
                  </a>
                </div>
                <p className="text-xs text-muted-foreground pt-4 border-t">
                  You can always come back and change your project later.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
