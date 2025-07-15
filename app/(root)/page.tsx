'use client';

import React, { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Menu as MenuIcon,
  X as CloseIcon,
} from 'lucide-react';

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex w-full">
        {/* Sidebar desktop */}
        <aside className="sm:hidden md:block transition-all duration-200 w-60 border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-muted/80 rounded-xl my-6 ml-2 mr-6">
          <Sidebar collapsible="none" className="h-full w-60 p-4">
            <SidebarContent>
              <nav>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-3 font-semibold text-base hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      Dashboard
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-3 font-semibold text-base hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      Products
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-3 font-semibold text-base hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      Orders
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </nav>
            </SidebarContent>
          </Sidebar>
        </aside>
        {/* Sidebar mobile trigger */}
        <button
          className="md:hidden fixed top-4 left-4 z-40 bg-white dark:bg-muted/80 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow focus:outline-none"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6 text-primary" />
        </button>
        {/* Sidebar mobile modal */}
        {open && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
              onClick={() => setOpen(false)}
            />
            {/* Sidebar modal */}
            <aside className="relative bg-white dark:bg-muted/80 w-64 max-w-[80vw] h-full shadow-lg border-r border-gray-200 dark:border-gray-700 animate-slide-in-left">
              <Sidebar collapsible="none" className="h-full w-full p-4">
                <SidebarContent>
                  <nav>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="flex items-center gap-3 font-semibold text-base hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors">
                          <LayoutDashboard className="w-5 h-5 text-primary" />
                          Dashboard
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="flex items-center gap-3 font-semibold text-base hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors">
                          <ShoppingBag className="w-5 h-5 text-primary" />
                          Products
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="flex items-center gap-3 font-semibold text-base hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors">
                          <ClipboardList className="w-5 h-5 text-primary" />
                          Orders
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </nav>
                </SidebarContent>
              </Sidebar>
            </aside>
          </div>
        )}
        <main className="flex-1 p-4 min-w-0">Hello</main>
      </div>
    </SidebarProvider>
  );
}

// Thêm animation cho sidebar modal
// styles/globals.css hoặc tailwind.config.js:
// @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
// .animate-slide-in-left { animation: slide-in-left 0.2s cubic-bezier(0.4,0,0.2,1); }
