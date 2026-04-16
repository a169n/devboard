import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createCard,
  createColumn,
  deleteCard,
  deleteColumn,
  getBoard,
  moveCard,
  updateCard,
  updateColumn,
} from '../features/boards/boards';
import type { Card as CardType, Priority } from '../types/models';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityColor: Record<Priority, string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-rose-100 text-rose-700',
};

function SortableCard({ card, onEdit, onDelete }: { card: CardType; onEdit: (card: CardType) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id, data: { card } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium">{card.title}</h4>
        <span className={`rounded px-2 py-0.5 text-xs ${priorityColor[card.priority]}`}>{card.priority}</span>
      </div>
      {card.description && <p className="mt-1 text-sm text-slate-600">{card.description}</p>}
      <div className="mt-2 flex gap-2 text-xs">
        <button className="underline" onClick={() => onEdit(card)}>Edit</button>
        <button className="text-red-600 underline" onClick={() => onDelete(card.id)}>Delete</button>
      </div>
    </div>
  );
}

export function BoardPage() {
  const { boardId = '' } = useParams();
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor));
  const boardQuery = useQuery({ queryKey: ['board', boardId], queryFn: () => getBoard(boardId) });

  const mutateAndRefresh = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  };

  const createColumnMutation = useMutation({ mutationFn: ({ title }: { title: string }) => createColumn(boardId, title), ...mutateAndRefresh });
  const updateColumnMutation = useMutation({ mutationFn: ({ id, title }: { id: string; title: string }) => updateColumn(id, title), ...mutateAndRefresh });
  const deleteColumnMutation = useMutation({ mutationFn: deleteColumn, ...mutateAndRefresh });
  const createCardMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) => createCard(columnId, { title, priority: 'MEDIUM' }),
    ...mutateAndRefresh,
  });
  const updateCardMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title?: string; description?: string; priority?: Priority } }) =>
      updateCard(id, payload),
    ...mutateAndRefresh,
  });
  const deleteCardMutation = useMutation({ mutationFn: deleteCard, ...mutateAndRefresh });
  const moveCardMutation = useMutation({ mutationFn: moveCard, ...mutateAndRefresh });

  const cardToColumn = useMemo(() => {
    const map = new Map<string, { columnId: string; index: number }>();
    boardQuery.data?.columns.forEach((col) =>
      col.cards.forEach((card, index) => {
        map.set(card.id, { columnId: col.id, index });
      }),
    );
    return map;
  }, [boardQuery.data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId || !boardQuery.data) return;

    const source = cardToColumn.get(activeId);
    if (!source) return;

    const overCard = cardToColumn.get(overId);
    const destinationColumnId = overCard?.columnId ?? overId;
    const destinationColumn = boardQuery.data.columns.find((c) => c.id === destinationColumnId);
    if (!destinationColumn) return;
    const destinationIndex = overCard ? overCard.index : destinationColumn.cards.length;

    moveCardMutation.mutate({
      cardId: activeId,
      sourceColumnId: source.columnId,
      destinationColumnId,
      sourceIndex: source.index,
      destinationIndex,
    });
  };

  if (boardQuery.isLoading) return <main className="p-6">Loading board...</main>;
  if (boardQuery.isError || !boardQuery.data) return <main className="p-6 text-red-600">Board not found.</main>;

  return (
    <main className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link className="text-sm underline" to="/">← Back to boards</Link>
          <h1 className="text-2xl font-semibold">{boardQuery.data.title}</h1>
        </div>
        <button
          className="rounded bg-slate-900 px-3 py-2 text-white"
          onClick={() => {
            const title = prompt('Column title');
            if (title?.trim()) createColumnMutation.mutate({ title: title.trim() });
          }}
        >
          + Column
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {boardQuery.data.columns.map((column) => (
            <section key={column.id} id={column.id} className="rounded-xl bg-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{column.title}</h3>
                <div className="flex gap-2 text-xs">
                  <button
                    className="underline"
                    onClick={() => {
                      const title = prompt('Rename column', column.title);
                      if (title?.trim()) updateColumnMutation.mutate({ id: column.id, title: title.trim() });
                    }}
                  >
                    Rename
                  </button>
                  <button className="text-red-600 underline" onClick={() => deleteColumnMutation.mutate(column.id)}>
                    Delete
                  </button>
                </div>
              </div>

              <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {column.cards.map((card) => (
                    <SortableCard
                      key={card.id}
                      card={card}
                      onDelete={(id) => deleteCardMutation.mutate(id)}
                      onEdit={(card) => {
                        const title = prompt('Card title', card.title) ?? card.title;
                        const description = prompt('Description', card.description) ?? card.description;
                        const priority = (prompt('Priority: LOW, MEDIUM, HIGH', card.priority) ?? card.priority) as Priority;
                        updateCardMutation.mutate({ id: card.id, payload: { title, description, priority } });
                      }}
                    />
                  ))}
                </div>
              </SortableContext>

              <button
                className="mt-3 w-full rounded bg-white px-2 py-1 text-sm"
                onClick={() => {
                  const title = prompt('Card title');
                  if (title?.trim()) createCardMutation.mutate({ columnId: column.id, title: title.trim() });
                }}
              >
                + Add Card
              </button>
            </section>
          ))}
        </div>
      </DndContext>
    </main>
  );
}
