import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export function Layout({ children, pageTitle }: LayoutProps) {
  return (
    <div className="w-full h-full">
      {pageTitle && (
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
} 