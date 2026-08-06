export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiredPermission?: string;
  children?: NavigationItem[];
}

export interface AppNavigation {
  id: string;
  label: string;
  basePath: string;
  items: NavigationItem[];
}

export interface EnterpriseApp {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  color: string;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
}

export interface ShellProps {
  appId: string;
  children: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  pageTitle?: string;
}
