import MainContent from "@/components/layout/MainContent";

type AppLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const AppLayout = ({ title, children }: AppLayoutProps) => {
  // Shell (Sidebar/Header) now lives in app/layout.tsx AuthShell.
  // This component only provides the page content wrapper and title area.
  return <MainContent title={title}>{children}</MainContent>;
};

export default AppLayout;


