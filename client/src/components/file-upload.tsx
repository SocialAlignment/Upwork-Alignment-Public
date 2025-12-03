import { useState, useCallback, useId } from "react";
import { Upload, FileText, Image, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  label?: string;
  description?: string;
}

export function FileUpload({ 
  onFileSelect, 
  selectedFile, 
  accept = ".pdf",
  label = "Upload File",
  description
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  
  const isImageAccept = accept.includes("image");
  const fileTypeLabel = isImageAccept ? "image" : "PDF";
  const defaultDescription = `Drag & drop your ${fileTypeLabel} here, or click to browse`;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  const getFileTypeDisplay = () => {
    if (!selectedFile) return "";
    if (selectedFile.type.startsWith("image/")) return "Image Ready";
    if (selectedFile.type === "application/pdf") return "PDF Ready";
    return "File Ready";
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-10 text-center h-48",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border bg-card hover:bg-secondary/30 hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById(inputId)?.click()}
            data-testid="upload-zone"
          >
            <input
              id={inputId}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileInput}
              data-testid="input-file"
            />
            <div className="bg-primary/10 p-3 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
              {isImageAccept ? (
                <Image className="w-6 h-6 text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-medium text-foreground">
              {label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description || defaultDescription}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative border border-border rounded-xl bg-card p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            data-testid="file-selected-card"
          >
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
              {selectedFile.type.startsWith("image/") ? (
                <Image className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <h3 className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {getFileTypeDisplay()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <button
                onClick={removeFile}
                className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                aria-label="Remove file"
                data-testid="button-remove-file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
