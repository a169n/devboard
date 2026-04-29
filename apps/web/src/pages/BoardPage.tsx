import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, GripVertical, Plus, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/apiError';
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
import type { Card as CardType, Column, Priority } from '../types/models';

const priorityColor: Record<Priority, string> = {
  LOW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  HIGH: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
};

const columnSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Column title is required')
    .max(120, 'Keep titles under 120 characters'),
});

const cardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Card title is required')
    .max(200, 'Keep titles under 200 characters'),
  description: z.string().max(5000, 'Keep descriptions under 5000 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

type ColumnValues = z.infer<typeof columnSchema>;
type CardValues = z.infer<typeof cardSchema>;

function SortableCard({
  card,
  onEdit,
  onDelete,
}: {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (card: CardType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { card },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card p-3 shadow-sm ${isDragging ? 'opacity-70 ring-2 ring-ring' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 rounded p-1 text-muted-foreground hover:bg-muted"
          aria-label={`Drag ${card.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="break-words font-medium leading-snug">{card.title}</h4>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${priorityColor[card.priority]}`}
            >
              {card.priority}
            </span>
          </div>
          {card.description && (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
              {card.description}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(card)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => onDelete(card)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DroppableColumn({ column, children }: { column: Column; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-72 flex-col rounded-lg border bg-muted/70 p-3 transition-colors ${isOver ? 'border-accent bg-accent/10' : ''}`}
    >
      {children}
    </section>
  );
}

function ColumnFormDialog({
  column,
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  column?: Column;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ColumnValues) => void;
  pending: boolean;
}) {
  const form = useForm<ColumnValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: { title: column?.title ?? '' },
  });

  useEffect(() => {
    form.reset({ title: column?.title ?? '' });
  }, [column, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{column ? 'Rename column' : 'New column'}</DialogTitle>
          <DialogDescription>
            {column ? 'Update this column title.' : 'Add a column to this board.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={pending}>{pending ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CardFormDialog({
  card,
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  card?: CardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CardValues) => void;
  pending: boolean;
}) {
  const form = useForm<CardValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: card?.title ?? '',
      description: card?.description ?? '',
      priority: card?.priority ?? 'MEDIUM',
    },
  });

  useEffect(() => {
    form.reset({
      title: card?.title ?? '',
      description: card?.description ?? '',
      priority: card?.priority ?? 'MEDIUM',
    });
  }, [card, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? 'Edit card' : 'New card'}</DialogTitle>
          <DialogDescription>
            {card ? 'Update this card.' : 'Add a card to this column.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">LOW</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={pending}>{pending ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function BoardPage() {
  const { boardId = '' } = useParams();
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [createColumnOpen, setCreateColumnOpen] = useState(false);
  const [renameColumn, setRenameColumn] = useState<Column | null>(null);
  const [deleteColumnTarget, setDeleteColumnTarget] = useState<Column | null>(null);
  const [cardColumnId, setCardColumnId] = useState<string | null>(null);
  const [editCard, setEditCard] = useState<CardType | null>(null);
  const [deleteCardTarget, setDeleteCardTarget] = useState<CardType | null>(null);

  const boardQuery = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoard(boardId),
    enabled: !!boardId,
  });
  const refreshBoard = () => queryClient.invalidateQueries({ queryKey: ['board', boardId] });

  const createColumnMutation = useMutation({
    mutationFn: ({ title }: { title: string }) => createColumn(boardId, title),
    onSuccess: () => {
      toast.success('Column created');
      setCreateColumnOpen(false);
      void refreshBoard();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not create column')),
  });
  const updateColumnMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateColumn(id, title),
    onSuccess: () => {
      toast.success('Column renamed');
      setRenameColumn(null);
      void refreshBoard();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not rename column')),
  });
  const deleteColumnMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      toast.success('Column deleted');
      setDeleteColumnTarget(null);
      void refreshBoard();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete column')),
  });
  const createCardMutation = useMutation({
    mutationFn: ({ columnId, values }: { columnId: string; values: CardValues }) =>
      createCard(columnId, values),
    onSuccess: () => {
      toast.success('Card created');
      setCardColumnId(null);
      void refreshBoard();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not create card')),
  });
  const updateCardMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CardValues }) => updateCard(id, values),
    onSuccess: () => {
      toast.success('Card updated');
      setEditCard(null);
      void refreshBoard();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update card')),
  });
  const deleteCardMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      toast.success('Card deleted');
      setDeleteCardTarget(null);
      void refreshBoard();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete card')),
  });
  const moveCardMutation = useMutation({
    mutationFn: moveCard,
    onSuccess: () => void refreshBoard(),
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not move card')),
  });

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

    if (source.columnId === destinationColumnId && source.index === destinationIndex) return;

    moveCardMutation.mutate({
      cardId: activeId,
      sourceColumnId: source.columnId,
      destinationColumnId,
      sourceIndex: source.index,
      destinationIndex,
    });
  };

  if (boardQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-96" />
          ))}
        </div>
      </main>
    );
  }

  if (boardQuery.isError || !boardQuery.data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to boards
          </Link>
        </Button>
        <Alert className="border-destructive/40">
          <AlertTitle>Board not found</AlertTitle>
          <AlertDescription className="mb-4">
            This board may not exist or may not belong to your account.
          </AlertDescription>
          <Button variant="outline" size="sm" onClick={() => void boardQuery.refetch()}>
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to boards
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">{boardQuery.data.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag cards between columns. Changes are saved to this board.
          </p>
        </div>
        <Button onClick={() => setCreateColumnOpen(true)}>
          <Plus className="h-4 w-4" />
          New column
        </Button>
      </div>

      {boardQuery.data.columns.length === 0 ? (
        <section className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">No columns yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add a column to start placing cards.</p>
          <Button className="mt-5" onClick={() => setCreateColumnOpen(true)}>
            <Plus className="h-4 w-4" />
            New column
          </Button>
        </section>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            {boardQuery.data.columns.map((column) => (
              <DroppableColumn key={column.id} column={column}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{column.title}</h3>
                    <p className="text-xs text-muted-foreground">{column.cards.length} cards</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setRenameColumn(column)}>
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteColumnTarget(column)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <SortableContext
                  items={column.cards.map((card) => card.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-1 flex-col gap-2">
                    {column.cards.length === 0 && (
                      <div className="flex min-h-28 items-center justify-center rounded-md border border-dashed bg-background/70 p-4 text-center text-sm text-muted-foreground">
                        Drop cards here or add a new one.
                      </div>
                    )}
                    {column.cards.map((card) => (
                      <SortableCard
                        key={card.id}
                        card={card}
                        onDelete={setDeleteCardTarget}
                        onEdit={setEditCard}
                      />
                    ))}
                  </div>
                </SortableContext>

                <Button
                  variant="outline"
                  className="mt-3 w-full bg-background"
                  onClick={() => setCardColumnId(column.id)}
                >
                  <Plus className="h-4 w-4" />
                  Add card
                </Button>
              </DroppableColumn>
            ))}
          </div>
        </DndContext>
      )}

      <ColumnFormDialog
        open={createColumnOpen}
        onOpenChange={setCreateColumnOpen}
        pending={createColumnMutation.isPending}
        onSubmit={(values) => createColumnMutation.mutate({ title: values.title })}
      />

      <ColumnFormDialog
        column={renameColumn ?? undefined}
        open={!!renameColumn}
        onOpenChange={(open) => !open && setRenameColumn(null)}
        pending={updateColumnMutation.isPending}
        onSubmit={(values) => {
          if (renameColumn)
            updateColumnMutation.mutate({ id: renameColumn.id, title: values.title });
        }}
      />

      <CardFormDialog
        open={!!cardColumnId}
        onOpenChange={(open) => !open && setCardColumnId(null)}
        pending={createCardMutation.isPending}
        onSubmit={(values) => {
          if (cardColumnId) createCardMutation.mutate({ columnId: cardColumnId, values });
        }}
      />

      <CardFormDialog
        card={editCard ?? undefined}
        open={!!editCard}
        onOpenChange={(open) => !open && setEditCard(null)}
        pending={updateCardMutation.isPending}
        onSubmit={(values) => {
          if (editCard) updateCardMutation.mutate({ id: editCard.id, values });
        }}
      />

      <Dialog
        open={!!deleteColumnTarget}
        onOpenChange={(open) => !open && setDeleteColumnTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete column</DialogTitle>
            <DialogDescription>
              Delete "{deleteColumnTarget?.title}" and all cards in it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteColumnMutation.isPending}
              onClick={() =>
                deleteColumnTarget && deleteColumnMutation.mutate(deleteColumnTarget.id)
              }
            >
              {deleteColumnMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCardTarget} onOpenChange={(open) => !open && setDeleteCardTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete card</DialogTitle>
            <DialogDescription>
              Delete "{deleteCardTarget?.title}". This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteCardMutation.isPending}
              onClick={() => deleteCardTarget && deleteCardMutation.mutate(deleteCardTarget.id)}
            >
              {deleteCardMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
