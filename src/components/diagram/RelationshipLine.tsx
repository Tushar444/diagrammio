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
  const calculateIntersection = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    boxCenter: { x: number; y: number },
    boxSize: { width: number; height: number }
  ) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);

    // Calculate intersection with box edges
    const w = boxSize.width / 2;
    const h = boxSize.height / 2;

    // Check intersection with vertical edges
    let x = Math.abs(Math.cos(angle)) < 0.001 ? 0 : w / Math.abs(Math.cos(angle));
    let y = x * Math.abs(Math.tan(angle));

    // If intersection point is beyond box height, use horizontal edges
    if (y > h) {
      y = h;
      x = y / Math.abs(Math.tan(angle));
    }

    // Apply signs based on direction
    x *= Math.sign(dx);
    y *= Math.sign(dy);

    return {
      x: boxCenter.x + x,
      y: boxCenter.y + y,
    };
  };

  const start = calculateIntersection(
    targetPosition,
    sourcePosition,
    sourcePosition,
    sourceSize
  );

  const end = calculateIntersection(
    sourcePosition,
    targetPosition,
    targetPosition,
    targetSize
  );

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
          markerWidth="12"
          markerHeight="12"
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
          markerWidth="12"
          markerHeight="12"
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
          markerWidth="12"
          markerHeight="12"
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
          markerWidth="12"
          markerHeight="12"
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