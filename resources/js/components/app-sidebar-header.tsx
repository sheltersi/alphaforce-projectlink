import {
    Bell,
    Menu,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
} from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types";

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { toggleSidebar, state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <header className="border-sidebar-border/50 bg-background/80 flex h-16 shrink-0 items-center gap-2 border-b px-6 backdrop-blur-lg transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center gap-2 md:gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="-ml-1.5 rounded-full"
                    aria-label="Toggle sidebar"
                >
                    {isMobile ? (
                        <Menu className="size-5" />
                    ) : state === "collapsed" ? (
                        <PanelLeftOpen className="size-5" />
                    ) : (
                        <PanelLeftClose className="size-5" />
                    )}
                </Button>
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

                    {/* Messages */}
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

                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground relative h-9 w-9 rounded-full transition-colors hover:text-foreground"
                        aria-label="Notifications"
                    >
                        <Bell className="size-[18px]" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sienna ring-2 ring-background" />
                    </Button>

                    {/* Theme toggle */}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
