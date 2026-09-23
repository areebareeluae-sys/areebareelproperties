"use client";
import { useState } from 'react';
import Link from 'next/link';
import { HeaderItem } from '../../../../types/layout/menu';
import { usePathname } from 'next/navigation';

const HeaderLink: React.FC<{ item: HeaderItem }> = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const path = usePathname();

  const menuChildren = item.submenu || (item as any).children;
  const isHissa = item.label === "Hissa";

  const handleMouseEnter = () => {
    if (menuChildren && menuChildren.length > 0) {
      setSubmenuOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setSubmenuOpen(false);
  };

  return (
    <div
      className="relative group py-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link 
        href={item.href || "#"} 
        className={`text-base flex items-center gap-1.5 py-2 px-3 transition-colors duration-200 rounded-md relative ${
          isHissa ? 'font-bold text-primary dark:text-primary' : 'font-normal'
        } ${
          path === item.href 
            ? '!text-primary font-medium' 
            : 'text-midnight_text dark:text-white hover:text-primary dark:hover:text-primary'
        }`}
      >
        {/* Chota sa red 'HOT' badge agar label Hissa ho */}
        {isHissa && (
          <span className="absolute -top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full uppercase tracking-tighter leading-none shadow-sm animate-pulse">
            HOT
          </span>
        )}

        {item.label}
        {menuChildren && menuChildren.length > 0 && (
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" className={`transition-transform duration-200 ${submenuOpen ? "rotate-180" : ""}`}>
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m7 10l5 5l5-5" />
          </svg>
        )}
      </Link>

      {submenuOpen && menuChildren && menuChildren.length > 0 && (
        <div 
          className="absolute left-0 top-full pt-1 w-60 z-50"
          data-aos="fade-up" 
          data-aos-duration="200"
        >
          <div className="py-2 bg-white dark:bg-darkmode shadow-xl dark:shadow-darkmd rounded-lg border border-border dark:border-dark_border">
            {menuChildren.map((subItem: any, index: number) => (
              <Link 
                key={index} 
                href={subItem.href} 
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  path === subItem.href 
                    ? 'text-white bg-primary hover:bg-blue-700' 
                    : 'text-midnight_text dark:text-white hover:bg-gray-100 dark:hover:bg-semidark'
                }`}
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderLink;