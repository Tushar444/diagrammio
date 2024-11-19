import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { Diagram, ClassElement, InterfaceElement, Relationship } from '@/types/diagram';
import { Plus, Save } from 'lucide-react';
import DiagramElement from '@/components/diagram/DiagramElement';
import RelationshipLine from '@/components/diagram/RelationshipLine';

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const [diagram, setDiagram] = useState<Diagram | null>({
    id: id || '',
    name: 'New Diagram',
    userId: '1',
    elements: [],
    relationships: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [selectedElement, setSelectedElement] = useState<ClassElement | InterfaceElement | null>(null);
  const [relationshipMode, setRelationshipMode] = useState<{
    active: boolean;
    type: Relationship['type'] | null;
    sourceId: string | null;
  }>({ active: false, type: null, sourceId: null });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Diagram updated:', diagram);
  }, [diagram]);

  const addClass = () => {
    if (!diagram) return;

    const newClass: ClassElement = {
      id: Date.now().toString(),
      type: 'class',
      name: 'NewClass',
      x: Math.random() * 400,
      y: Math.random() * 400,
      width: 200,
      height: 300,
      attributes: [],
      methods: [],
    };

    setDiagram({
      ...diagram,
      elements: [...diagram.elements, newClass],
    });

    console.log('Added new class:', newClass);
  };

  const addInterface = () => {
    if (!diagram) return;

    const newInterface: InterfaceElement = {
      id: Date.now().toString(),
      type: 'interface',
      name: 'NewInterface',
      x: Math.random() * 400,
      y: Math.random() * 400,
      width: 200,
      height: 200,
      methods: [],
    };

    setDiagram({
      ...diagram,
      elements: [...diagram.elements, newInterface],
    });

    console.log('Added new interface:', newInterface);
  };

  const addMember = (type: 'attribute' | 'method') => {
    if (!selectedElement) return;

    const newMember = {
      id: Date.now().toString(),
      name: type === 'attribute' ? 'newAttribute' : 'newMethod()',
      type: 'string',
      accessModifier: 'public' as const,
    };

    if (selectedElement.type === 'class') {
      const updatedElement = {
        ...selectedElement,
        [type === 'attribute' ? 'attributes' : 'methods']: [
          ...(type === 'attribute' ? selectedElement.attributes : selectedElement.methods),
          newMember,
        ],
      };
      updateElement(updatedElement);
    } else if (type === 'method') {
      const updatedElement = {
        ...selectedElement,
        methods: [...selectedElement.methods, newMember],
      };
      updateElement(updatedElement);
    }
  };

  const updateElement = (updatedElement: ClassElement | InterfaceElement) => {
    if (!diagram) return;

    setDiagram({
      ...diagram,
      elements: diagram.elements.map((el) =>
        el.id === updatedElement.id ? updatedElement : el
      ),
    });
    setSelectedElement(updatedElement);
  };

  const handleDragStop = (id: string, x: number, y: number) => {
    if (!diagram) return;
    
    setDiagram({
      ...diagram,
      elements: diagram.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      ),
    });
  };

  const startRelationship = (type: Relationship['type']) => {
    if (selectedElement) {
      setRelationshipMode({ active: true, type, sourceId: selectedElement.id });
      toast({
        title: "Select target element",
        description: "Click on another element to create the relationship",
      });
    }
  };

  const handleElementClick = (element: ClassElement | InterfaceElement) => {
    if (relationshipMode.active && relationshipMode.sourceId && relationshipMode.type) {
      if (relationshipMode.sourceId !== element.id) {
        const newRelationship: Relationship = {
          id: Date.now().toString(),
          type: relationshipMode.type,
          sourceId: relationshipMode.sourceId,
          targetId: element.id,
        };

        setDiagram(prev => prev ? {
          ...prev,
          relationships: [...prev.relationships, newRelationship],
        } : null);

        setRelationshipMode({ active: false, type: null, sourceId: null });
        toast({
          title: "Relationship created",
          description: "The relationship has been added to the diagram",
        });
      }
    } else {
      setSelectedElement(element);
    }
  };

  const saveDiagram = async () => {
    try {
      console.log('Saving diagram:', diagram);
      toast({
        title: "Diagram saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="h-screen flex">
      {/* Toolbar */}
      <div className="w-64 bg-muted p-4 space-y-4">
        <Button onClick={addClass} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
        <Button onClick={addInterface} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Interface
        </Button>
        <Button onClick={saveDiagram} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Diagram
        </Button>

        {selectedElement && (
          <div className="space-y-2">
            <h3 className="font-semibold">Add Relationship</h3>
            <Select onValueChange={(value: Relationship['type']) => startRelationship(value)}>
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

      {/* Canvas */}
      <div className="flex-1 bg-white relative overflow-auto" ref={canvasRef}>
        {diagram?.relationships.map(relationship => {
          const sourceElement = diagram.elements.find(el => el.id === relationship.sourceId);
          const targetElement = diagram.elements.find(el => el.id === relationship.targetId);
          
          if (sourceElement && targetElement) {
            return (
              <RelationshipLine
                key={relationship.id}
                relationship={relationship}
                sourcePosition={{ x: sourceElement.x + sourceElement.width / 2, y: sourceElement.y + sourceElement.height / 2 }}
                targetPosition={{ x: targetElement.x + targetElement.width / 2, y: targetElement.y + targetElement.height / 2 }}
              />
            );
          }
          return null;
        })}
        {diagram?.elements.map(element => (
          <DiagramElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={handleElementClick}
            onUpdate={updateElement}
            onDragStop={handleDragStop}
          />
        ))}
      </div>

      {/* Properties Panel */}
      {selectedElement && (
        <div className="w-64 bg-muted p-4 space-y-4">
          <h3 className="font-semibold">{selectedElement.type === 'class' ? 'Class' : 'Interface'} Properties</h3>
          
          {selectedElement.type === 'class' && (
            <>
              <h4 className="font-semibold">Attributes</h4>
              <Button onClick={() => addMember('attribute')} size="sm" className="w-full">
                Add Attribute
              </Button>
            </>
          )}

          <h4 className="font-semibold">Methods</h4>
          <Button onClick={() => addMember('method')} size="sm" className="w-full">
            Add Method
          </Button>
        </div>
      )}
    </div>
  );
};

export default Editor;