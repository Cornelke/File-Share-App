
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import FileDropZone from '@/components/FileDropZone';

interface FileSelectionPanelProps {
  onFilesSelected: (files: File[]) => void;
}

const FileSelectionPanel: React.FC<FileSelectionPanelProps> = ({ onFilesSelected }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Files</CardTitle>
        <CardDescription>Choose files you want to share with other devices</CardDescription>
      </CardHeader>
      <CardContent>
        <FileDropZone onFilesSelected={onFilesSelected} />
      </CardContent>
    </Card>
  );
};

export default FileSelectionPanel;
