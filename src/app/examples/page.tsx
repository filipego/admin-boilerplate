"use client";

import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UIButton from "@/components/common/UIButton";
import UIModal from "@/components/common/UIModal";
import UIModalTwoColumn from "@/components/common/UIModalTwoColumn";
import { useState } from "react";

export default function ExamplesPage() {
  const [openFull, setOpenFull] = useState(false);
  const [openContent, setOpenContent] = useState(false);
  const [openTwoCol, setOpenTwoCol] = useState(false);
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
    </AppLayout>
  );
}


