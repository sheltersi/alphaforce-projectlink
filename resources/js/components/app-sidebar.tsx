import { Link, usePage } from "@inertiajs/react";
import {
    BarChart3,
    Bell,
    BriefcaseBusiness,
    CalendarDays,
    ClipboardList,
    Clock3,
    Compass,
    LayoutGrid,
    LifeBuoy,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    SquareCheck,
    UserRound,
    UsersRound,
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
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { dashboard } from "@/routes";
import { index as projectsIndex } from "@/routes/projects";
import type { NavGroup } from "@/types";

const navGroups: NavGroup[] = [
    {
        label: "Overview",
        items: [
            {
                title: "Dashboard",
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: "Notifications",
                href: `${dashboard()}#notifications`,
                icon: Bell,
            },
            {
                title: "Analytics",
                href: `${dashboard()}#analytics`,
                icon: BarChart3,
                badge: "New",
                badgeTone: "accent",
            },
        ],
    },
    {
        label: "Workspace",
        items: [
            {
                title: "Discover projects",
                href: projectsIndex({}).url,
                icon: Compass,
                badge: "12",
                badgeTone: "accent",
            },
            {
                title: "My projects",
                href: `${dashboard()}#projects`,
                icon: BriefcaseBusiness,
            },
            {
                title: "My applications",
                href: `${dashboard()}#applications`,
                icon: ClipboardList,
            },
            {
                title: "Tasks",
                href: `${dashboard()}#tasks`,
                icon: SquareCheck,
                badge: "4",
                badgeTone: "success",
            },
            {
                title: "Calendar",
                href: `${dashboard()}#timesheets`,
                icon: CalendarDays,
            },
            {
                title: "Timesheets",
                href: `${dashboard()}#timesheets`,
                icon: Clock3,
            },
        ],
    },
    {
        label: "Community",
        items: [
            {
                title: "Messages",
                href: `${dashboard()}#messages`,
                icon: MessageSquare,
                badge: "5",
                badgeTone: "accent",
            },
            {
                title: "Team",
                href: `${dashboard()}#team`,
                icon: UsersRound,
            },
        ],
    },
    {
        label: "Support",
        items: [
            {
                title: "My profile",
                href: "/onboarding/build-profile",
                icon: UserRound,
            },
            {
                title: "Settings",
                href: "/settings/profile",
                icon: Settings,
            },
            {
                title: "Help center",
                href: `${dashboard()}#help`,
                icon: LifeBuoy,
            },
        ],
    },
];

export function AppSidebar() {
    const { state, toggleSidebar } = useSidebar();
    const isMobile = useIsMobile();
    const isCollapsed = !isMobile && state === "collapsed";
    const { projectsCount } = usePage().props as unknown as { projectsCount?: number };

    const groups = navGroups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
            item.title === "Discover projects" && projectsCount
                ? { ...item, badge: String(projectsCount) }
                : item,
        ),
    }));

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="[--sidebar:#f4ead9] [--sidebar-foreground:#1e2f44] [--sidebar-primary:#1e2f44] [--sidebar-primary-foreground:#faf5ec] [--sidebar-accent:#e9d8bd] [--sidebar-accent-foreground:#1e2f44] [--sidebar-border:#e9d8bd] [--sidebar-width-icon:5rem] dark:[--sidebar:#121d2a] dark:[--sidebar-foreground:#d8e0e9] dark:[--sidebar-primary:#d8e0e9] dark:[--sidebar-primary-foreground:#121d2a] dark:[--sidebar-accent:#1e2f44] dark:[--sidebar-accent-foreground:#d8e0e9] dark:[--sidebar-border:#1e2f44]"
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
                <NavMain items={groups} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarSeparator className="mx-0" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
