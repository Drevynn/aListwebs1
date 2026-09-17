import React, { useState } from "react";
import { EquipmentItem } from "@/types/portfolio";
import { Plus, Trash2, Wrench, CheckCircle2, ShieldCheck, Box } from "lucide-react";

interface EquipmentKitManagerProps {
  equipment: EquipmentItem[];
  onChange: (equipment: EquipmentItem[]) => void;
}

export const EquipmentKitManager: React.FC<EquipmentKitManagerProps> = ({
  equipment,
  onChange,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentItem["category"]>("lighting");
  const [description, setDescription] = useState("");
  const [isAvailableForRent, setIsAvailableForRent] = useState(true);

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: EquipmentItem = {
      id: `eq-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      isAvailableForRent,
    };

    onChange([...equipment, newItem]);
    setName("");
    setDescription("");
  };

  const handleDelete = (id: string) => {
    onChange(equipment.filter((e) => e.id !== id));
  };

  const handleToggleRent = (id: string) => {
    onChange(
      equipment.map((e) =>
        e.id === id ? { ...e, isAvailableForRent: !e.isAvailableForRent } : e
      )
    );
  };

  return (
    <div id="equipment-kit-manager" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>Equipment Kit & Gear Inventory</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Document your kit packages, box rentals, cameras, lighting fixtures, and grip rigs for UPMs and producers.
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-zinc-800 text-amber-300 rounded-full border border-zinc-700">
          {equipment.length} Items Listed
        </span>
      </div>

      {/* Add New Gear Form */}
      <form
        onSubmit={handleAddEquipment}
        className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-4"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Add Kit Package or Rental Item
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Gear / Kit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Arri SkyPanel S60-C Kit, 5-Ton Grip Package, Sound Devices 888"
              required
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Gear Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EquipmentItem["category"])}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 outline-none"
            >
              <option value="lighting">Lighting & Distro</option>
              <option value="grip">Grip & Rigging</option>
              <option value="camera">Camera & Optics</option>
              <option value="sound">Sound & Wireless RF</option>
              <option value="post">Post & NLE Suites</option>
              <option value="specialized">Specialized Tools</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Package Specifications & Accessories
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Chimeras, 40-deg honeycombs, wireless CRMX transmitter, Camlok feeders"
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailableForRent}
              onChange={(e) => setIsAvailableForRent(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-amber-400"
            />
            <span>Available for Production Kit Rental / Box Rental</span>
          </label>

          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Inventory</span>
          </button>
        </div>
      </form>

      {/* Equipment List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {equipment.length === 0 ? (
          <div className="sm:col-span-2 p-8 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-zinc-500 text-xs">
            No equipment listed yet. Add your kit packages or box rental inventory above.
          </div>
        ) : (
          equipment.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Box className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-zinc-100">
                      {item.name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-semibold bg-zinc-800 text-amber-300 rounded border border-zinc-700">
                    {item.category}
                  </span>
                </div>

                {item.description && (
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleRent(item.id)}
                  className={`flex items-center space-x-1.5 text-[11px] font-medium transition-colors ${
                    item.isAvailableForRent
                      ? "text-emerald-400"
                      : "text-zinc-500"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {item.isAvailableForRent
                      ? "Box Rental Ready"
                      : "Personal Use Only"}
                  </span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
