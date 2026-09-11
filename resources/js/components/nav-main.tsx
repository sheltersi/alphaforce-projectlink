import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup, NavItem } from '@/types';

const badgeStyles: Record<string, string> = {
    accent: 'bg-sienna-500 text-white dark:bg-sienna-600',
    success: 'bg-moss-500 text-white dark:bg-moss-600',
    muted: 'bg-muted text-muted-foreground',
};

function NavItemInner({ item }: { item: NavItem }) {
    const { isCurrentUrl } = useCurrentUrl();
    const active = isCurrentUrl(item.href);

    return (
        <SidebarMenuButton
            asChild
            isActive={active}
            tooltip={{ children: item.title }}
            className={item.badge !== undefined ? 'pr-8!' : undefined}
        >
            <Link href={item.href} prefetch>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.badge !== undefined && (
                    <SidebarMenuBadge
                        className={cn(
                            'font-bold tabular-nums',
                            badgeStyles[item.badgeTone ?? 'muted'],
                        )}
                    >
                        {item.badge}
                    </SidebarMenuBadge>
                )}
            </Link>
        </SidebarMenuButton>
    );
}

export function NavMain({ items }: { items: NavItem[] | NavGroup[] }) {
    const hasGroups = items.length > 0 && 'items' in items[0];

    if (!hasGroups) {
        return (
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                    {(items as NavItem[]).map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <NavItemInner item={item} />
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        );
    }

    return (
        <>
            {(items as NavGroup[]).map((group) => (
                <SidebarGroup key={group.label} className="px-2 py-0">
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <NavItemInner item={item} />
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}