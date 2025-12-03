import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Check, 
  Lightbulb,
  ArrowUpRight,
  Briefcase,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EditAnalysisDialog, type AnalysisData } from "./edit-analysis-dialog";

interface AnalysisDashboardProps {
  initialData: any;
  onContinue: (action: "enhance" | "project") => void;
}

export function AnalysisDashboard({ initialData, onContinue }: AnalysisDashboardProps) {
  const [data, setData] = useState<AnalysisData>({
    archetype: initialData.archetype,
    proficiency: initialData.proficiency,
    skills: initialData.skills,
    projects: initialData.projects,
    gapTitle: initialData.gapTitle,
    gapDescription: initialData.gapDescription,
    suggestedPivot: initialData.suggestedPivot,
    missingSkillCluster: initialData.missingSkillCluster,
    missingSkill: initialData.missingSkill,
    missingSkillDesc: initialData.missingSkillDesc,
    clientGapType: initialData.clientGapType,
    clientGap: initialData.clientGap,
    clientGapDesc: initialData.clientGapDesc,
    recommendedKeywords: initialData.recommendedKeywords,
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8" data-testid="analysis-dashboard">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-800">
            <Check className="w-3 h-3" /> Analysis Complete
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Profile Intelligence Report</h2>
          <p className="text-muted-foreground max-w-2xl">
            We've analyzed your inputs against top-performing Upwork profiles in your niche. 
          </p>
        </div>
        <EditAnalysisDialog data={data} onSave={setData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Expressed Identity (What the user provided) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Expressed Identity</h3>
              <p className="text-sm text-muted-foreground">Based on your Resume & Profiles</p>
            </div>
          </div>

          <Card className="border-blue-100 dark:border-blue-900/20 bg-blue-50/30 dark:bg-blue-900/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-blue-700 dark:text-blue-300">Core Archetype Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-foreground">{data.archetype}</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Top 5%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Technical Proficiency</span>
                  <span className="font-medium">{data.proficiency}%</span>
                </div>
                <Progress value={data.proficiency} className="h-1.5 bg-blue-200 dark:bg-blue-900/40" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Identified Core Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-background/50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Project History Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.projects.map((project, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.type}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Blindspots & Opportunities (The AI Insight) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Strategic Blindspots</h3>
              <p className="text-sm text-muted-foreground">Market opportunities you're missing</p>
            </div>
          </div>

          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Target className="w-24 h-24 text-amber-600" />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4" />
                {data.gapTitle}
              </CardTitle>
              <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
                {data.gapDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Suggested Pivot</p>
                  <p className="text-sm font-medium">{data.suggestedPivot}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">{data.missingSkillCluster}</p>
                    <h4 className="font-bold text-lg mt-1">{data.missingSkill}</h4>
                  </div>
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {data.missingSkillDesc}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">{data.clientGapType}</p>
                    <h4 className="font-bold text-lg mt-1">{data.clientGap}</h4>
                  </div>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {data.clientGapDesc}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Recommended Keywords to Add</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.recommendedKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30 cursor-pointer transition-colors">
                    + {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 px-8 text-lg border-2 rounded-full"
          onClick={() => onContinue("enhance")}
          data-testid="button-enhance-profile"
        >
          <TrendingUp className="mr-2 w-5 h-5" />
          Enhance Profile
        </Button>
        <Button 
          size="lg" 
          className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-full"
          onClick={() => onContinue("project")}
          data-testid="button-start-project"
        >
          Start Upwork Project <ArrowUpRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
