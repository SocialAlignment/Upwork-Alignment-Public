import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";

export interface AnalysisData {
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

interface EditAnalysisDialogProps {
  data: AnalysisData;
  onSave: (newData: AnalysisData) => void;
}

export function EditAnalysisDialog({ data, onSave }: EditAnalysisDialogProps) {
  const [formData, setFormData] = useState<AnalysisData>(data);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="w-4 h-4" /> Correct Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Correct Profile Intelligence</DialogTitle>
          <DialogDescription>
            Adjust the analysis findings to better match your actual profile for this prototype.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-medium text-primary border-b pb-2">Expressed Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Core Archetype</Label>
                <Input 
                  value={formData.archetype} 
                  onChange={(e) => setFormData({...formData, archetype: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Proficiency Score (%)</Label>
                <Input 
                  type="number" 
                  value={formData.proficiency} 
                  onChange={(e) => setFormData({...formData, proficiency: Number(e.target.value)})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Core Skills (comma separated)</Label>
              <Input 
                value={formData.skills.join(", ")} 
                onChange={(e) => setFormData({...formData, skills: e.target.value.split(",").map(s => s.trim())})} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-primary border-b pb-2">Strategic Blindspots</h3>
            <div className="space-y-2">
              <Label>High-Value Gap Title</Label>
              <Input 
                value={formData.gapTitle} 
                onChange={(e) => setFormData({...formData, gapTitle: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Gap Description</Label>
              <Textarea 
                value={formData.gapDescription} 
                onChange={(e) => setFormData({...formData, gapDescription: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
               <Label>Suggested Pivot</Label>
               <Input 
                 value={formData.suggestedPivot} 
                 onChange={(e) => setFormData({...formData, suggestedPivot: e.target.value})} 
               />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
