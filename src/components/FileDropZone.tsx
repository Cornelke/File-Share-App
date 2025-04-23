
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, FileIcon, ImageIcon, FileAudio, FileVideo, FilePenLine } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ 
  onFilesSelected,
  maxFiles = 10
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  }, [isDragActive]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [maxFiles]);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, [maxFiles]);
  
  const handleFiles = (files: File[]) => {
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only select up to ${maxFiles} files at once.`,
        variant: "destructive"
      });
      return;
    }
    
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };
  
  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };
  
  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    
    switch (type) {
      case 'image':
        return <ImageIcon size={16} className="text-blue-500" />;
      case 'audio':
        return <FileAudio size={16} className="text-green-500" />;
      case 'video':
        return <FileVideo size={16} className="text-red-500" />;
      case 'text':
        return <FilePenLine size={16} className="text-yellow-500" />;
      default:
        return <FileIcon size={16} className="text-gray-500" />;
    }
  };
  
  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1048576) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / 1048576).toFixed(1)} MB`;
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <div
        className={`file-drop-zone p-6 flex flex-col items-center justify-center cursor-pointer min-h-[200px] ${
          isDragActive ? 'active' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file"
          id="file-input"
          className="hidden"
          onChange={handleFileInput}
          multiple
        />
        
        <UploadCloud 
          size={40}
          className={`mb-2 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`}
        />
        
        <p className="text-sm font-medium mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        
        <p className="text-xs text-muted-foreground mb-4">
          Or click to browse your files
        </p>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          Browse Files
        </Button>
      </div>
      
      {selectedFiles.length > 0 && (
        <Card className="border border-border">
          <div className="p-4">
            <div className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</div>
            <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {selectedFiles.map((file, index) => (
                <li 
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-muted/30 rounded-md p-2 text-sm"
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    {getFileIcon(file)}
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {getFileSize(file.size)}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileDropZone;
