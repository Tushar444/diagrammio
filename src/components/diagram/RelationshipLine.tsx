import React from 'react';
import { Relationship } from '@/types/diagram';

interface RelationshipLineProps {
  relationship: Relationship;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  sourceSize?: { width: number; height: number };
  targetSize?: { width: number; height: number };
}

const RelationshipLine: React.FC<RelationshipLineProps> = ({
  relationship,
  sourcePosition,
  targetPosition,
  sourceSize = { width: 200, height: 100 },
  targetSize = { width: 200, height: 100 },
}) => {
  // Instead of calculating intersections, we'll use the top left corners directly
  const start = {
    x: sourcePosition.x,
    y: sourcePosition.y
  };

  const end = {
    x: targetPosition.x,
    y: targetPosition.y
  };

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
          viewBox="0 0 16 16"
          refX="14"
          refY="8"
          markerWidth="16"
          markerHeight="16"
          orient="auto"
        >
          <path d="M 0 0 L 16 8 L 0 16 z" fill="black" />
        </marker>

        {/* Empty triangle marker for inheritance/generalization */}
        <marker
          id="triangle-empty"
          viewBox="0 0 16 16"
          refX="14"
          refY="8"
          markerWidth="16"
          markerHeight="16"
          orient="auto"
        >
          <path d="M 0 0 L 16 8 L 0 16 z" fill="white" stroke="black" strokeWidth="1" />
        </marker>

        {/* Empty diamond marker for aggregation */}
        <marker
          id="diamond-empty"
          viewBox="0 0 16 16"
          refX="14"
          refY="8"
          markerWidth="16"
          markerHeight="16"
          orient="auto"
        >
          <path d="M 0 8 L 8 0 L 16 8 L 8 16 z" fill="white" stroke="black" strokeWidth="1" />
        </marker>

        {/* Filled diamond marker for composition */}
        <marker
          id="diamond-filled"
          viewBox="0 0 16 16"
          refX="14"
          refY="8"
          markerWidth="16"
          markerHeight="16"
          orient="auto"
        >
          <path d="M 0 8 L 8 0 L 16 8 L 8 16 z" fill="black" />
        </marker>
      </defs>

      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
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