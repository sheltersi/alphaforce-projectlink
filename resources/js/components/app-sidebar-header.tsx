import { Breadcrumbs } from "@/components/breadcrumbs";
import { ThemeToggle } from "@/components/theme-toggle";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types";

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="border-sidebar-border/50 bg-background/80 flex h-16 shrink-0 items-center gap-2 border-b px-6 backdrop-blur-lg transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
