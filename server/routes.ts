import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import pdfParse from "pdf-parse";
import { analyzeProfile } from "./ai-service";
import { UPWORK_CATEGORIES, PROJECT_ATTRIBUTES, TITLE_BEST_PRACTICES } from "./upwork-knowledge";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/upload-profile", upload.single("resume"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Resume file is required" });
      }

      const { upworkUrl, linkedinUrl } = req.body;
      
      if (!upworkUrl || !linkedinUrl) {
        return res.status(400).json({ error: "Upwork and LinkedIn URLs are required" });
      }

      const pdfData = await pdfParse(req.file.buffer);
      const resumeText = pdfData.text;

      const profile = await storage.createUserProfile({
        resumeText,
        upworkUrl,
        linkedinUrl,
      });

      const analysisData = await analyzeProfile({
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
      res.status(500).json({ error: "Failed to process profile" });
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

  return httpServer;
}
