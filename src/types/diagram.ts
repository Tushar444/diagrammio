export interface DiagramElement {
  id: string;
  type: 'class' | 'interface';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClassElement extends DiagramElement {
  type: 'class';
  attributes: ClassMember[];
  methods: ClassMember[];
}

export interface InterfaceElement extends DiagramElement {
  type: 'interface';
  methods: ClassMember[];
}

export interface ClassMember {
  id: string;
  name: string;
  type: string;
  accessModifier: 'public' | 'private' | 'protected' | 'default';
}

export interface Relationship {
  id: string;
  type: 'association' | 'directed' | 'aggregation' | 'composition' | 'inheritance' | 'implementation' | 'dependency' | 'usage';
  sourceId: string;
  targetId: string;
  sourceAnchor?: { x: number; y: number };
  targetAnchor?: { x: number; y: number };
}

export interface Diagram {
  id: string;
  name: string;
  userId: string;
  elements: (ClassElement | InterfaceElement)[];
  relationships: Relationship[];
  createdAt: string;
  updatedAt: string;
}