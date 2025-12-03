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

interface AnalysisDashboardProps {
  onContinue: () => void;
}

export function AnalysisDashboard({ onContinue }: AnalysisDashboardProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8" data-testid="analysis-dashboard">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-800">
          <Check className="w-3 h-3" /> Analysis Complete
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Profile Intelligence Report</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We've analyzed your inputs against top-performing Upwork profiles in your niche. 
          Here is your core identity and the strategic opportunities you might be missing.
        </p>
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
                <span className="text-2xl font-bold text-foreground">Senior Full Stack Engineer</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Top 5%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Technical Proficiency</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-1.5 bg-blue-200 dark:bg-blue-900/40" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Identified Core Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Node.js", "System Architecture", "API Design", "AWS"].map((skill) => (
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
              {[
                { name: "E-commerce Platform Migration", type: "Enterprise" },
                { name: "Real-time Analytics Dashboard", type: "SaaS" },
              ].map((project, i) => (
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
                High-Value Gap Detected
              </CardTitle>
              <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
                Your profile emphasizes "Development" but misses "Consultancy" keywords that drive 30% higher rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Suggested Pivot</p>
                  <p className="text-sm font-medium">Position as "Technical Partner" rather than just "Developer"</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">Missing Skill Cluster</p>
                    <h4 className="font-bold text-lg mt-1">AI Integration</h4>
                  </div>
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  High demand for "LLM Integration" in your stack.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">Client Type Gap</p>
                    <h4 className="font-bold text-lg mt-1">FinTech</h4>
                  </div>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your security exp. is perfect for high-paying FinTech roles.
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
                {["Scalability Strategy", "Technical Leadership", "RAG Implementation", "Cloud Cost Optimization", "SOC2 Compliance"].map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30 cursor-pointer transition-colors">
                    + {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          size="lg" 
          className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-full"
          onClick={onContinue}
        >
          Proceed to Project Generation <ArrowUpRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
