import { Link } from "@inertiajs/react";
import {
    BriefcaseBusiness,
    CalendarDays,
    ClipboardList,
    Compass,
    LayoutGrid,
    UserRound,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import type { NavItem } from "@/types";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: "Discover projects",
        href: `${dashboard()}#opportunities`,
        icon: Compass,
    },
    {
        title: "My applications",
        href: `${dashboard()}#applications`,
        icon: ClipboardList,
    },
    {
        title: "My projects",
        href: `${dashboard()}#projects`,
        icon: BriefcaseBusiness,
    },
    {
        title: "Timesheets",
        href: `${dashboard()}#timesheets`,
        icon: CalendarDays,
    },
    {
        title: "My profile",
        href: "/onboarding/build-profile",
        icon: UserRound,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="[--sidebar:#d57f3f] [--sidebar-foreground:#1e2f44] [--sidebar-primary:#1e2f44] [--sidebar-primary-foreground:#fff] [--sidebar-accent:#e9a56f] [--sidebar-accent-foreground:#1e2f44] [--sidebar-border:#e9a56f] [--sidebar-width-icon:5rem]"
        >
            <SidebarHeader className="relative">
                <SidebarTrigger className="absolute top-3 right-1 z-10" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
