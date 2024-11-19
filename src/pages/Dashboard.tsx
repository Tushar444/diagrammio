import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import type { Diagram } from '@/types/diagram';

const Dashboard = () => {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [newDiagramName, setNewDiagramName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const createNewDiagram = () => {
    if (!newDiagramName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter a name for your diagram.",
      });
      return;
    }

    const newDiagram: Diagram = {
      id: Date.now().toString(),
      name: newDiagramName,
      userId: '1', // TODO: Get from auth
      elements: [],
      relationships: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDiagrams([...diagrams, newDiagram]);
    setNewDiagramName('');
    navigate(`/editor/${newDiagram.id}`);
  };

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
            <Button onClick={createNewDiagram}>
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
                  Last updated: {new Date(diagram.updatedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {diagram.elements.length} elements
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