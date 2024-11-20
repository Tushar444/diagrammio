import React from 'react';
import { Button } from "@/components/ui/button";
import type { ClassElement, InterfaceElement } from '@/types/diagram';

interface PropertiesPanelProps {
  selectedElement: ClassElement | InterfaceElement | null;
  onAddMember: (type: 'attribute' | 'method') => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = React.memo(({
  selectedElement,
  onAddMember,
}) => {
  if (!selectedElement) return null;

  return (
    <div className="w-64 bg-muted p-4 space-y-4">
      <h3 className="font-semibold">{selectedElement.type === 'class' ? 'Class' : 'Interface'} Properties</h3>
      
      {selectedElement.type === 'class' && (
        <>
          <h4 className="font-semibold">Attributes</h4>
          <Button onClick={() => onAddMember('attribute')} size="sm" className="w-full">
            Add Attribute
          </Button>
        </>
      )}

      <h4 className="font-semibold">Methods</h4>
      <Button onClick={() => onAddMember('method')} size="sm" className="w-full">
        Add Method
      </Button>
    </div>
  );
});

PropertiesPanel.displayName = 'PropertiesPanel';

export default PropertiesPanel;