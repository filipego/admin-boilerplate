"use client";

import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UIButton from "@/components/common/UIButton";
import UIModal from "@/components/common/UIModal";
import UIModalTwoColumn from "@/components/common/UIModalTwoColumn";
import UIConfirm from "@/components/common/UIConfirm";
import { MESSAGES } from "@/lib/messages";
import UICard from "@/components/common/UICard";
import SearchBar from "@/components/common/SearchBar";
import ViewFilters from "@/components/common/ViewFilters";
import { useMemo, useState } from "react";
import CardsShowcase from "./CardsShowcase";

export default function ExamplesPage() {
  const [openFull, setOpenFull] = useState(false);
  const [openContent, setOpenContent] = useState(false);
  const [openTwoCol, setOpenTwoCol] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"list" | "grid-2" | "grid-3" | "grid-4" | "masonry">("grid-3");
  return (
    <AppLayout title="Examples">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">UIButton</CardTitle>
        </CardHeader>
        <CardContent className="space-x-2">
          <UIButton uiSize="sm">Small</UIButton>
          <UIButton>Medium</UIButton>
          <UIButton uiSize="lg">Large</UIButton>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">UIModal</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <UIButton onClick={() => setOpenFull(true)}>Open Fullscreen Modal</UIButton>
          <UIButton variant="outline" onClick={() => setOpenContent(true)}>Open Content Modal</UIButton>
          <UIButton variant="outline" onClick={() => setOpenTwoCol(true)}>Open Two-Column Modal</UIButton>
        </CardContent>
      </Card>

      <UIModal open={openFull} onOpenChange={setOpenFull} size="fullscreen" title="Fullscreen Modal" description="Demo of the fullscreen size">
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">This modal nearly fills the viewport.</p>
            <UIButton onClick={() => setOpenFull(false)}>Close</UIButton>
          </div>
        </div>
      </UIModal>

      <UIModalTwoColumn
        open={openTwoCol}
        onOpenChange={setOpenTwoCol}
        title="Two-Column Modal"
        description="50/50 columns in fullscreen modal"
        size="fullscreen"
        columnsClassName="md:grid-cols-2"
        left={
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Navigation</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Section A</li>
              <li>Section B</li>
              <li>Section C</li>
            </ul>
          </div>
        }
        right={
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Editor</h3>
            <textarea className="w-full px-3 py-2 rounded-md border bg-background" rows={10} placeholder="Type here..." />
            <div className="flex gap-2 justify-end">
              <UIButton onClick={() => setOpenTwoCol(false)}>Save</UIButton>
              <UIButton variant="outline" onClick={() => setOpenTwoCol(false)}>Cancel</UIButton>
            </div>
          </div>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Alerts</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <UIButton variant="destructive" onClick={() => setOpenConfirm(true)}>Open Confirm</UIButton>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Searchbar and View List</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchBar query={query} onQueryChange={setQuery} rightContent={<ViewFilters mode={mode} onModeChange={setMode} />} />
          <div className="h-3" />
          <CardsShowcase query={query} mode={mode} />
        </CardContent>
      </Card>

      {/* Basic cards demo kept */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">UICard (Basic Examples)</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <UICard
            title="Card with Image"
            description="This card shows a full-bleed thumbnail at the top."
            imageUrl="https://cdn.midjourney.com/73e48e39-046e-4033-808a-577d4b3ad526/0_0.png"
            unoptimizedImage
            onEdit={() => console.log("edit")}
            onDelete={() => console.log("delete")}
            buttonHref="/users"
            buttonLabel="Open"
          />
          <UICard
            title="Card without Image"
            description="When there is no image, content has extra top padding for balance."
            onEdit={() => console.log("edit")}
            onDelete={() => console.log("delete")}
            href="/dashboard"
          />
        </CardContent>
      </Card>

      <UIConfirm
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title={MESSAGES.confirmDelete.title}
        description={MESSAGES.confirmDelete.description}
        confirmLabel={MESSAGES.confirmDelete.confirmLabel}
        cancelLabel={MESSAGES.confirmDelete.cancelLabel}
        destructive
        onConfirm={() => setOpenConfirm(false)}
      />

      <UIModal open={openContent} onOpenChange={setOpenContent} size="content" title="Content Modal" description="Auto-sized to content" className="max-w-3xl">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">This modal demonstrates a richer content layout so it reads clearly as a modal (not an alert). It scales with the content up to a larger max width.</p>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Details</h3>
              <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin gravida, nunc non tristique placerat, urna arcu vulputate erat, id tempor lectus eros vitae ipsum.</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Responsive width up to ~3xl</li>
                <li>Standard body copy and lists</li>
                <li>Buttons in footer area</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Quick Form</h3>
              <div className="grid gap-2">
                <input className="px-3 py-2 rounded-md border bg-background" placeholder="First name" />
                <input className="px-3 py-2 rounded-md border bg-background" placeholder="Last name" />
                <textarea className="px-3 py-2 rounded-md border bg-background" placeholder="Notes" rows={4} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <UIButton onClick={() => setOpenContent(false)}>Save</UIButton>
            <UIButton variant="outline" onClick={() => setOpenContent(false)}>Cancel</UIButton>
          </div>
        </div>
      </UIModal>

      {/* Showcase helper */}
      <CardsShowcase.Definitions />
    </AppLayout>
  );
}


