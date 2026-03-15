<script setup lang="ts">
import {
  Plus,
  Workflow,
  ChevronRight,
  ArrowLeft,
  Zap,
  Search,
  ChevronDown,
  Box,
  Minus,
  Play,
  MoreVertical,
  Maximize2,
  ArrowRight,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Cpu,
  Database,
  HardDrive,
  GitBranch,
  Globe,
  ArrowLeftRight,
  ClipboardList,
  Puzzle,
  Send,
  Layers,
  PanelRightOpen,
  PanelRightClose,
  GripVertical,
  SearchX,
} from "lucide-vue-next";

const iconMap: Record<string, any> = {
  plus: Plus,
  workflow: Workflow,
  "chevron-right": ChevronRight,
  "arrow-left": ArrowLeft,
  zap: Zap,
  search: Search,
  "search-x": SearchX,
  "chevron-down": ChevronDown,
  box: Box,
  minus: Minus,
  play: Play,
  "more-vertical": MoreVertical,
  "maximize-2": Maximize2,
  "arrow-right": ArrowRight,
  "layout-dashboard": LayoutDashboard,
  rocket: Rocket,
  "shield-check": ShieldCheck,
  cpu: Cpu,
  database: Database,
  "hard-drive": HardDrive,
  "git-branch": GitBranch,
  globe: Globe,
  "arrow-left-right": ArrowLeftRight,
  "clipboard-list": ClipboardList,
  puzzle: Puzzle,
  send: Send,
  layers: Layers,
  "panel-right-open": PanelRightOpen,
  "panel-right-close": PanelRightClose,
  "grip-vertical": GripVertical,
};

const props = withDefaults(
  defineProps<{
    name: string;
    class?: string;
  }>(),
  { class: "" }
);

const iconName = computed(() => {
  const n = props.name.replace(/^lucide:/, "").toLowerCase();
  return n;
});

const IconComponent = computed(() => iconMap[iconName.value] ?? Box);
</script>

<template>
  <component
    :is="IconComponent"
    :class="props.class"
    stroke-width="1.5"
    size="1em"
  />
</template>
