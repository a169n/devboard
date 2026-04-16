import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createBoard, deleteBoard, listBoards, updateBoard } from '../features/boards/boards';
import { useAuth } from '../features/auth/AuthContext';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const boardsQuery = useQuery({ queryKey: ['boards'], queryFn: listBoards });

  const createMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateBoard(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Boards</h1>
          <p className="text-sm text-slate-600">Signed in as {user?.email}</p>
        </div>
        <button className="rounded border px-3 py-2" onClick={logout}>
          Logout
        </button>
      </header>

      <button
        onClick={() => {
          const title = prompt('Board title');
          if (title?.trim()) createMutation.mutate(title.trim());
        }}
        className="mb-4 rounded bg-slate-900 px-3 py-2 text-white"
      >
        + New Board
      </button>

      {boardsQuery.isLoading && <p>Loading boards...</p>}
      {boardsQuery.isError && <p className="text-red-600">Could not load boards.</p>}

      {!boardsQuery.isLoading && boardsQuery.data?.length === 0 && (
        <p className="rounded-lg bg-white p-8 text-slate-600 shadow">No boards yet. Create your first board.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {boardsQuery.data?.map((board) => (
          <article key={board.id} className="rounded-xl bg-white p-4 shadow">
            <Link to={`/boards/${board.id}`} className="text-lg font-semibold text-slate-900">
              {board.title}
            </Link>
            <p className="mt-1 text-sm text-slate-600">{board._count.columns} columns</p>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded border px-2 py-1 text-sm"
                onClick={() => {
                  const title = prompt('Rename board', board.title);
                  if (title?.trim()) renameMutation.mutate({ id: board.id, title: title.trim() });
                }}
              >
                Rename
              </button>
              <button
                className="rounded border border-red-200 px-2 py-1 text-sm text-red-600"
                onClick={() => deleteMutation.mutate(board.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
