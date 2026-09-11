import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            className={cn(
                'relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border border-transparent transition-all duration-300',
                'hover:border-border hover:bg-accent',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                className,
            )}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <Sun
                className={cn(
                    'absolute size-[18px] transition-all duration-500',
                    isDark
                        ? 'rotate-90 scale-0 opacity-0'
                        : 'rotate-0 scale-100 opacity-100',
                )}
            />
            <Moon
                className={cn(
                    'absolute size-[18px] transition-all duration-500',
                    isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0',
                )}
            />
        </Button>
    );
}
