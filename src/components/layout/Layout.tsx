import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";

type AppLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const AppLayout = ({ title, children }: AppLayoutProps) => {
  return (
    <div className="grid grid-cols-[auto_1fr] min-h-dvh">
      <Sidebar />
      <div className="min-w-0">
        <Header />
        <MainContent title={title}>{children}</MainContent>
      </div>
    </div>
  );
};

export default AppLayout;


