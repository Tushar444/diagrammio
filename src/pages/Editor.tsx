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

  const renderElement = (element: ClassElement | InterfaceElement) => {
    const isSelected = selectedElement?.id === element.id;
    const borderColor = isSelected ? 'border-primary' : 'border-gray-300';

    return (
      <div
        key={element.id}
        className={`absolute border-2 ${borderColor} bg-white rounded-lg shadow-md cursor-move p-4`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          minHeight: element.height,
        }}
        onClick={() => setSelectedElement(element)}
      >
        <div className="text-center font-bold border-b pb-2">
          {element.type === 'interface' && <span className="text-gray-500">«interface»</span>}
          <div>{element.name}</div>
        </div>
        
        {element.type === 'class' && (
          <div className="border-b py-2">
            <div className="font-semibold mb-1">Attributes</div>
            {element.attributes.map(attr => (
              <div key={attr.id} className="text-sm">
                {attr.accessModifier === 'public' && '+'}
                {attr.accessModifier === 'private' && '-'}
                {attr.accessModifier === 'protected' && '#'}
                {attr.name}: {attr.type}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <div className="font-semibold mb-1">Methods</div>
          {element.methods.map(method => (
            <div key={method.id} className="text-sm">
              {method.accessModifier === 'public' && '+'}
              {method.accessModifier === 'private' && '-'}
              {method.accessModifier === 'protected' && '#'}
              {method.name}
            </div>
          ))}
        </div>
      </div>
    );
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
      <div className="flex-1 bg-white relative overflow-auto" ref={canvasRef}>
        {diagram?.elements.map(renderElement)}
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