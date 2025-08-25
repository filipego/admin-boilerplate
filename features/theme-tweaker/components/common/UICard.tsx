"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import UIButton from "./UIButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type UICardProps = {
  title: string;
  description?: string;
  imageUrl?: string | null;
  className?: string;
  unoptimizedImage?: boolean;
  // Actions
  onEdit?: () => void;
  onDelete?: () => void;
  // Linking
  href?: string; // make entire card clickable
  buttonHref?: string; // show a button link in footer
  buttonLabel?: string;
};

export default function UICard({
  title,
  description,
  imageUrl,
  className,
  unoptimizedImage,
  onEdit,
  onDelete,
  href,
  buttonHref,
  buttonLabel = "Open",
}: UICardProps) {
  const hasImage = Boolean(imageUrl);

  return (
    <div className={cn("relative group", className)}>
      <Card className={cn("overflow-hidden", hasImage && "pt-0")}> 
        {/* Image block (edge-to-edge) */}
        {hasImage ? (
          <div className="relative">
            <Image
              src={imageUrl!}
              alt=""
              width={1200}
              height={400}
              sizes="100vw"
              className="block w-full h-40 object-cover"
              unoptimized={Boolean(unoptimizedImage)}
            />
            <div className="absolute top-2 right-2">
              <ActionsMenu onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        ) : null}

        {/* Content */}
        <div className={cn("space-y-2", hasImage ? "px-5 pb-4 pt-0" : "px-5 py-4")}> 
          {/* Header row when no image to place menu */}
          {!hasImage ? (
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold leading-tight mt-1">{title}</h3>
              </div>
              <ActionsMenu onEdit={onEdit} onDelete={onDelete} />
            </div>
          ) : (
            <h3 className="font-semibold leading-tight">{title}</h3>
          )}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}

          {buttonHref ? (
            <div className="pt-2">
              <UIButton asChild uiSize="sm">
                <Link href={buttonHref}>{buttonLabel}</Link>
              </UIButton>
            </div>
          ) : null}
        </div>

        {/* Full-card link overlay */}
        {href ? (
          <Link href={href} className="absolute inset-0" aria-label={title} />
        ) : null}
      </Card>
    </div>
  );
}

function ActionsMenu({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  const hasAny = onEdit || onDelete;
  if (!hasAny) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="inline-flex items-center justify-center rounded-md p-1.5 bg-background/70 hover:bg-accent hover:text-accent-foreground border text-foreground cursor-pointer">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit ? (
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
        ) : null}
        {onDelete ? (
          <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


