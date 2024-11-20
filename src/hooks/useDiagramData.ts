import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Diagram, ClassElement, InterfaceElement } from '@/types/diagram';
import { useDiagramOperations } from './useDiagramOperations';

export const useDiagramData = (diagramId: string) => {
  const updateDiagram = useDiagramOperations(diagramId);

  const { data: diagram, isLoading } = useQuery({
    queryKey: ['diagram', diagramId],
    queryFn: async () => {
      console.log('Fetching diagram:', diagramId);
      
      const { data: diagramData, error: diagramError } = await supabase
        .from('diagrams')
        .select('*')
        .eq('id', diagramId)
        .single();
      
      if (diagramError) throw diagramError;

      const { data: elements, error: elementsError } = await supabase
        .from('diagram_elements')
        .select(`
          *,
          element_members (*)
        `)
        .eq('diagram_id', diagramId);
      
      if (elementsError) throw elementsError;

      const { data: relationships, error: relationshipsError } = await supabase
        .from('relationships')
        .select('*')
        .eq('diagram_id', diagramId);
      
      if (relationshipsError) throw relationshipsError;

      const transformedElements = elements.map(element => ({
        id: element.id,
        type: element.type as 'class' | 'interface',
        name: element.name,
        x: element.x_position,
        y: element.y_position,
        width: element.width,
        height: element.height,
        attributes: element.type === 'class' ? element.element_members
          .filter(member => member.member_type === 'attribute')
          .map(attr => ({
            id: attr.id,
            name: attr.name,
            type: attr.data_type || '',
            accessModifier: attr.access_modifier,
          })) : [],
        methods: element.element_members
          .filter(member => member.member_type === 'method')
          .map(method => ({
            id: method.id,
            name: method.name,
            type: method.data_type || '',
            accessModifier: method.access_modifier,
          })),
      })) as (ClassElement | InterfaceElement)[];

      return {
        id: diagramData.id,
        name: diagramData.name,
        userId: diagramData.user_id,
        elements: transformedElements,
        relationships: relationships.map(rel => ({
          id: rel.id,
          type: rel.type,
          sourceId: rel.source_id,
          targetId: rel.target_id,
        })),
        createdAt: diagramData.created_at,
        updatedAt: diagramData.updated_at,
      } as Diagram;
    },
  });

  return {
    diagram,
    isLoading,
    updateDiagram,
  };
};