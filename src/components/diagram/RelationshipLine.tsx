import React from 'react';
import { Relationship } from '@/types/diagram';

interface RelationshipLineProps {
  relationship: Relationship;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
}

const RelationshipLine: React.FC<RelationshipLineProps> = ({
  relationship,
  sourcePosition,
  targetPosition,
}) => {
  const getMarkerEnd = () => {
    switch (relationship.type) {
      case 'directed':
        return 'url(#arrow)';
      case 'inheritance':
        return 'url(#triangle)';
      case 'implementation':
        return 'url(#triangle-empty)';
      case 'aggregation':
        return 'url(#diamond)';
      case 'composition':
        return 'url(#diamond-filled)';
      default:
        return 'none';
    }
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
        </marker>
        <marker
          id="triangle"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="black" />
        </marker>
        <marker
          id="triangle-empty"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
          strokeDasharray="4,4"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="black" />
        </marker>
        <marker
          id="diamond"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill="white" stroke="black" />
        </marker>
        <marker
          id="diamond-filled"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill="black" />
        </marker>
      </defs>
      <line
        x1={sourcePosition.x}
        y1={sourcePosition.y}
        x2={targetPosition.x}
        y2={targetPosition.y}
        stroke="black"
        strokeWidth="1"
        markerEnd={getMarkerEnd()}
        strokeDasharray={relationship.type === 'dependency' || relationship.type === 'usage' ? '4,4' : 'none'}
      />
    </svg>
  );
};

export default RelationshipLine;