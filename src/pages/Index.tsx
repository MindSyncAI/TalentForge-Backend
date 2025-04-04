import { LeftSidebar } from "@/components/left-sidebar";
import { NewsWidget } from "@/components/news-widget";
import { ChatInterface } from "@/components/chat-interface";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden font-optima">
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 text-center border-b border-white/10 flex justify-between items-center dark:bg-black/30 light:bg-white/30 backdrop-blur-xl">
          <div className="w-40"></div> {/* Empty div to center the title */}
          <h1 className="text-xl font-bold text-talentforge-400 dark:text-talentforge-400 light:text-gray-800">TalentForge</h1>
          <div className="w-40 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0 dark:bg-black/30 light:bg-white/30 backdrop-blur-xl"></div>
          <ChatInterface />
        </div>
      </div>
      
      {/* Right News Sidebar */}
      <div className="w-[260px] h-full overflow-y-auto scrollbar-none bg-[#111112]/40 backdrop-blur-xl border-l border-white/10">
        <NewsWidget />
      </div>
    </div>
  );
};

export default Index;
