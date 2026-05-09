import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/apiError';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBoard, deleteBoard, listBoards, updateBoard } from '../features/boards/boards';
import type { BoardSummary } from '../types/models';

const boardFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Board title is required')
    .max(120, 'Keep titles under 120 characters'),
});

type BoardFormValues = z.infer<typeof boardFormSchema>;

function BoardFormDialog({
  board,
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  board?: BoardSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BoardFormValues) => void;
  pending: boolean;
}) {
  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: { title: board?.title ?? '' },
  });

  useEffect(() => {
    form.reset({ title: board?.title ?? '' });
  }, [board, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{board ? 'Rename board' : 'New board'}</DialogTitle>
          <DialogDescription>
            {board ? 'Update this board title.' : 'Create a private board for your work.'}
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

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameBoard, setRenameBoard] = useState<BoardSummary | null>(null);
  const [deleteBoardTarget, setDeleteBoardTarget] = useState<BoardSummary | null>(null);
  const boardsQuery = useQuery({ queryKey: ['boards'], queryFn: listBoards });

  const createMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      toast.success('Board created');
      setCreateOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not create board')),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateBoard(id, title),
    onSuccess: () => {
      toast.success('Board renamed');
      setRenameBoard(null);
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not rename board')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      toast.success('Board deleted');
      setDeleteBoardTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete board')),
  });

  return (
    <main className="page-shell px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="motion-enter mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-accent">Workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">Your boards</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Private Kanban boards owned by your account.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New board
          </Button>
        </div>

        {boardsQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className="motion-enter h-36"
                style={{ animationDelay: `${index * 45}ms` }}
              />
            ))}
          </div>
        )}

        {boardsQuery.isError && (
          <Alert className="border-destructive/40">
            <AlertTitle>Could not load boards</AlertTitle>
            <AlertDescription className="mb-4">
              Refresh the list or sign in again if your session expired.
            </AlertDescription>
            <Button variant="outline" size="sm" onClick={() => void boardsQuery.refetch()}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </Alert>
        )}

        {!boardsQuery.isLoading && !boardsQuery.isError && boardsQuery.data?.length === 0 && (
          <section className="interactive-card motion-enter p-8 text-center">
            <h2 className="text-lg font-semibold">No boards yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first board to start organizing cards.
            </p>
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New board
            </Button>
          </section>
        )}

        {!!boardsQuery.data?.length && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boardsQuery.data.map((board, index) => (
              <article
                key={board.id}
                className="interactive-card motion-enter group relative p-5"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <Link
                  to={`/boards/${board.id}`}
                  className="absolute inset-0 rounded-lg"
                  aria-label={board.title}
                />
                <p className="block text-lg font-semibold transition-colors group-hover:text-accent">
                  {board.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{board._count.columns} columns</p>
                <div className="relative z-10 mt-5 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRenameBoard(board)}>
                    Rename
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteBoardTarget(board)}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <BoardFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        pending={createMutation.isPending}
        onSubmit={(values) => createMutation.mutate(values.title)}
      />

      <BoardFormDialog
        board={renameBoard ?? undefined}
        open={!!renameBoard}
        onOpenChange={(open) => !open && setRenameBoard(null)}
        pending={renameMutation.isPending}
        onSubmit={(values) => {
          if (renameBoard) renameMutation.mutate({ id: renameBoard.id, title: values.title });
        }}
      />

      <Dialog
        open={!!deleteBoardTarget}
        onOpenChange={(open) => !open && setDeleteBoardTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete board</DialogTitle>
            <DialogDescription>
              Delete "{deleteBoardTarget?.title}" and all of its columns and cards. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteBoardTarget && deleteMutation.mutate(deleteBoardTarget.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
