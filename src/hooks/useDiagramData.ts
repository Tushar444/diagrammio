import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Diagram, ClassElement, InterfaceElement, Relationship } from '@/types/diagram';

export const useDiagramData = (diagramId: string) => {
  const queryClient = useQueryClient();

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

      // Transform the data to match our frontend types
      const transformedElements = elements.map(element => ({
        id: element.id,
        type: element.type,
        name: element.name,
        x: element.x_position,
        y: element.y_position,
        width: element.width,
        height: element.height,
        attributes: element.element_members
          .filter(member => member.member_type === 'attribute')
          .map(attr => ({
            id: attr.id,
            name: attr.name,
            type: attr.data_type,
            accessModifier: attr.access_modifier,
          })),
        methods: element.element_members
          .filter(member => member.member_type === 'method')
          .map(method => ({
            id: method.id,
            name: method.name,
            type: method.data_type,
            accessModifier: method.access_modifier,
          })),
      }));

      return {
        ...diagramData,
        elements: transformedElements,
        relationships: relationships,
      } as Diagram;
    },
  });

  const updateDiagram = useMutation({
    mutationFn: async (updatedDiagram: Diagram) => {
      console.log('Updating diagram:', updatedDiagram);

      // Update diagram metadata
      const { error: diagramError } = await supabase
        .from('diagrams')
        .update({
          name: updatedDiagram.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedDiagram.id);

      if (diagramError) throw diagramError;

      // Update elements
      for (const element of updatedDiagram.elements) {
        const { error: elementError } = await supabase
          .from('diagram_elements')
          .upsert({
            id: element.id,
            diagram_id: updatedDiagram.id,
            type: element.type,
            name: element.name,
            x_position: element.x,
            y_position: element.y,
            width: element.width,
            height: element.height,
          });

        if (elementError) throw elementError;

        // Update members
        const members = [
          ...element.attributes.map(attr => ({
            element_id: element.id,
            member_type: 'attribute' as const,
            name: attr.name,
            data_type: attr.type,
            access_modifier: attr.accessModifier,
          })),
          ...element.methods.map(method => ({
            element_id: element.id,
            member_type: 'method' as const,
            name: method.name,
            data_type: method.type,
            access_modifier: method.accessModifier,
          })),
        ];

        const { error: membersError } = await supabase
          .from('element_members')
          .upsert(members);

        if (membersError) throw membersError;
      }

      // Update relationships
      const { error: relationshipsError } = await supabase
        .from('relationships')
        .upsert(updatedDiagram.relationships);

      if (relationshipsError) throw relationshipsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagram', diagramId] });
    },
  });

  return {
    diagram,
    isLoading,
    updateDiagram,
  };
};