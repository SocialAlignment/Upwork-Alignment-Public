import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { analyzeProfile, generateProjectSuggestions } from "./ai-service";
import { UPWORK_CATEGORIES, PROJECT_ATTRIBUTES, TITLE_BEST_PRACTICES } from "./upwork-knowledge";

async function parsePdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const data = await PDFParse(buffer);
  return data.text;
}

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/upload-profile", upload.single("resume"), async (req: Request, res) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: "Resume file is required" });
      }

      const { upworkUrl, linkedinUrl } = req.body;
      
      if (!upworkUrl || !linkedinUrl) {
        return res.status(400).json({ error: "Upwork and LinkedIn URLs are required" });
      }

      let resumeText: string;
      try {
        resumeText = await parsePdf(file.buffer);
        
        if (!resumeText || resumeText.trim().length < 50) {
          return res.status(400).json({ 
            error: "Could not extract enough text from the PDF. Please ensure your resume is a text-based PDF, not a scanned image." 
          });
        }
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return res.status(400).json({ 
          error: "Failed to parse PDF file. Please ensure it's a valid PDF document." 
        });
      }

      let analysisData;
      try {
        analysisData = await analyzeProfile({
          resumeText,
          upworkUrl,
          linkedinUrl,
        });
      } catch (aiError: any) {
        console.error("AI analysis error:", aiError);
        
        if (aiError.message?.includes("JSON")) {
          return res.status(500).json({ 
            error: "AI analysis returned an unexpected format. Please try again." 
          });
        }
        
        if (aiError.status === 401 || aiError.message?.includes("API key")) {
          return res.status(500).json({ 
            error: "AI service authentication failed. Please contact support." 
          });
        }
        
        return res.status(500).json({ 
          error: "AI analysis failed. Please try again in a moment." 
        });
      }

      const profile = await storage.createUserProfile({
        resumeText,
        upworkUrl,
        linkedinUrl,
      });

      const analysis = await storage.createAnalysisResult({
        profileId: profile.id,
        ...analysisData,
      });

      res.json({
        profileId: profile.id,
        analysis,
      });
    } catch (error) {
      console.error("Error processing profile:", error);
      res.status(500).json({ error: "An unexpected error occurred. Please try again." });
    }
  });

  app.get("/api/analysis/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      const analysis = await storage.getAnalysisResultByProfileId(profileId);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  app.get("/api/upwork-knowledge/categories", async (req, res) => {
    res.json(UPWORK_CATEGORIES);
  });

  app.get("/api/upwork-knowledge/attributes", async (req, res) => {
    res.json(PROJECT_ATTRIBUTES);
  });

  app.get("/api/upwork-knowledge/title-best-practices", async (req, res) => {
    res.json(TITLE_BEST_PRACTICES);
  });

  app.post("/api/project-suggestions", async (req, res) => {
    try {
      const analysisData = req.body;
      
      if (!analysisData || !analysisData.archetype) {
        return res.status(400).json({ error: "Analysis data is required" });
      }

      const suggestions = await generateProjectSuggestions(analysisData);
      res.json(suggestions);
    } catch (error: any) {
      console.error("Error generating project suggestions:", error);
      
      if (error.message?.includes("JSON")) {
        return res.status(500).json({ 
          error: "AI returned an unexpected format. Please try again." 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to generate suggestions. Please try again." 
      });
    }
  });

  return httpServer;
}
