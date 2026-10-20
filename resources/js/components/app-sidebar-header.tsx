import { Bell, Search } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types";

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { unreadNotificationsCount = 0 } = usePage().props as unknown as {
        unreadNotificationsCount?: number;
    };

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
                            className="h-9 w-52 rounded-full border-transparent bg-muted/60 pl-9 pr-4 text-sm transition-all duration-300 focus:w-64 focus:border-ring focus:bg-card"
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
                        className="text-muted-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:text-foreground"
                        aria-label={
                            unreadNotificationsCount > 0
                                ? `Notifications, ${unreadNotificationsCount} unread`
                                : "Notifications"
                        }
                    >
                        <Bell className="size-[18px]" />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sienna px-1 text-[9px] font-bold text-white ring-2 ring-background">
                                {unreadNotificationsCount > 99
                                    ? "99+"
                                    : unreadNotificationsCount}
                            </span>
                        )}
                    </Link>

                    {/* Theme toggle */}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
