import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function ProjectIdea() {
  const [, navigate] = useLocation();
  const [projectIdea, setProjectIdea] = useState("");
  const { toast } = useToast();

  const wordCount = projectIdea.trim().split(/\s+/).filter(Boolean).length;
  const isValid = wordCount >= 20;

  const handleContinue = () => {
    if (!isValid) {
      toast({
        title: "More details needed",
        description: "Please provide at least 20 words describing your project.",
        variant: "destructive",
      });
      return;
    }

    const analysisData = sessionStorage.getItem("analysisData");
    if (!analysisData) {
      toast({
        title: "Profile analysis required",
        description: "Please complete profile analysis first.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    sessionStorage.setItem("projectIdea", projectIdea);
    navigate("/project-creation");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
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
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Step 1 of 2
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              Describe Your Project
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste or type a detailed description of the project you want to create on Upwork. 
              The more detail you provide, the better our AI can optimize your listing.
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Project Description
              </CardTitle>
              <CardDescription>
                Include what you'll deliver, your approach, technologies, timeline, and any unique value you bring.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="projectIdea">Your Project Idea</Label>
                  <span className={`text-sm ${wordCount < 20 ? "text-amber-600" : "text-green-600"}`}>
                    {wordCount} words {wordCount < 20 && "(min. 20)"}
                  </span>
                </div>
                <Textarea
                  id="projectIdea"
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  placeholder={`Example:

I will build a modern, responsive e-commerce website using React and Node.js. The site will include:

- Custom product catalog with filtering and search
- Shopping cart with Stripe payment integration
- User authentication and order history
- Admin dashboard for inventory management
- Mobile-optimized design with fast loading times

I have 5+ years of experience building similar platforms for clients in retail and fashion. I follow best practices for SEO and performance optimization.

Delivery: 2-3 weeks for MVP, with ongoing support available.`}
                  className="min-h-[300px] text-base leading-relaxed resize-y"
                  data-testid="textarea-project-idea"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Tips for a great description:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Be specific about deliverables and outcomes</li>
                  <li>• Mention technologies, tools, or methodologies you'll use</li>
                  <li>• Highlight what makes your approach unique</li>
                  <li>• Include relevant experience or past successes</li>
                  <li>• Specify timeline and any extras you offer</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => navigate("/")} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!isValid}
              className="gap-2"
              data-testid="button-continue"
            >
              Get AI Suggestions
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
