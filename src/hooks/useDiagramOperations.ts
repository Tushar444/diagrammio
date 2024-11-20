import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Diagram, ClassElement, InterfaceElement } from '@/types/diagram';

export const useDiagramOperations = (diagramId: string) => {
  const queryClient = useQueryClient();

  const updateDiagramElements = async (elements: (ClassElement | InterfaceElement)[], diagramId: string) => {
    console.log('Updating diagram elements:', elements);
    
    const { data: existingElements } = await supabase
      .from('diagram_elements')
      .select('id')
      .eq('diagram_id', diagramId);

    const existingIds = new Set(existingElements?.map(el => el.id) || []);

    for (const element of elements) {
      if (!existingIds.has(element.id)) {
        console.log('Creating new element:', element);
        const { data: newElement, error: elementError } = await supabase
          .from('diagram_elements')
          .insert({
            id: element.id,
            diagram_id: diagramId,
            type: element.type,
            name: element.name,
            x_position: element.x,
            y_position: element.y,
            width: element.width,
            height: element.height,
          })
          .select()
          .single();

        if (elementError) throw elementError;

        const members = [
          ...(element.type === 'class' ? element.attributes.map(attr => ({
            element_id: element.id,
            member_type: 'attribute' as const,
            name: attr.name,
            data_type: attr.type,
            access_modifier: attr.accessModifier,
          })) : []),
          ...element.methods.map(method => ({
            element_id: element.id,
            member_type: 'method' as const,
            name: method.name,
            data_type: method.type,
            access_modifier: method.accessModifier,
          })),
        ];

        if (members.length > 0) {
          const { error: membersError } = await supabase
            .from('element_members')
            .insert(members);

          if (membersError) throw membersError;
        }
      } else {
        const { error: elementError } = await supabase
          .from('diagram_elements')
          .update({
            name: element.name,
            x_position: element.x,
            y_position: element.y,
            width: element.width,
            height: element.height,
          })
          .eq('id', element.id);

        if (elementError) throw elementError;

        await supabase
          .from('element_members')
          .delete()
          .eq('element_id', element.id);

        const members = [
          ...(element.type === 'class' ? element.attributes.map(attr => ({
            element_id: element.id,
            member_type: 'attribute' as const,
            name: attr.name,
            data_type: attr.type,
            access_modifier: attr.accessModifier,
          })) : []),
          ...element.methods.map(method => ({
            element_id: element.id,
            member_type: 'method' as const,
            name: method.name,
            data_type: method.type,
            access_modifier: method.accessModifier,
          })),
        ];

        if (members.length > 0) {
          const { error: membersError } = await supabase
            .from('element_members')
            .insert(members);

          if (membersError) throw membersError;
        }
      }
    }
  };

  const updateDiagramRelationships = async (relationships: Diagram['relationships'], diagramId: string) => {
    await supabase
      .from('relationships')
      .delete()
      .eq('diagram_id', diagramId);

    if (relationships.length > 0) {
      const relationshipData = relationships.map(rel => ({
        id: rel.id,
        diagram_id: diagramId,
        source_id: rel.sourceId,
        target_id: rel.targetId,
        type: rel.type,
      }));

      const { error: relationshipsError } = await supabase
        .from('relationships')
        .insert(relationshipData);

      if (relationshipsError) throw relationshipsError;
    }
  };

  return useMutation({
    mutationFn: async (updatedDiagram: Diagram) => {
      console.log('Updating diagram:', updatedDiagram);

      const { error: diagramError } = await supabase
        .from('diagrams')
        .update({
          name: updatedDiagram.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedDiagram.id);

      if (diagramError) throw diagramError;

      await updateDiagramElements(updatedDiagram.elements, updatedDiagram.id);
      await updateDiagramRelationships(updatedDiagram.relationships, updatedDiagram.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagram', diagramId] });
    },
  });
};