import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save } from 'lucide-react';
import type { ClassElement, InterfaceElement, Relationship } from '@/types/diagram';

interface DiagramToolbarProps {
  selectedElement: ClassElement | InterfaceElement | null;
  onAddClass: () => void;
  onAddInterface: () => void;
  onSave: () => void;
  onStartRelationship: (type: Relationship['type']) => void;
}

const DiagramToolbar: React.FC<DiagramToolbarProps> = React.memo(({
  selectedElement,
  onAddClass,
  onAddInterface,
  onSave,
  onStartRelationship,
}) => {
  return (
    <div className="w-64 bg-muted p-4 space-y-4">
      <Button onClick={onAddClass} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Class
      </Button>
      <Button onClick={onAddInterface} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Interface
      </Button>
      <Button onClick={onSave} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Diagram
      </Button>

      {selectedElement && (
        <div className="space-y-2">
          <h3 className="font-semibold">Add Relationship</h3>
          <Select onValueChange={(value: Relationship['type']) => onStartRelationship(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="association">Association</SelectItem>
              <SelectItem value="directed">Directed Association</SelectItem>
              <SelectItem value="aggregation">Aggregation</SelectItem>
              <SelectItem value="composition">Composition</SelectItem>
              <SelectItem value="inheritance">Inheritance</SelectItem>
              <SelectItem value="implementation">Implementation</SelectItem>
              <SelectItem value="dependency">Dependency</SelectItem>
              <SelectItem value="usage">Usage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
});

DiagramToolbar.displayName = 'DiagramToolbar';

export default DiagramToolbar;