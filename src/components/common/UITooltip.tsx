"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export default function UITooltip({ content, children, side = "top" }: { content: string; children: React.ReactNode; side?: "top" | "right" | "bottom" | "left" }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent side={side} className="text-xs">
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export function HelpTooltip({ content, side = "top" }: { content: string; side?: "top" | "right" | "bottom" | "left" }) {
	return (
		<UITooltip content={content} side={side}>
			<button type="button" className="inline-flex items-center justify-center rounded-full p-1 hover:bg-accent cursor-pointer" aria-label="Help">
				<HelpCircle className="h-4 w-4" />
			</button>
		</UITooltip>
	);
}


