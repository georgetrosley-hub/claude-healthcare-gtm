"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClaudeSparkle } from "@/components/ui/claude-logo";
import {
  FileText,
  Users,
  MessageCircle,
  LayoutDashboard,
  Radar,
  Workflow,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  TrendingUp,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  GitBranch,
  Cpu,
  Shield,
  Crosshair,
  Calculator,
  Lightbulb,
} from "lucide-react";

const sectionGroups = [
  {
    label: "Territory",
    items: [
      { id: "overview", label: "War Room", icon: LayoutDashboard },
      { id: "accountIntelligence", label: "Account Intelligence", icon: Crosshair },
      { id: "pipeline", label: "Pipeline", icon: BarChart3 },
      { id: "dealSimulation", label: "Deal Simulation", icon: GitBranch },
      { id: "dealProgression", label: "Deal Progression", icon: TrendingUp },
      { id: "accountLog", label: "Account Log", icon: ClipboardList },
      { id: "stakeholders", label: "Stakeholder Map", icon: Users },
      { id: "execution", label: "Deal Plan", icon: Workflow },
    ],
  },
  {
    label: "Execution",
    items: [
      { id: "first90Days", label: "First 90 Days", icon: CalendarCheck },
      { id: "signals", label: "Deal Signals", icon: Radar },
      { id: "artifacts", label: "Field Kit", icon: FileText },
    ],
  },
  {
    label: "GTM Intel",
    items: [
      { id: "useCaseLibrary", label: "Use Case Library", icon: Lightbulb },
      { id: "roiCalculator", label: "ROI Calculator", icon: Calculator },
      { id: "territoryEngine", label: "Territory Engine", icon: Cpu },
      { id: "enterpriseComparison", label: "Claude vs Competitors", icon: Shield },
    ],
  },
] as const;

type SectionItem = (typeof sectionGroups)[number]["items"][number];
export type SectionId = SectionItem["id"];

interface SidebarProps {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
  onOpenChat: () => void;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
}

interface SidebarBodyProps {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
  onOpenChat: () => void;
  compact?: boolean;
  onToggleCollapsed?: () => void;
  onCloseMobile?: () => void;
}

function SidebarBody({
  activeSection,
  onSectionChange,
  onOpenChat,
  compact = false,
  onToggleCollapsed,
  onCloseMobile,
}: SidebarBodyProps) {
  const handleSectionSelect = (id: SectionId) => {
    onSectionChange(id);
    onCloseMobile?.();
  };

  return (
    <>
      <div className={cn("relative px-5 py-5", compact && "px-3 py-4")}>
        <div className="flex items-center justify-between gap-2">
          <div className={cn("flex items-center gap-2", compact && "justify-center")}>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-claude-coral/10">
              <ClaudeSparkle size={14} className="text-claude-coral" />
            </div>
            {!compact && (
              <div>
                <h1 className="text-[13px] font-semibold tracking-tight text-text-primary">
                  Claude
                </h1>
                <p className="text-[11px] text-text-muted">
                  Healthcare GTM
                </p>
              </div>
            )}
          </div>
          {onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted/40 hover:text-text-secondary lg:inline-flex"
              aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
              title={compact ? "Expand sidebar" : "Collapse sidebar"}
            >
              {compact ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted/40 hover:text-text-secondary lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className={cn("px-3 pb-3", compact && "px-2")}>
        <button
          type="button"
          onClick={() => {
            onOpenChat();
            onCloseMobile?.();
          }}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-claude-coral/20 bg-claude-coral/[0.06] px-3 py-3 text-[12px] font-medium text-claude-coral/90 transition-colors active:bg-claude-coral/10 hover:bg-claude-coral/10",
            compact && "justify-center px-0 py-2 min-h-[40px]"
          )}
          aria-label="Ask Claude"
          title="Ask Claude"
        >
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
          {!compact && "Ask Claude"}
        </button>
      </div>

      <nav className={cn("flex-1 overflow-y-auto px-3 py-1", compact && "px-2")}>
        {sectionGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!compact && (
              <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint/70">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSectionSelect(id)}
                    className={cn(
                      "group flex w-full min-h-[44px] items-center gap-2 rounded-md px-3 py-3 text-left text-[13px] transition-all duration-150 active:bg-surface-muted/40",
                      compact && "justify-center px-0 py-2 min-h-[40px]",
                      isActive
                        ? "bg-surface-muted/50 text-text-primary"
                        : "text-text-muted hover:bg-surface-muted/30 hover:text-text-secondary"
                    )}
                    aria-label={label}
                    title={label}
                  >
                    <Icon
                      className={cn(
                        "h-[14px] w-[14px] shrink-0 transition-colors duration-200",
                        isActive ? "text-claude-coral/70" : "opacity-45 group-hover:opacity-70"
                      )}
                      strokeWidth={1.8}
                    />
                    {!compact && (
                      <span className={cn(isActive && "font-medium")}>{label}</span>
                    )}
                    {isActive && !compact && (
                      <span className="ml-auto h-1 w-1 rounded-full bg-claude-coral/60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("mt-auto border-t border-surface-border/30 px-5 py-4", compact && "px-3")}>
        <div className={cn("flex items-center gap-2.5", compact && "justify-center")}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted/80 text-[10px] font-semibold text-text-secondary ring-1 ring-surface-border/50">
            GT
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-text-secondary">George Trosley</p>
              <p className="text-[10px] text-text-faint">Enterprise AE · Strategic</p>
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div className="px-5 pb-4">
          <p className="text-[10px] text-text-faint/60">
            Powered by Anthropic
          </p>
        </div>
      )}
    </>
  );
}

export function Sidebar({
  activeSection,
  onSectionChange,
  onOpenChat,
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 border-r border-surface-border/40 bg-surface-elevated/20 transition-[width] duration-200 lg:flex lg:flex-col",
          collapsed ? "lg:w-20" : "lg:w-56"
        )}
      >
        <SidebarBody
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onOpenChat={onOpenChat}
          compact={collapsed}
          onToggleCollapsed={onToggleCollapsed}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onCloseMobile}
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col border-r border-surface-border/40 bg-surface shadow-2xl lg:hidden"
            >
              <SidebarBody
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onOpenChat={onOpenChat}
                onCloseMobile={onCloseMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
