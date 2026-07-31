import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Bolt,
  BookOpen,
  Bot,
  Box,
  Brain,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Code,
  Copy,
  Cpu,
  CreditCard,
  Database,
  Delete,
  Download,
  Edit,
  FileText,
  Filter,
  Folder,
  Globe,
  Grid,
  HelpCircle,
  History,
  Home,
  Image,
  Key,
  Layers,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  MoreHorizontal,
  MoreVertical,
  Package,
  Pause,
  PieChart,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Settings,
  Share2,
  Shield,
  Sliders,
  Sparkles,
  StopCircle,
  Tag,
  Trash2,
  Upload,
  User,
  Users,
  Workflow,
  X,
  Zap,
  type LucideProps,
} from "lucide-react";

export type IconName =
  | "activity"
  | "alert"
  | "archive"
  | "arrowLeft"
  | "arrowRight"
  | "barChart"
  | "bell"
  | "bolt"
  | "book"
  | "bot"
  | "box"
  | "brain"
  | "briefcase"
  | "building"
  | "calendar"
  | "chart"
  | "check"
  | "checkCircle"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "chevronUp"
  | "circle"
  | "clock"
  | "code"
  | "copy"
  | "cpu"
  | "creditCard"
  | "database"
  | "delete"
  | "document"
  | "download"
  | "edit"
  | "fileText"
  | "filter"
  | "folder"
  | "globe"
  | "grid"
  | "help"
  | "history"
  | "home"
  | "image"
  | "key"
  | "layers"
  | "layoutDashboard"
  | "loading"
  | "lock"
  | "logout"
  | "mail"
  | "menu"
  | "message"
  | "moreHorizontal"
  | "moreVertical"
  | "package"
  | "pause"
  | "pieChart"
  | "play"
  | "plus"
  | "refresh"
  | "robot"
  | "rocket"
  | "save"
  | "search"
  | "settings"
  | "share"
  | "shield"
  | "sliders"
  | "sparkles"
  | "stop"
  | "tag"
  | "trash"
  | "upload"
  | "user"
  | "users"
  | "workflow"
  | "x"
  | "zap";

const iconMap: Record<IconName, LucideIcon> = {
  activity: Activity,
  alert: AlertCircle,
  archive: Archive,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  barChart: BarChart3,
  bell: Bell,
  bolt: Bolt,
  book: BookOpen,
  bot: Bot,
  box: Box,
  brain: Brain,
  briefcase: Briefcase,
  building: Building2,
  calendar: Calendar,
  chart: PieChart,
  check: Check,
  checkCircle: CheckCircle2,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  circle: Circle,
  clock: Clock,
  code: Code,
  copy: Copy,
  cpu: Cpu,
  creditCard: CreditCard,
  database: Database,
  delete: Delete,
  document: FileText,
  download: Download,
  edit: Edit,
  fileText: FileText,
  filter: Filter,
  folder: Folder,
  globe: Globe,
  grid: Grid,
  help: HelpCircle,
  history: History,
  home: Home,
  image: Image,
  key: Key,
  layers: Layers,
  layoutDashboard: LayoutDashboard,
  loading: Loader2,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  message: MessageSquare,
  moreHorizontal: MoreHorizontal,
  moreVertical: MoreVertical,
  package: Package,
  pause: Pause,
  pieChart: PieChart,
  play: Play,
  plus: Plus,
  refresh: RefreshCw,
  robot: Bot,
  rocket: Rocket,
  save: Save,
  search: Search,
  settings: Settings,
  share: Share2,
  shield: Shield,
  sliders: Sliders,
  sparkles: Sparkles,
  stop: StopCircle,
  tag: Tag,
  trash: Trash2,
  upload: Upload,
  user: User,
  users: Users,
  workflow: Workflow,
  x: X,
  zap: Zap,
};

export interface IconProps extends LucideProps {
  name: IconName;
}

export function EnterpriseIcon({ name, className, ...props }: IconProps) {
  const Icon = (iconMap as Record<string, LucideIcon | undefined>)[name] ?? Circle;
  return <Icon className={className} aria-hidden="true" {...props} />;
}

export { IconPlaceholder } from "./placeholder";
