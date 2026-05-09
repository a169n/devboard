import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme}
      closeButton
      position="top-center"
      offset={16}
      gap={8}
      toastOptions={{
        classNames: {
          toast: 'font-sans',
          title: '!font-semibold !text-sm',
          description: '!text-xs !text-muted-foreground',
          closeButton: '!border-border !text-muted-foreground hover:!text-foreground',
        },
      }}
    />
  );
}
