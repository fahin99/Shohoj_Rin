import { useState } from 'react';
import type { ReactNode } from 'react';
interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}
interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  variant?: 'underline' | 'pill' | 'card';
  className?: string;
}
export function Tabs({ tabs, activeTab, onChange, variant = 'underline', className = '' }: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.id ?? '');
  const active = activeTab ?? internal;
  const setActive = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };
  if (variant === 'pill') {
    return (
      <div className={`flex gap-1 p-1 bg-stone-100 rounded-[6px] border border-stone-200 w-fit ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[4px] transition-all duration-150 ${
              active === tab.id
                ? 'bg-white text-navy shadow-nb-xs border border-stone-200'
                : 'text-stone-500 hover:text-navy'
            }`}
          >
            {tab.icon && <span className="text-xs">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                active === tab.id ? 'bg-teal-light text-teal' : 'bg-stone-200 text-stone-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }
  if (variant === 'card') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-[6px] border-[1.5px] transition-all duration-150 ${
              active === tab.id
                ? 'bg-white text-navy border-navy shadow-nb-sm'
                : 'bg-transparent text-stone-500 border-stone-200 hover:border-stone-300 hover:text-navy'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs tabular-nums ${active === tab.id ? 'text-teal' : 'text-stone-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className={`flex border-b border-stone-200 gap-0 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActive(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-150 ${
            active === tab.id
              ? 'text-teal border-teal'
              : 'text-stone-500 border-transparent hover:text-navy hover:border-stone-300'
          }`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
              active === tab.id ? 'bg-teal-light text-teal' : 'bg-stone-100 text-stone-500'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
}
export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (id !== activeTab) return null;
  return <div role="tabpanel">{children}</div>;
}
export function useTabs(defaultTab: string) {
  const [active, setActive] = useState(defaultTab);
  return { active, setActive };
}
