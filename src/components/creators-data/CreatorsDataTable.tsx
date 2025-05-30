
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Eye } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import CreatorDataModal from "./CreatorDataModal";

interface AcceptedCreator {
  id: string;
  token: string;
  name: string;
  email: string;
  submitted_at: string;
  data: any;
}

const CreatorsDataTable: React.FC = () => {
  const [creators, setCreators] = useState<AcceptedCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<AcceptedCreator | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchAcceptedCreators = async () => {
    setLoading(true);
    try {
      console.log("Fetching accepted creators from onboarding_submissions...");
      
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching accepted creators:", error);
        throw error;
      }
      
      console.log("Accepted creators found:", data?.length || 0);
      setCreators(data || []);
    } catch (error) {
      console.error("Error fetching accepted creators:", error);
      toast({
        title: "Error loading creators data",
        description: "Failed to load accepted creator submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      console.error("Invalid date format:", dateString, e);
      return 'Invalid date';
    }
  };

  const handleViewData = (creator: AcceptedCreator) => {
    setSelectedCreator(creator);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchAcceptedCreators();
  }, []);

  return (
    <>
      <Card className="bg-[#1a1a33]/50 backdrop-blur-sm border border-[#252538]/50">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Accepted Creators Data</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAcceptedCreators}
              disabled={loading}
              className="text-white border-white/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-white">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-white" />
              Loading accepted creators...
            </div>
          ) : creators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No accepted creator submissions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator) => (
                  <TableRow key={creator.id}>
                    <TableCell className="font-medium">{creator.name}</TableCell>
                    <TableCell>{creator.email}</TableCell>
                    <TableCell>{formatDate(creator.submitted_at)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {creator.token.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewData(creator)}
                        title="View JSON data"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCreator && (
        <CreatorDataModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCreator(null);
          }}
          creator={selectedCreator}
        />
      )}
    </>
  );
};

export default CreatorsDataTable;
