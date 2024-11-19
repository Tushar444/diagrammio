import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { Diagram, ClassElement, InterfaceElement, Relationship, ClassMember } from '@/types/diagram';
import { Plus, Save } from 'lucide-react';

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [selectedElement, setSelectedElement] = useState<ClassElement | InterfaceElement | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // TODO: Load diagram from backend
    console.log('Loading diagram:', id);
  }, [id]);

  const addClass = () => {
    if (!diagram) return;

    const newClass: ClassElement = {
      id: Date.now().toString(),
      type: 'class',
      name: 'NewClass',
      x: 100,
      y: 100,
      width: 200,
      height: 300,
      attributes: [],
      methods: [],
    };

    setDiagram({
      ...diagram,
      elements: [...diagram.elements, newClass],
    });
  };

  const addInterface = () => {
    if (!diagram) return;

    const newInterface: InterfaceElement = {
      id: Date.now().toString(),
      type: 'interface',
      name: 'NewInterface',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      methods: [],
    };

    setDiagram({
      ...diagram,
      elements: [...diagram.elements, newInterface],
    });
  };

  const addMember = (type: 'attribute' | 'method') => {
    if (!selectedElement) return;

    const newMember: ClassMember = {
      id: Date.now().toString(),
      name: type === 'attribute' ? 'newAttribute' : 'newMethod()',
      type: 'string',
      accessModifier: 'public',
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

  const saveDiagram = async () => {
    try {
      // TODO: Save to backend
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
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white" ref={canvasRef}>
        {/* Canvas content will be rendered here */}
      </div>

      {/* Properties Panel */}
      {selectedElement && (
        <div className="w-64 bg-muted p-4 space-y-4">
          <h3 className="font-semibold">{selectedElement.type === 'class' ? 'Class' : 'Interface'} Properties</h3>
          
          <div className="space-y-2">
            <label className="text-sm">Name</label>
            <Input
              value={selectedElement.name}
              onChange={(e) => updateElement({ ...selectedElement, name: e.target.value })}
            />
          </div>

          {selectedElement.type === 'class' && (
            <>
              <h4 className="font-semibold">Attributes</h4>
              <Button onClick={() => addMember('attribute')} size="sm" className="w-full">
                Add Attribute
              </Button>
              {/* Attribute list */}
            </>
          )}

          <h4 className="font-semibold">Methods</h4>
          <Button onClick={() => addMember('method')} size="sm" className="w-full">
            Add Method
          </Button>
          {/* Method list */}
        </div>
      )}
    </div>
  );
};

export default Editor;