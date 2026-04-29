import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme}
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'font-sans',
        },
      }}
    />
  );
}
