import React from 'react';
import Draggable from 'react-draggable';
import { ClassElement, InterfaceElement, ClassMember } from '@/types/diagram';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DiagramElementProps {
  element: ClassElement | InterfaceElement;
  isSelected: boolean;
  onSelect: (element: ClassElement | InterfaceElement) => void;
  onUpdate: (element: ClassElement | InterfaceElement) => void;
  onDragStop: (id: string, x: number, y: number) => void;
}

const DiagramElement: React.FC<DiagramElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDragStop,
}) => {
  const borderColor = isSelected ? 'border-primary' : 'border-gray-300';

  const updateMember = (memberId: string, field: string, value: string, type: 'attribute' | 'method') => {
    const updatedElement = { ...element };
    if (element.type === 'class' && type === 'attribute') {
      updatedElement.attributes = element.attributes.map(attr =>
        attr.id === memberId ? { ...attr, [field]: value } : attr
      );
    } else {
      updatedElement.methods = element.methods.map(method =>
        method.id === memberId ? { ...method, [field]: value } : method
      );
    }
    onUpdate(updatedElement);
  };

  const renderMember = (member: ClassMember, type: 'attribute' | 'method') => (
    <div key={member.id} className="flex items-center space-x-2 text-sm mb-1 min-w-[200px] max-w-full">
      <Select
        value={member.accessModifier}
        onValueChange={(value) => updateMember(member.id, 'accessModifier', value, type)}
      >
        <SelectTrigger className="w-20 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">Public</SelectItem>
          <SelectItem value="private">Private</SelectItem>
          <SelectItem value="protected">Protected</SelectItem>
          <SelectItem value="default">Default</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={member.name}
        onChange={(e) => updateMember(member.id, 'name', e.target.value, type)}
        className="flex-1 h-8"
      />
      {type === 'attribute' && (
        <Input
          value={member.type}
          onChange={(e) => updateMember(member.id, 'type', e.target.value, type)}
          className="w-24 h-8"
          placeholder="Type"
        />
      )}
    </div>
  );

  return (
    <Draggable
      position={{ x: element.x, y: element.y }}
      onStop={(e, data) => onDragStop(element.id, data.x, data.y)}
      bounds="parent"
    >
      <div
        className={`absolute border-2 ${borderColor} bg-white rounded-lg shadow-md cursor-move`}
        style={{
          minWidth: '250px',
          maxWidth: '400px',
          width: 'auto',
          height: 'auto',
        }}
        onClick={() => onSelect(element)}
      >
        <div className="text-center font-bold border-b p-2">
          {element.type === 'interface' && <div className="text-gray-500">«interface»</div>}
          <Input
            value={element.name}
            onChange={(e) => onUpdate({ ...element, name: e.target.value })}
            className="text-center font-bold h-8"
          />
        </div>
        
        {element.type === 'class' && (
          <div className="border-b p-2">
            <div className="font-semibold mb-1">Attributes</div>
            <div className="space-y-1">
              {element.attributes.map(attr => renderMember(attr, 'attribute'))}
            </div>
          </div>
        )}

        <div className="p-2">
          <div className="font-semibold mb-1">Methods</div>
          <div className="space-y-1">
            {element.methods.map(method => renderMember(method, 'method'))}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default DiagramElement;