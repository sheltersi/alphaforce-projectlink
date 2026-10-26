import { Bell, ChevronDown, Search } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const unreadNotificationsCount =
        (page.props as unknown as { unreadNotificationsCount?: number })
            .unreadNotificationsCount ?? 0;

    return (
        <header className="border-sidebar-border/50 bg-background/80 flex h-16 shrink-0 items-center gap-2 border-b px-6 backdrop-blur-lg transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center gap-2 md:gap-3">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <div className="ml-auto flex items-center gap-1.5 md:gap-2">
                    {/* Search */}
                    <div className="relative hidden items-center md:flex">
                        <Search className="text-muted-foreground pointer-events-none absolute left-3 size-4" />
                        <Input
                            type="search"
                            placeholder="Search projects, tasks…"
                            className="bg-muted/60 focus:border-ring focus:bg-card h-9 w-52 rounded-full border-transparent pr-4 pl-9 text-sm transition-all duration-300 focus:w-64"
                            aria-label="Search"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-9 w-9 rounded-full md:hidden"
                        aria-label="Search"
                    >
                        <Search className="size-[18px]" />
                    </Button>

                    {/* Messages
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground relative h-9 w-9 rounded-full transition-colors hover:text-foreground"
                        aria-label="Messages"
                    >
                        <MessageSquare className="size-[18px]" />
                        <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sienna-500 px-1 text-[9px] font-bold text-white shadow-sm">
                            5
                        </span>
                    </Button>
                    */}

                    {/* Notifications */}
                    <Link
                        href="/notifications"
                        className="text-muted-foreground hover:text-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                        aria-label={
                            unreadNotificationsCount > 0
                                ? `Notifications, ${unreadNotificationsCount} unread`
                                : 'Notifications'
                        }
                    >
                        <Bell className="size-[18px]" />
                        {unreadNotificationsCount > 0 && (
                            <span className="bg-sienna ring-background absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2">
                                {unreadNotificationsCount > 99
                                    ? '99+'
                                    : unreadNotificationsCount}
                            </span>
                        )}
                    </Link>

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {auth?.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    aria-label={`Open profile menu for ${auth.user.name}`}
                                    className="border-border/70 bg-card/80 hover:bg-accent focus-visible:ring-ring inline-flex h-10 items-center gap-2 rounded-full border py-1 pr-2 pl-1 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="bg-sand-100 text-harbor dark:bg-harbor-700 dark:text-harbor-100 text-xs font-bold">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-foreground hidden max-w-28 truncate text-xs font-bold sm:block">
                                        {auth.user.name}
                                    </span>
                                    <ChevronDown className="text-muted-foreground size-3.5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 rounded-xl"
                                align="end"
                            >
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
