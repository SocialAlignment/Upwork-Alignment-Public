import { useState } from "react";
import { useLocation } from "wouter";
import { FileUpload } from "@/components/file-upload";
import { ProfileForm } from "@/components/profile-form";
import { AnalysisLoader } from "@/components/analysis-loader";
import { AnalysisDashboard } from "@/components/analysis-dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadProfile } from "@/lib/api";
import type { AnalysisResult } from "@shared/schema";

type ViewState = "input" | "analyzing" | "results";

export default function Home() {
  const [, navigate] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [viewState, setViewState] = useState<ViewState>("input");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleContinue = (action: "enhance" | "project") => {
    if (action === "project" && analysisResult) {
      sessionStorage.setItem("analysisData", JSON.stringify(analysisResult));
      navigate("/project-idea");
    } else if (action === "enhance") {
      toast({
        title: "Coming Soon",
        description: "Profile enhancement features are under development.",
      });
    }
  };

  const handleFormSubmit = async (data: { upworkUrl: string; linkedinUrl: string; profileContext?: string }) => {
    if (!file) {
      toast({
        title: "Resume Required",
        description: "Please upload your PDF resume to continue.",
        variant: "destructive",
      });
      return;
    }

    setViewState("analyzing");

    try {
      const result = await uploadProfile({
        resume: file,
        upworkUrl: data.upworkUrl,
        linkedinUrl: data.linkedinUrl,
        profileContext: data.profileContext,
      });

      setAnalysisResult(result.analysis);
      setViewState("results");
      
      if (result.profileContext) {
        sessionStorage.setItem("profileContext", result.profileContext);
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your profile intelligence report is ready.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis.",
        variant: "destructive",
      });
      setViewState("input");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 md:p-8 font-sans text-foreground overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {viewState !== "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Project Crafter
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 tracking-tight">
              Build Your Agent's Brain
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              To craft the perfect project inputs, we first need to understand your professional DNA. Drop your resume and profiles below.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {viewState === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6 md:p-8 max-w-2xl mx-auto"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-sm">1</div>
                    <h2 className="text-lg font-semibold">Upload Resume</h2>
                  </div>
                  <FileUpload onFileSelect={setFile} selectedFile={file} />
                </div>

                <div className="w-full h-px bg-border/50" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-sm">2</div>
                    <h2 className="text-lg font-semibold">Connect Profiles</h2>
                  </div>
                  <ProfileForm onSubmit={handleFormSubmit} />
                </div>
              </div>
            </motion.div>
          )}

          {viewState === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-md mx-auto p-8 bg-card border border-border rounded-2xl shadow-lg" data-testid="analysis-loader">
                <div className="mb-8 text-center">
                  <div className="inline-block p-4 rounded-full bg-primary/10 mb-4 relative">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground">
                    Analyzing Profile with AI
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This may take 10-20 seconds...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {viewState === "results" && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <AnalysisDashboard 
                initialData={analysisResult}
                onContinue={handleContinue} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {viewState === "input" && (
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Data is processed locally in this prototype.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
