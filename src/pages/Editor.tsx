import { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import type { ClassElement, InterfaceElement, Relationship } from '@/types/diagram';
import DiagramElement from '@/components/diagram/DiagramElement';
import RelationshipLine from '@/components/diagram/RelationshipLine';
import DiagramToolbar from '@/components/diagram/DiagramToolbar';
import PropertiesPanel from '@/components/diagram/PropertiesPanel';
import { useDiagramData } from '@/hooks/useDiagramData';
import { useAuth } from '@/components/auth/AuthProvider';
import { debounce } from 'lodash';

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { diagram, isLoading, updateDiagram } = useDiagramData(id || '');
  const [selectedElement, setSelectedElement] = useState<ClassElement | InterfaceElement | null>(null);
  const [relationshipMode, setRelationshipMode] = useState<{
    active: boolean;
    type: Relationship['type'] | null;
    sourceId: string | null;
  }>({ active: false, type: null, sourceId: null });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const debouncedUpdate = useCallback(
    debounce((updatedDiagram) => {
      updateDiagram.mutate(updatedDiagram);
    }, 500),
    [updateDiagram]
  );

  if (isLoading) {
    return <div>Loading diagram...</div>;
  }

  if (!diagram) {
    return <div>Diagram not found</div>;
  }

  const addClass = useCallback(() => {
    const newClass: ClassElement = {
      id: crypto.randomUUID(),
      type: 'class',
      name: 'NewClass',
      x: Math.random() * 400,
      y: Math.random() * 400,
      width: 200,
      height: 300,
      attributes: [],
      methods: [],
    };

    console.log('Added new class:', newClass);
    updateDiagram.mutate({
      ...diagram,
      elements: [...diagram.elements, newClass],
    });
  }, [diagram, updateDiagram]);

  const addInterface = useCallback(() => {
    const newInterface: InterfaceElement = {
      id: crypto.randomUUID(),
      type: 'interface',
      name: 'NewInterface',
      x: Math.random() * 400,
      y: Math.random() * 400,
      width: 200,
      height: 200,
      methods: [],
    };

    console.log('Added new interface:', newInterface);
    updateDiagram.mutate({
      ...diagram,
      elements: [...diagram.elements, newInterface],
    });
  }, [diagram, updateDiagram]);

  const addMember = useCallback((type: 'attribute' | 'method') => {
    if (!selectedElement) return;

    const newMember = {
      id: crypto.randomUUID(),
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
  }, [selectedElement]);

  const updateElement = useCallback((updatedElement: ClassElement | InterfaceElement) => {
    const updatedDiagram = {
      ...diagram,
      elements: diagram.elements.map((el) =>
        el.id === updatedElement.id ? updatedElement : el
      ),
    };
    debouncedUpdate(updatedDiagram);
    setSelectedElement(updatedElement);
  }, [diagram, debouncedUpdate]);

  const handleDragStop = useCallback((id: string, x: number, y: number) => {
    const updatedDiagram = {
      ...diagram,
      elements: diagram.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      ),
    };
    debouncedUpdate(updatedDiagram);
  }, [diagram, debouncedUpdate]);

  const startRelationship = useCallback((type: Relationship['type']) => {
    if (selectedElement) {
      setRelationshipMode({ active: true, type, sourceId: selectedElement.id });
      toast({
        title: "Select target element",
        description: "Click on another element to create the relationship",
      });
    }
  }, [selectedElement, toast]);

  const handleElementClick = useCallback((element: ClassElement | InterfaceElement) => {
    if (relationshipMode.active && relationshipMode.sourceId && relationshipMode.type) {
      if (relationshipMode.sourceId !== element.id) {
        const newRelationship: Relationship = {
          id: crypto.randomUUID(),
          type: relationshipMode.type,
          sourceId: relationshipMode.sourceId,
          targetId: element.id,
        };

        updateDiagram.mutate({
          ...diagram,
          relationships: [...diagram.relationships, newRelationship],
        });

        setRelationshipMode({ active: false, type: null, sourceId: null });
        toast({
          title: "Relationship created",
          description: "The relationship has been added to the diagram",
        });
      }
    } else {
      setSelectedElement(element);
    }
  }, [relationshipMode, diagram, updateDiagram, toast]);

  const saveDiagram = useCallback(async () => {
    try {
      await updateDiagram.mutateAsync(diagram);
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
  }, [diagram, updateDiagram, toast]);

  return (
    <div className="h-screen flex">
      <DiagramToolbar
        selectedElement={selectedElement}
        onAddClass={addClass}
        onAddInterface={addInterface}
        onSave={saveDiagram}
        onStartRelationship={startRelationship}
      />

      <div className="flex-1 bg-white relative overflow-auto" ref={canvasRef}>
        {diagram.relationships.map(relationship => {
          const sourceElement = diagram.elements.find(el => el.id === relationship.sourceId);
          const targetElement = diagram.elements.find(el => el.id === relationship.targetId);
          
          if (sourceElement && targetElement) {
            return (
              <RelationshipLine
                key={relationship.id}
                relationship={relationship}
                sourcePosition={{ 
                  x: sourceElement.x + sourceElement.width / 2, 
                  y: sourceElement.y + sourceElement.height / 2 
                }}
                targetPosition={{ 
                  x: targetElement.x + targetElement.width / 2, 
                  y: targetElement.y + targetElement.height / 2 
                }}
                sourceSize={{ 
                  width: sourceElement.width, 
                  height: sourceElement.height 
                }}
                targetSize={{ 
                  width: targetElement.width, 
                  height: targetElement.height 
                }}
              />
            );
          }
          return null;
        })}
        {diagram.elements.map(element => (
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

      <PropertiesPanel
        selectedElement={selectedElement}
        onAddMember={addMember}
      />
    </div>
  );
};

export default Editor;