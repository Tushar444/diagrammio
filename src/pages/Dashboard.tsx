import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

const Dashboard = () => {
  const [newDiagramName, setNewDiagramName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: diagrams = [], isLoading } = useQuery({
    queryKey: ['diagrams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createDiagram = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('diagrams')
        .insert({
          name,
          user_id: session?.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
      navigate(`/editor/${data.id}`);
    },
  });

  const handleCreateDiagram = () => {
    if (!newDiagramName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter a name for your diagram.",
      });
      return;
    }

    createDiagram.mutate(newDiagramName);
  };

  if (isLoading) {
    return <div>Loading diagrams...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">My Diagrams</h1>
          <div className="flex gap-4">
            <Input
              placeholder="New diagram name"
              value={newDiagramName}
              onChange={(e) => setNewDiagramName(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleCreateDiagram} disabled={createDiagram.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Diagram
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diagrams.map((diagram) => (
            <Card
              key={diagram.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/editor/${diagram.id}`)}
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{diagram.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(diagram.updated_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}

          {diagrams.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No diagrams yet. Create your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;