"use client";

import { useState } from "react";
import UIButton from "@/components/common/UIButton";
import UITooltip from "@/components/common/UITooltip";
import { Clipboard, Check } from "lucide-react";
import { showSaved, showError } from "@/lib/toast";

export default function CopyButton({ value, label = "Copy", copiedLabel = "Copied", withTooltip = false, onCopied }: { value: string; label?: string; copiedLabel?: string; withTooltip?: boolean; onCopied?: () => void }) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
			} else {
				const textarea = document.createElement("textarea");
				textarea.value = value;
				textarea.style.position = "fixed";
				textarea.style.opacity = "0";
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
			}
			setCopied(true);
			showSaved("Copied to clipboard");
			onCopied?.();
			setTimeout(() => setCopied(false), 1500);
		} catch {
			showError("Failed to copy");
		}
	}

	const Btn = (
		<UIButton uiSize="sm" variant={copied ? "secondary" : "outline"} onClick={copy} className="gap-1">
			{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
			<span>{copied ? copiedLabel : label}</span>
		</UIButton>
	);

	if (withTooltip) {
		return <UITooltip content="Copy to clipboard">{Btn}</UITooltip>;
	}
	return Btn;
}


