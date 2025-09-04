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
import { useState } from "react";
import CardsShowcase from "./CardsShowcase";
import PageHeader from "@/components/common/PageHeader";
import { Heading } from "@/components/common/Heading";
import ContentTabs, { type TabItem } from "@/components/common/ContentTabs";
import DataTable from "@/components/common/DataTable";
import type { DataTableStateSnapshot } from "@/components/common/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { RHFForm } from "@/components/common/form/Form";
import { TextField, TextAreaField } from "@/components/common/form/Fields";
import { z } from "zod";
import StatusBadge from "@/components/common/StatusBadge";
import StatCard from "@/components/common/StatCard";
import Chart from "@/components/common/Chart";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PaginationBar from "@/components/common/PaginationBar";
import FiltersDrawer from "@/components/common/FiltersDrawer";
import CommandPalette from "@/components/common/CommandPalette";
import SmallCalendar from "@/components/common/SmallCalendar";
import FullCalendar from "@/components/common/FullCalendar";
import { LoadingListSkeleton, EmptyState, ErrorState } from "@/components/common/AsyncStates";
import ModalForm from "@/components/common/ModalForm";
import Stepper, { type Step } from "@/components/common/Stepper";
import ActivityFeed from "@/components/common/ActivityFeed";
import TagInput from "@/components/common/TagInput";
import { AbilityProvider, Can } from "@/components/auth/Access";
import DateRangePicker from "@/components/common/DateRangePicker";
import DrawerForm from "@/components/common/DrawerForm";
import SidePanel from "@/components/common/SidePanel";
import ToolbarChips from "@/components/common/ToolbarChips";
import SavedViews from "@/components/common/SavedViews";
import NotificationBell from "@/components/common/Notifications";
import CsvImport from "@/components/common/CsvImport";
import UserAvatarMenu from "@/components/common/UserAvatarMenu";
import SettingsLayout from "@/components/common/SettingsLayout";
import FeatureFlags from "@/components/common/FeatureFlags";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import KanbanBoard from "@/components/common/KanbanBoard";
import NotesBoard from "@/components/common/NotesBoard";
import AdvancedFileUploader from "@/components/uploader/AdvancedFileUploader";
import UITooltip, { HelpTooltip } from "@/components/common/UITooltip";
import CopyButton from "@/components/common/CopyButton";
import Kbd from "@/components/common/Kbd";
import ProgressMini from "@/components/common/ProgressMini";
import LoadingOverlay from "@/components/common/LoadingOverlay";
// import Loader from "@/components/common/Loader";

export default function ExamplesPage() {
  const [openFull, setOpenFull] = useState(false);
  const [openContent, setOpenContent] = useState(false);
  const [openTwoCol, setOpenTwoCol] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<"list" | "grid" | "masonry">("grid");
  const [columns, setColumns] = useState<2 | 3 | 4>(3);
  const [activeTab, setActiveTab] = useState("all");
  const tabs: TabItem[] = [
    { id: "all", label: "All Notes", count: 13, content: <div className="text-sm text-muted-foreground">All notes content</div> },
    { id: "pinned", label: "Pinned Notes", count: 3, content: <div className="text-sm text-muted-foreground">Pinned notes content</div> },
    { id: "uncategorised", label: "Uncategorised", count: 1, content: <div className="text-sm text-muted-foreground">Uncategorised content</div> },
    { id: "shared", label: "Shared with Me", count: 1, content: <div className="text-sm text-muted-foreground">Shared content</div> },
  ];

  type Person = { name: string; email: string; role: string };
  const people: Person[] = [
    { name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
    { name: "Bob Smith", email: "bob@example.com", role: "Client" },
    { name: "Carol Perez", email: "carol@example.com", role: "Client" },
    { name: "David Lee", email: "david@example.com", role: "Admin" },
  ];
  const tableColumns: ColumnDef<Person>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
  ];

  const profileSchema = z.object({
    displayName: z.string().min(2, "Name too short"),
    bio: z.string().max(200).optional(),
  });
  const chartData = Array.from({ length: 12 }, (_, i) => ({ x: `M${i + 1}`, y: Math.round(50 + Math.random() * 50) }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pageIdx, setPageIdx] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [openModalForm, setOpenModalForm] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const steps: Step[] = [
    { id: "s1", title: "Details", description: "Provide basic info", content: <div className="grid gap-2"><input className="px-3 py-2 rounded-md border bg-background" placeholder="Field A" /><input className="px-3 py-2 rounded-md border bg-background" placeholder="Field B" /></div> },
    { id: "s2", title: "Settings", description: "Configuration", content: <div className="grid gap-2"><input className="px-3 py-2 rounded-md border bg-background" placeholder="Field C" /></div> },
    { id: "s3", title: "Review", description: "Confirm and submit", content: <div className="text-sm text-muted-foreground">Everything looks good.</div> },
  ];
  const [chips, setChips] = useState([{ id: "status", label: "Status: Active" }, { id: "role", label: "Role: Admin" }]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [tableViewState, setTableViewState] = useState<DataTableStateSnapshot>({ sorting: [], globalFilter: "", columnVisibility: {} });
  const [tableKey, setTableKey] = useState(0);
  return (
    <AppLayout title="Examples">
      <PageHeader
        title="Notes"
        description="Personal notes and documentation for planning and brainstorming"
        action={
          <div className="flex items-center gap-2">
            <NotificationBell items={[{ id: "1", title: "Welcome to the demo", time: "Just now" }]} />
            <UserAvatarMenu fallbackTransparent={false} />
            <UIButton onClick={() => setUploaderOpen(true)}>Advanced Uploader</UIButton>
            <UIButton>New Note</UIButton>
          </div>
        }
        className="mb-6"
      />
      <ContentTabs
        items={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      />

      {/* Headings demo (no h1s in admin) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Headings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Levels (semantic)</div>
            <div className="space-y-1">
              <Heading as="h2" size="lg">Heading h2</Heading>
              <Heading as="h3" size="md">Heading h3</Heading>
              <Heading as="h4" size="md">Heading h4</Heading>
              <Heading as="h5" size="sm">Heading h5</Heading>
              <Heading as="h6" size="xs">Heading h6</Heading>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Size scale</div>
            <div className="space-y-1">
              <Heading as="h2" size="2xl">Heading size 2xl</Heading>
              <Heading as="h2" size="xl">Heading size xl</Heading>
              <Heading as="h2" size="lg">Heading size lg</Heading>
              <Heading as="h2" size="md">Heading size md</Heading>
              <Heading as="h2" size="sm">Heading size sm</Heading>
              <Heading as="h2" size="xs">Heading size xs</Heading>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">UIButton <span className="align-middle ml-1 inline-block"><HelpTooltip content="Universal button wrapper for consistent sizing and styling." /></span></CardTitle>
        </CardHeader>
        <CardContent className="space-x-2">
          <UITooltip content="Small size"><UIButton uiSize="sm">Small</UIButton></UITooltip>
          <UIButton>Medium</UIButton>
          <UIButton uiSize="lg">Large</UIButton>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Stepper / Wizard</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper steps={steps} active={activeStep} onActiveChange={setActiveStep} />
          <div className="mt-3">
            <ProgressMini variant="steps" current={activeStep + 1} total={steps.length} showLabel />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            items={[
              { id: "1", title: "User signed in", description: "via Google", time: "Just now" },
              { id: "2", title: "Order #1002 paid", description: "$42.00", time: "2h ago" },
              { id: "3", title: "Project archived", description: "Marketing Site", time: "Yesterday" },
            ]}
          />
        </CardContent>
      </Card>

      <FiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        onApply={() => setFiltersOpen(false)}
        onReset={() => setFiltersOpen(false)}
      >
        <TextField name="q" label="Query" placeholder="Search term" />
        <TextField name="tag" label="Tag" placeholder="Any" />
      </FiltersDrawer>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Async States</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm font-medium mb-2">Loading (Skeleton)</div>
            <LoadingListSkeleton rows={4} />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Empty</div>
            <EmptyState actionLabel="Create Item" onAction={() => console.log("create")} />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Error</div>
            <ErrorState onRetry={() => console.log("retry")} />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Calendars</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm font-medium mb-2">Small Calendar</div>
            <SmallCalendar selected={selectedDate} onSelect={setSelectedDate} />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Full Calendar (basic)</div>
            <FullCalendar
              events={[
                { id: "1", title: "Design Review", date: new Date(new Date().setDate(5)) },
                { id: "2", title: "Release", date: new Date(new Date().setDate(12)) },
                { id: "3", title: "Sprint Planning", date: new Date(new Date().setDate(18)) },
              ]}
            />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Date Range Picker</div>
            <DateRangePicker />
          </div>
        </CardContent>
      </Card>

      <CommandPalette
        items={[
          { id: "dashboard", label: "Go to Dashboard", href: "/dashboard" },
          { id: "users", label: "Open Users", href: "/users" },
          { id: "profile", label: "Open Profile", href: "/profile" },
        ]}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Breadcrumbs + Chart <span className="align-middle ml-1 inline-block"><HelpTooltip content="Simple breadcrumbs and a themed chart wrapper." /></span></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <UITooltip content="Navigate back to Dashboard">
              <div>
                <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]} />
              </div>
            </UITooltip>
            <UIButton uiSize="sm" variant="outline" onClick={async () => { setSectionLoading(true); await new Promise((r) => setTimeout(r, 1200)); setSectionLoading(false); }}>Simulate Load</UIButton>
          </div>
          <div className="mt-4">
            <LoadingOverlay loading={sectionLoading}>
              <Chart data={chartData} />
            </LoadingOverlay>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <CopyButton value="https://admin-boilerplate-blond.vercel.app/" withTooltip />
            <CopyButton value="secret-token-123" label="Copy token" copiedLabel="Token copied" />
            <span className="text-xs text-muted-foreground">Open palette</span>
            <Kbd keys={["Mod", "K"]} />
            <div className="ml-auto w-48">
              <ProgressMini variant="percent" value={64} showLabel />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Settings Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsLayout
            sections={[
              { id: "profile", title: "Profile", content: <div className="grid gap-2"><input name="username" className="px-3 py-2 rounded-md border bg-background" placeholder="Username" /><input name="email" className="px-3 py-2 rounded-md border bg-background" placeholder="Email" /></div> },
              { id: "preferences", title: "Preferences", content: <div className="grid gap-2"><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="notifications" /> Enable notifications</label></div> },
              { id: "security", title: "Security", content: <div className="grid gap-2"><input name="2fa" className="px-3 py-2 rounded-md border bg-background" placeholder="2FA Code" /></div> },
            ]}
            className="h-[70vh]"
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureFlags
            flags={[
              { key: "newDashboard", label: "New Dashboard", description: "Enable the redesigned dashboard" },
              { key: "betaUploads", label: "Beta Uploads" },
            ]}
            storageKey="example-feature-flags"
            onChange={(s) => console.log("flags", s)}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Kanban</CardTitle>
        </CardHeader>
        <CardContent>
          <KanbanBoard
            initial={[
              { id: "todo", title: "To Do", cards: [{ id: "c1", title: "Design hero" }, { id: "c2", title: "Write API spec" }] },
              { id: "doing", title: "In Progress", cards: [{ id: "c3", title: "Auth flow" }] },
              { id: "done", title: "Done", cards: [{ id: "c4", title: "Skeleton states" }] },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Notes Board</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesBoard initial={[{ id: "n1", text: "Collect brand assets" }, { id: "n2", text: "Draft onboarding copy" }]} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Error Boundary</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Demo component that throws during render after a state change (so the boundary catches it)
            const CrashDemo = () => {
              const [boom, setBoom] = useState(false);
              if (boom) {
                throw new Error("Demo crash");
              }
              return (
                <UIButton variant="outline" onClick={() => setBoom(true)}>Trigger Error</UIButton>
              );
            };
            return (
              <ErrorBoundary>
                <CrashDemo />
              </ErrorBoundary>
            );
          })()}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Tags & Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TagInput />
          <AbilityProvider role="admin">
            <Can role="admin">
              <div className="text-sm text-muted-foreground">This block is visible only to admins.</div>
            </Can>
          </AbilityProvider>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Toolbar Chips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <ToolbarChips chips={chips} onRemove={(id) => setChips((s) => s.filter((c) => c.id !== id))} onClear={() => setChips([])} />
            <UIButton variant="outline" onClick={() => setDrawerOpen(true)}>Open Drawer Form</UIButton>
            <UIButton variant="outline" onClick={() => setPanelOpen(true)}>Open Side Panel</UIButton>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Form (RHF + Zod)</CardTitle>
        </CardHeader>
        <CardContent>
          <RHFForm
            schema={profileSchema}
            defaultValues={{ displayName: "", bio: "" }}
            onSubmit={(values) => {
              console.log("submit", values);
            }}
          >
            <TextField name="displayName" label="Display Name" placeholder="Your name" />
            <TextAreaField name="bio" label="Bio" placeholder="Short description" />
            <div className="flex justify-end">
              <UIButton type="button" onClick={() => setOpenModalForm(true)}>Open Modal Form</UIButton>
            </div>
          </RHFForm>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">CSV Import</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium mb-2">Map to fields: name, email, role</div>
          <CsvImport fields={["name", "email", "role"]} onComplete={(rows) => console.log("imported", rows)} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">DataTable</CardTitle>
        </CardHeader>
        <CardContent>
          <SavedViews
            storageKey="examples-people-table"
            current={tableViewState}
            onLoad={(s) => { setTableViewState(s); setTableKey((k) => k + 1); }}
            className="mb-3"
          />
          <DataTable
            key={tableKey}
            columns={tableColumns}
            data={people}
            initialSorting={tableViewState.sorting}
            initialGlobalFilter={tableViewState.globalFilter}
            initialColumnVisibility={tableViewState.columnVisibility}
            onStateChange={setTableViewState}
          />
          <div className="mt-3">
            <PaginationBar page={pageIdx} pageCount={5} onPrev={() => setPageIdx((p) => Math.max(1, p - 1))} onNext={() => setPageIdx((p) => Math.min(5, p + 1))} />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">StatusBadge</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
          <StatusBadge>Default</StatusBadge>
          <StatusBadge status="success">Active</StatusBadge>
          <StatusBadge status="warning">Pending</StatusBadge>
          <StatusBadge status="destructive">Error</StatusBadge>
          <StatusBadge status="info">Info</StatusBadge>
          <StatusBadge size="md" status="success">Large</StatusBadge>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Stat Cards</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue" value="$24,300" deltaLabel="+12%" deltaStatus="success" />
          <StatCard label="Active Users" value="1,204" deltaLabel="+2%" deltaStatus="info" />
          <StatCard label="Errors" value="7" deltaLabel="-18%" deltaStatus="success" />
          <StatCard label="Churn" value="3.2%" deltaLabel="+0.3%" deltaStatus="warning" />
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
            <Heading as="h3" size="sm">Navigation</Heading>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Section A</li>
              <li>Section B</li>
              <li>Section C</li>
            </ul>
          </div>
        }
        right={
          <div className="space-y-3">
            <Heading as="h3" size="sm">Editor</Heading>
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
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            rightContent={
              <ViewFilters
                layout={layout}
                onLayoutChange={setLayout}
                columns={columns}
                onColumnsChange={setColumns}
                enableList
                enableGrid
                enableMasonry
                enableCols2
                enableCols3
                enableCols4
              />
            }
          />
          <div className="h-3" />
          <CardsShowcase query={query} layout={layout} columns={columns} />
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

      <AdvancedFileUploader
        open={uploaderOpen}
        onOpenChange={setUploaderOpen}
        title="Advanced Upload"
        description="Select multiple images and optionally compress before uploading."
        folder="uploads/examples"
        accept="image/*,application/pdf"
        enableCompressionDefault
        onUploadComplete={(urls) => {
          console.log("uploaded urls", urls);
        }}
      />

      <UIModal open={openContent} onOpenChange={setOpenContent} size="content" title="Content Modal" description="Auto-sized to content" className="max-w-3xl">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">This modal demonstrates a richer content layout so it reads clearly as a modal (not an alert). It scales with the content up to a larger max width.</p>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <Heading as="h3" size="sm">Details</Heading>
              <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin gravida, nunc non tristique placerat, urna arcu vulputate erat, id tempor lectus eros vitae ipsum.</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Responsive width up to ~3xl</li>
                <li>Standard body copy and lists</li>
                <li>Buttons in footer area</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Heading as="h3" size="sm">Quick Form</Heading>
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
      <ModalForm
        open={openModalForm}
        onOpenChange={setOpenModalForm}
        title="Create Item"
        description="Example of a modal form with optimistic toasts"
        schema={profileSchema}
        defaultValues={{ displayName: "", bio: "" }}
        onSubmit={async () => {
          await new Promise((r) => setTimeout(r, 800));
        }}
      >
        <TextField name="displayName" label="Display Name" placeholder="Your name" />
        <TextAreaField name="bio" label="Bio" placeholder="Short description" />
      </ModalForm>

      <DrawerForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Create via Drawer"
        schema={profileSchema}
        defaultValues={{ displayName: "", bio: "" }}
        onSubmit={async () => { await new Promise((r) => setTimeout(r, 400)); setDrawerOpen(false); }}
      >
        <TextField name="displayName" label="Display Name" />
        <TextAreaField name="bio" label="Bio" />
      </DrawerForm>

      <SidePanel open={panelOpen} onOpenChange={setPanelOpen}>
        <div className="space-y-2">
          <Heading as="h3" size="sm">Details</Heading>
          <p className="text-sm text-muted-foreground">This side panel can show row details.</p>
        </div>
      </SidePanel>

      {/* Empty State (Illustration) standalone demo */}
      <Card className="mt-6 mb-10">
        <CardHeader>
          <CardTitle className="text-base">Empty State (Illustration)</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started."
            actionLabel="New Project"
            onAction={() => console.log("new project")}
            illustration={
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground/40">
                <rect x="3" y="3" width="18" height="14" rx="2" ry="2" />
                <path d="M7 7h6M7 11h10" />
                <circle cx="8" cy="20" r="2" />
                <circle cx="17" cy="20" r="2" />
              </svg>
            }
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
