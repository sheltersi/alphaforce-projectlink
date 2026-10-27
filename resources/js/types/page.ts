import type { Auth } from './auth';

export type AppPageProps = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    unreadNotificationsCount?: number;
    [key: string]: unknown;
};
