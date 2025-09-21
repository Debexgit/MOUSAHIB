
'use client';

import { toolsData, type Tool, type ToolGroup } from '@/lib/tools';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import ToolModal from './tool-modal';
import { Card } from './ui/card';
import { Input } from './ui/input';

const groupColors = {
  blue: 'border-blue-500 text-blue-600',
  green: 'border-green-500 text-green-600',
  yellow: 'border-yellow-500 text-yellow-600',
  purple: 'border-purple-500 text-purple-600',
};

function ToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-right p-4 rounded-lg bg-card hover:bg-muted/50 transition-all duration-300 ease-in-out border border-border focus:outline-none focus:ring-2 focus:ring-primary hover:shadow-md hover:-translate-y-1"
      aria-label={`Open ${tool.name}`}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">{tool.icon}</span>
        <div>
          <h4 className="font-bold text-lg text-card-foreground font-headline">{tool.name}</h4>
          <p className="text-sm text-muted-foreground">{tool.desc}</p>
        </div>
      </div>
    </button>
  );
}

export default function ToolGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const filteredToolsData = useMemo(() => {
    if (!searchQuery) {
      return toolsData;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered: ToolGroup[] = [];

    toolsData.forEach((group) => {
      const filteredTools = group.tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(lowercasedQuery) ||
          tool.desc.toLowerCase().includes(lowercasedQuery)
      );

      if (filteredTools.length > 0) {
        filtered.push({ ...group, tools: filteredTools });
      }
    });

    return filtered;
  }, [searchQuery]);

  const renderToolGroups = () =>
    filteredToolsData.map((group) => (
      <div key={group.name} className="tool-group">
        <h3
          className={`mb-4 text-xl font-bold border-b-2 pb-2 ${groupColors[group.color]}`}
        >
          {group.name}
        </h3>
        <div className="grid grid-cols-1 gap-4 mt-4">
          {group.tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />
          ))}
        </div>
      </div>
    ));

  return (
    <>
      <section id="gemini-assistant">
        <Card className="rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4 text-center font-headline">
              🤖 اختر أداتك الذكية
            </h2>
            <div className="relative w-full max-w-xl mx-auto">
              <Input
                type="text"
                id="search-tools"
                placeholder="ابحث عن أداة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pr-10 text-base text-foreground bg-muted rounded-full focus:ring-2 focus:ring-primary"
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
                <Search className="w-6 h-6" />
              </span>
            </div>
          </div>

          {filteredToolsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {renderToolGroups()}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground col-span-full">
              لا توجد أدوات تطابق بحثك
            </p>
          )}
        </Card>
      </section>
      <ToolModal
        tool={activeTool}
        isOpen={!!activeTool}
        onClose={() => setActiveTool(null)}
      />
    </>
  );
}
