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
      case 'generalization':
        return 'url(#triangle-empty)';
      case 'implementation':
      case 'realization':
        return 'url(#triangle-empty)';
      case 'aggregation':
        return 'url(#diamond-empty)';
      case 'composition':
        return 'url(#diamond-filled)';
      case 'dependency':
      case 'usage':
        return 'url(#arrow)';
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
        {/* Arrow marker for directed associations and dependencies */}
        <marker
          id="arrow"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 0 L 12 6 L 0 12 z" fill="black" />
        </marker>

        {/* Empty triangle marker for inheritance/generalization */}
        <marker
          id="triangle-empty"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 0 L 12 6 L 0 12 z" fill="white" stroke="black" strokeWidth="1" />
        </marker>

        {/* Empty diamond marker for aggregation */}
        <marker
          id="diamond-empty"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="white" stroke="black" strokeWidth="1" />
        </marker>

        {/* Filled diamond marker for composition */}
        <marker
          id="diamond-filled"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="black" />
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
        strokeDasharray={
          relationship.type === 'dependency' || 
          relationship.type === 'usage' || 
          relationship.type === 'implementation' || 
          relationship.type === 'realization' 
            ? '4,4' 
            : 'none'
        }
      />
    </svg>
  );
};

export default RelationshipLine;