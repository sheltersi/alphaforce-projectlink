import { Link } from '@inertiajs/react';
import { BriefcaseBusiness, CalendarDays, ClipboardList, Compass, LayoutGrid, UserRound } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Discover projects',
        href: `${dashboard()}#opportunities`,
        icon: Compass,
    },
    {
        title: 'My applications',
        href: `${dashboard()}#applications`,
        icon: ClipboardList,
    },
    {
        title: 'My projects',
        href: `${dashboard()}#projects`,
        icon: BriefcaseBusiness,
    },
    {
        title: 'Timesheets',
        href: `${dashboard()}#timesheets`,
        icon: CalendarDays,
    },
    {
        title: 'My profile',
        href: '/onboarding/build-profile',
        icon: UserRound,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="[--sidebar:#1e2f44] [--sidebar-foreground:#faf5ec] [--sidebar-primary:#c56a2e] [--sidebar-primary-foreground:#fff] [--sidebar-accent:#29415b] [--sidebar-accent-foreground:#fff] [--sidebar-border:#38506a]"
        >
            <SidebarHeader>
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
