'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileUp, 
  FileDown, 
  Settings,
} from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", type: "header" },
    { name: "Dashboard", href: "/ark_admin", icon: LayoutDashboard },
    
    { name: "Management", type: "header" },
    { name: "Students", href: "/ark_admin/students", icon: Users },
    { name: "Teachers", href: "/ark_admin/teachers", icon: Users },
    { name: "Import Excel", href: "/ark_admin/import", icon: FileUp },
    { name: "Export Reports", href: "/ark_admin/reports", icon: FileDown },
    
    { name: "System", type: "header" },
    { name: "Settings", href: "/ark_admin/settings", icon: Settings },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
      {navItems.map((item, index) => {
        if (item.type === "header") {
          return (
            <p key={index} className={`px-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ${index > 0 ? 'mt-6' : ''}`}>
              {item.name}
            </p>
          );
        }

        const isActive = pathname === item.href;
        const Icon = item.icon!;

        return (
          <Link 
            key={index} 
            href={item.href!} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
              isActive 
                ? 'bg-indigo-500/10 text-indigo-400' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Icon 
              size={18} 
              className={isActive ? 'scale-110' : 'group-hover:text-indigo-400 transition-colors'} 
            />
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
