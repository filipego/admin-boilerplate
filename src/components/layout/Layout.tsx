import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";

type AppLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const AppLayout = ({ title, children }: AppLayoutProps) => {
  return (
    <div className="min-h-dvh grid grid-cols-1 md:grid-cols-[auto_1fr]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="min-w-0">
        <Header />
        <MainContent title={title}>{children}</MainContent>
      </div>
    </div>
  );
};

export default AppLayout;


