type MainContentProps = {
  title?: string;
  children: React.ReactNode;
};

const MainContent = ({ title, children }: MainContentProps) => {
  return (
    <div className="p-4 sm:p-6">
      {title ? (
        <h1 className="text-xl font-semibold tracking-tight mb-4">{title}</h1>
      ) : null}
      {children}
    </div>
  );
};

export default MainContent;


