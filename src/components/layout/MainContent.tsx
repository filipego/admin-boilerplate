type MainContentProps = {
  title?: string;
  children: React.ReactNode;
};

const MainContent = ({ title, children }: MainContentProps) => {
  return (
    <div className="p-4 sm:p-6">
      {title ? (
        <Heading as="h2" size="lg" className="tracking-tight mb-4">{title}</Heading>
      ) : null}
      {children}
    </div>
  );
};

export default MainContent;

import { Heading } from "@/components/common/Heading";
