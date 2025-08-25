"use client";

import { 
  Tabs as ShadTabs, 
  TabsContent as ShadTabsContent, 
  TabsList as ShadTabsList, 
  TabsTrigger as ShadTabsTrigger 
} from "@/components/ui/tabs";

type UITabsProps = React.ComponentProps<typeof ShadTabs>;
type UITabsContentProps = React.ComponentProps<typeof ShadTabsContent>;
type UITabsListProps = React.ComponentProps<typeof ShadTabsList>;
type UITabsTriggerProps = React.ComponentProps<typeof ShadTabsTrigger>;

export function UITabs(props: UITabsProps) {
  return <ShadTabs {...props} />;
}

export function UITabsContent(props: UITabsContentProps) {
  return <ShadTabsContent {...props} />;
}

export function UITabsList(props: UITabsListProps) {
  return <ShadTabsList {...props} />;
}

export function UITabsTrigger(props: UITabsTriggerProps) {
  return <ShadTabsTrigger {...props} />;
}


