import React, { useState } from "react";
import {
  Clapperboard,
  Users,
  Film,
  DollarSign,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Tv,
  Camera,
  Zap,
  Wrench,
  Headphones,
  Scissors,
} from "lucide-react";
import { FILM_DEPARTMENTS } from "@/lib/filmDepartments";

interface HollywoodGeniusShowcaseProps {
  onOpenGenius: (prompt?: string) => void;
}

export const HollywoodGeniusShowcase: React.FC<HollywoodGeniusShowcaseProps> = ({
  onOpenGenius,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState("electric_lighting");

  const selectedDept =
    FILM_DEPARTMENTS.find((d) => d.id === selectedDeptId) ||
    FILM_DEPARTMENTS[3];

  return (
    <section
      id="hollywood-genius-showcase"
      className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-amber-500/20 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Premier Selling Point</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
            The Hollywood Genius AI
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300">
            From complete 40-person production crews to who's actively casting in Hollywood.
            Every film department represented—from Directors and DPs down to Best Boys, Key Grips, and Sound Utilities.
          </p>
        </div>

        {/* Feature Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Department Explorer */}
          <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Film className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Every Film Department Represented
                </h3>
              </div>
              <span className="text-xs text-amber-400 font-mono">16 Departments</span>
            </div>

            {/* Department Quick List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {FILM_DEPARTMENTS.slice(0, 10).map((dept) => {
                const isSelected = dept.id === selectedDeptId;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                        : "bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80"
                    }`}
                  >
                    <div>
                      <div className="text-xs">{dept.label}</div>
                      <div
                        className={`text-[11px] ${
                          isSelected ? "text-zinc-900 font-semibold" : "text-zinc-500"
                        }`}
                      >
                        Head: {dept.headTitle}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 ${
                        isSelected ? "text-zinc-950" : "text-zinc-600"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* CTA to consult genius */}
            <button
              onClick={() =>
                onOpenGenius(
                  `Assemble a full department roster for ${selectedDept.label}, including head of department, best boys/assistants, and equipment package requirements.`
                )
              }
              className="mt-5 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Clapperboard className="w-4 h-4" />
              <span>Ask Genius About {selectedDept.label}</span>
            </button>
          </div>

          {/* Right Column: Dynamic Live Intelligence Dossier */}
          <div className="lg:col-span-7 bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl shadow-amber-500/5">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-zinc-100">
                    {selectedDept.label} Blueprint
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Guild Affiliation: {selectedDept.guilds.join(", ")}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/40 rounded-full">
                IATSE / Industry Standard
              </span>
            </div>

            {/* Department Roles & Best Boys */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Department Hierarchy & Key Roles:
                </span>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDept.subRoles.map((role, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Overview */}
              <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Mission & Production Impact:
                </span>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                  {selectedDept.description}
                </p>
              </div>

              {/* Equipment Kits & Gear Inventory */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Standard Kit Packages & Box Rentals:
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedDept.kitCategories.map((kit, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs bg-zinc-800 text-zinc-300 border border-zinc-700/60 rounded-md font-mono"
                    >
                      {kit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Three Strategic Pillars */}
              <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                  <Users className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-zinc-200">Complete Crews</div>
                  <div className="text-[11px] text-zinc-400">Above & below the line</div>
                </div>
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                  <Clapperboard className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-zinc-200">Who's Casting</div>
                  <div className="text-[11px] text-zinc-400">CSA & agency radar</div>
                </div>
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                  <DollarSign className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-zinc-200">Day Rates & Kits</div>
                  <div className="text-[11px] text-zinc-400">2026 union scale</div>
                </div>
              </div>
            </div>

            {/* Instant Launcher */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() =>
                  onOpenGenius(
                    "Who is currently casting independent and studio features right now? Break down top CSA casting directors by genre."
                  )
                }
                className="w-full sm:w-1/2 flex items-center justify-center space-x-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/20"
              >
                <Clapperboard className="w-4 h-4" />
                <span>Who's Casting Report</span>
              </button>
              <button
                onClick={() =>
                  onOpenGenius(
                    "What are the standard 2026 IATSE day rates and kit fees for Best Boy Electric, Key Grip, and Production Sound Mixer?"
                  )
                }
                className="w-full sm:w-1/2 flex items-center justify-center space-x-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Calculate Day Rates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
