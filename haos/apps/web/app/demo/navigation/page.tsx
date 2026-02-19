"use client";

import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";

export default function NavigationDemoPage() {
  return (
    <div className="h-screen flex">
      {/* Navigation Sidebar */}
      <div className="w-[72px] h-full">
        <NavigationSidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 bg-background dark:bg-[#2b2d31] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Navigation Sidebar Demo</h1>
          
          <div className="space-y-4">
            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-lg font-semibold mb-3">Discord-Clone Navigation Features</h2>
              <ul className="space-y-2 text-sm">
                <li>✅ Exact Discord colors: <code className="bg-muted px-1 rounded">dark:bg-[#1e1f22]</code></li>
                <li>✅ Server/Space icons with hover animation (rounded corners)</li>
                <li>✅ Add Space button with emerald hover effect</li>
                <li>✅ Separator line between add button and spaces</li>
                <li>✅ ScrollArea for space list</li>
                <li>✅ Mode toggle (dark/light theme)</li>
                <li>✅ User button at bottom</li>
              </ul>
            </div>
            
            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-lg font-semibold mb-3">HAOS Adaptations</h2>
              <ul className="space-y-2 text-sm">
                <li>🔄 Matrix Spaces instead of Discord Servers</li>
                <li>🔄 Matrix user context instead of Clerk authentication</li>
                <li>🔄 Modal system for creating Matrix spaces</li>
                <li>🔄 Navigation routes adapted for HAOS structure</li>
              </ul>
            </div>

            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-lg font-semibold mb-3">CSS Variables Applied</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Light Mode:</strong>
                  <ul className="mt-1 space-y-1">
                    <li><code className="bg-muted px-1 rounded">--background: 0 0% 100%</code></li>
                    <li><code className="bg-muted px-1 rounded">--foreground: 20 14.3% 4.1%</code></li>
                    <li><code className="bg-muted px-1 rounded">--primary: 24 9.8% 10%</code></li>
                  </ul>
                </div>
                <div>
                  <strong>Dark Mode:</strong>
                  <ul className="mt-1 space-y-1">
                    <li><code className="bg-muted px-1 rounded">--background: 20 14.3% 4.1%</code></li>
                    <li><code className="bg-muted px-1 rounded">--foreground: 60 9.1% 97.8%</code></li>
                    <li><code className="bg-muted px-1 rounded">--primary: 60 9.1% 97.8%</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}