import { useState } from "react";
import { Menu, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WeatherWidget } from "@/components/weather-widget";
import { Separator } from "@/components/ui/separator";

export function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const handleNewChat = () => {
    window.location.reload();
  };

  return (
    <div 
      className={`relative h-full flex flex-col border-r border-[#1D1D1F] transition-all duration-300 bg-[#111112]/40 dark:bg-[#111112]/40 light:bg-[#F5F5F7]/40 backdrop-blur-xl bg-opacity-80 ${
        collapsed ? "w-[60px]" : "w-[280px]"
      }`}
    >
      <div className="p-4 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="h-4 w-4" />
        </Button>
        {!collapsed && (
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-[#1D1D1F] bg-opacity-50 border-[#2D2D2F] text-gray-300 hover:bg-[#2D2D2F] transition-all rounded-md"
            onClick={handleNewChat}
          >
            <PlusCircle className="h-4 w-4" />
            <span>New chat</span>
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="px-4">
          <WeatherWidget />
        </div>
      )}

      <ScrollArea className="flex-1 overflow-auto">
        {/* Previous chat history will be displayed here */}
      </ScrollArea>

      <div className={`p-3 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center border-t border-[#1D1D1F]`}>
        {!collapsed && <p className="text-xs text-gray-500">TalentForge v1.0</p>}
      </div>
    </div>
  );
}
