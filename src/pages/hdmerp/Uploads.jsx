import { useState } from 'react';
import { uploadFile } from '../../services/hdmerp/uploads';
import Card from '../../components/hdmerp/ui/Card';
import Button from '../../components/hdmerp/ui/Button';
import FileUpload from '../../components/hdmerp/ui/FileUpload';
import Spinner from '../../components/hdmerp/ui/Spinner';

export default function Uploads() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');
    setUploadedUrl('');
    try {
      const result = await uploadFile(file);
      setUploadedUrl(result.url);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">File Uploads</h1>
      <Card className="max-w-xl">
        <FileUpload onUpload={handleUpload} label="Upload a file to the server" />
        
        {uploading && (
          <div className="flex items-center gap-2 mt-4 text-sm text-[var(--text-secondary)]">
            <Spinner size="sm" /> Uploading...
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
            {error}
          </div>
        )}

        {uploadedUrl && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">Upload successful!</p>
            <p className="text-xs text-green-600 dark:text-green-500 break-all">{uploadedUrl}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => navigator.clipboard.writeText(uploadedUrl)}
            >
              Copy URL
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}