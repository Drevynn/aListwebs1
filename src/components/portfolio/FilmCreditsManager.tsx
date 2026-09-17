import React, { useState } from "react";
import { FilmCreditItem, FilmDepartment } from "@/types/portfolio";
import { FILM_DEPARTMENTS } from "@/lib/filmDepartments";
import { Plus, Trash2, Film, Award, Building, User, ExternalLink } from "lucide-react";

interface FilmCreditsManagerProps {
  credits: FilmCreditItem[];
  onChange: (credits: FilmCreditItem[]) => void;
}

export const FilmCreditsManager: React.FC<FilmCreditsManagerProps> = ({
  credits,
  onChange,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newRole, setNewRole] = useState("");
  const [newDepartment, setNewDepartment] = useState<string>("electric_lighting");
  const [newCompany, setNewCompany] = useState("");
  const [newDirectorOrDP, setNewDirectorOrDP] = useState("");
  const [newAwards, setNewAwards] = useState("");

  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRole.trim()) return;

    const newItem: FilmCreditItem = {
      id: `fc-${Date.now()}`,
      title: newTitle.trim(),
      year: newYear.trim() || new Date().getFullYear().toString(),
      role: newRole.trim(),
      department: newDepartment,
      productionCompany: newCompany.trim() || undefined,
      directorOrDP: newDirectorOrDP.trim() || undefined,
      festivalAwards: newAwards.trim() || undefined,
      isFeatured: true,
    };

    onChange([newItem, ...credits]);
    setNewTitle("");
    setNewRole("");
    setNewCompany("");
    setNewDirectorOrDP("");
    setNewAwards("");
  };

  const handleDelete = (id: string) => {
    onChange(credits.filter((c) => c.id !== id));
  };

  const handleToggleFeatured = (id: string) => {
    onChange(
      credits.map((c) => (c.id === id ? { ...c, isFeatured: !c.isFeatured } : c))
    );
  };

  return (
    <div id="film-credits-manager" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span>Film Projects & Department Credits</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Features, episodic series, commercials, and festival selections across your career.
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-zinc-800 text-amber-300 rounded-full border border-zinc-700">
          {credits.length} Credits Logged
        </span>
      </div>

      {/* Add New Credit Form */}
      <form
        onSubmit={handleAddCredit}
        className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-4"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Log New Film / Production Credit
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Project / Film Title *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Apex Protocol, Neon Horizon"
              required
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Release Year
            </label>
            <input
              type="text"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="2026"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Your Role On Set *
            </label>
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g., Best Boy Electric, Key Grip, DP, Sound Mixer"
              required
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Department
            </label>
            <select
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 outline-none"
            >
              {FILM_DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Studio / Production Co.
            </label>
            <input
              type="text"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="e.g., A24, Warner Bros, Netflix"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Director / DP Credit
            </label>
            <input
              type="text"
              value={newDirectorOrDP}
              onChange={(e) => setNewDirectorOrDP(e.target.value)}
              placeholder="e.g., DP: Marcus Alvarez, ASC"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Festival / Awards
            </label>
            <input
              type="text"
              value={newAwards}
              onChange={(e) => setNewAwards(e.target.value)}
              placeholder="e.g., Sundance Selection, Emmy Nominee"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Film Credit</span>
        </button>
      </form>

      {/* Credit List */}
      <div className="space-y-3">
        {credits.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-zinc-500 text-xs">
            No film credits added yet. Log your first feature, series, or commercial above.
          </div>
        ) : (
          credits.map((item) => {
            const deptMeta = FILM_DEPARTMENTS.find((d) => d.id === item.department);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-sm font-bold text-zinc-100 truncate">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-mono bg-zinc-800 text-zinc-400 rounded">
                      {item.year}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                      {item.role}
                    </span>
                    {deptMeta && (
                      <span className="text-[11px] text-zinc-500">
                        ({deptMeta.label})
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center space-x-4 text-xs text-zinc-400 flex-wrap gap-y-1">
                    {item.productionCompany && (
                      <span className="flex items-center space-x-1">
                        <Building className="w-3 h-3 text-zinc-500" />
                        <span>{item.productionCompany}</span>
                      </span>
                    )}
                    {item.directorOrDP && (
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span>{item.directorOrDP}</span>
                      </span>
                    )}
                    {item.festivalAwards && (
                      <span className="flex items-center space-x-1 text-amber-300">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>{item.festivalAwards}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleToggleFeatured(item.id)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
                      item.isFeatured
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {item.isFeatured ? "Featured" : "Standard"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
