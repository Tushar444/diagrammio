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
    <div key={member.id} className="flex items-center space-x-2 text-sm mb-1">
      <Select
        value={member.accessModifier}
        onValueChange={(value) => updateMember(member.id, 'accessModifier', value, type)}
      >
        <SelectTrigger className="w-20">
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
        className="flex-1"
      />
      {type === 'attribute' && (
        <Input
          value={member.type}
          onChange={(e) => updateMember(member.id, 'type', e.target.value, type)}
          className="w-24"
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
        className={`absolute border-2 ${borderColor} bg-white rounded-lg shadow-md cursor-move p-4`}
        style={{
          width: element.width,
          minHeight: element.height,
        }}
        onClick={() => onSelect(element)}
      >
        <div className="text-center font-bold border-b pb-2">
          {element.type === 'interface' && <span className="text-gray-500">«interface»</span>}
          <Input
            value={element.name}
            onChange={(e) => onUpdate({ ...element, name: e.target.value })}
            className="text-center font-bold"
          />
        </div>
        
        {element.type === 'class' && (
          <div className="border-b py-2">
            <div className="font-semibold mb-1">Attributes</div>
            {element.attributes.map(attr => renderMember(attr, 'attribute'))}
          </div>
        )}

        <div className="pt-2">
          <div className="font-semibold mb-1">Methods</div>
          {element.methods.map(method => renderMember(method, 'method'))}
        </div>
      </div>
    </Draggable>
  );
};

export default DiagramElement;