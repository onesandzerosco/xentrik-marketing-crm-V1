
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { insertFayeSmithSocialMedia } from '@/utils/insertFayeSmithSocialMedia';
import { Database } from 'lucide-react';

const InsertFayeSocialMediaButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInsert = async () => {
    try {
      setLoading(true);
      console.log("Starting to insert Faye Smith's social media handles...");
      
      const result = await insertFayeSmithSocialMedia();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Faye Smith's social media handles have been inserted successfully.",
        });
        console.log("Insertion completed successfully");
      } else {
        throw new Error("Failed to insert social media handles");
      }
    } catch (error) {
      console.error("Error inserting social media handles:", error);
      toast({
        title: "Error",
        description: "Failed to insert social media handles. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleInsert}
      disabled={loading}
      variant="outline"
      size="sm"
      className="mb-4"
    >
      <Database className="h-4 w-4 mr-2" />
      {loading ? 'Inserting...' : 'Insert Faye Social Media'}
    </Button>
  );
};

export default InsertFayeSocialMediaButton;
