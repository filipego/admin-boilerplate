"use client";

import { Separator as ShadSeparator } from "@/components/ui/separator";

type UISeparatorProps = React.ComponentProps<typeof ShadSeparator>;

export default function UISeparator(props: UISeparatorProps) {
  return <ShadSeparator {...props} />;
}


