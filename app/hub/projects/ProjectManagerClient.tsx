"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Cpu,
  Key,
  Bot,
  ShieldCheck,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";

interface BoundModel {
  id: string;
  name: string;
  slug: string;
  riskCategory: string;
}

interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  apiKeyHash: string | null;
  createdAt: string;
  boundModels: BoundModel[];
}

interface BoundProject {
  id: string;
  name: string;
  slug: string;
}

interface ModelItem {
  id: string;
  name: string;
  slug: string;
  modelClass: string;
  riskCategory: string;
  status: string;
  createdAt: string;
  boundProjects: BoundProject[];
}

interface CapacityInfo {
  consumedSlots: number;
  totalSlots: number;
  isUnlimited: boolean;
  remainingSlots: number | string;
}

interface Props {
  initialProjects: ProjectItem[];
  initialModels: ModelItem[];
  capacity: CapacityInfo;
  hubId: string;
  hubName: string;
}

export default function ProjectManagerClient({
  initialProjects,
  initialModels,
  capacity: initialCapacity,
  hubId,
  hubName,
}: Props) {
  const [activeTab, setActiveTab] = useState<"projects" | "models">("projects");
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [models, setModels] = useState<ModelItem[]>(initialModels);
  const [capacity, setCapacity] = useState<CapacityInfo>(initialCapacity);

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showBindModal, setShowBindModal] = useState<string | null>(null); // modelId being bound

  // Project form state
  const [projName, setProjName] = useState("");
  const [projSlug, setProjSlug] = useState("");
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [projLoading, setProjLoading] = useState(false);
  const [projError, setProjError] = useState<string | null>(null);

  // Model form state
  const [modelName, setModelName] = useState("");
  const [modelSlug, setModelSlug] = useState("");
  const [modelClass, setModelClass] = useState("PROPRIETARY");
  const [riskCategory, setRiskCategory] = useState("HIGH_RISK");
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // Bind form state
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [bindLoading, setBindLoading] = useState(false);

  // 1. Create Project (Unrestricted)
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjLoading(true);
    setProjError(null);

    try {
      const res = await fetch("/api/v1/hub/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projName, slug: projSlug }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      setCreatedApiKey(data.apiKey);
      setProjects([
        {
          id: data.project.id,
          name: data.project.name,
          slug: data.project.slug,
          apiKeyHash: "anc_live_...",
          createdAt: data.project.createdAt,
          boundModels: [],
        },
        ...projects,
      ]);
      setProjName("");
      setProjSlug("");
    } catch (err: any) {
      setProjError(err.message);
    } finally {
      setProjLoading(false);
    }
  };

  // 2. Register Governed AI Model (Capacity Metered)
  const handleRegisterModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setModelLoading(true);
    setModelError(null);

    try {
      const res = await fetch("/api/v1/hub/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modelName,
          slug: modelSlug,
          modelClass,
          riskCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.upgradePath) {
          throw new Error(`${data.message}\nUpgrade: ${data.upgradePath}`);
        }
        throw new Error(data.error || data.message || "Failed to register model");
      }

      setModels([
        {
          id: data.model.id,
          name: data.model.name,
          slug: data.model.slug,
          modelClass: data.model.modelClass,
          riskCategory: data.model.riskCategory,
          status: data.model.status,
          createdAt: data.model.createdAt,
          boundProjects: [],
        },
        ...models,
      ]);

      if (!capacity.isUnlimited) {
        setCapacity({
          ...capacity,
          consumedSlots: capacity.consumedSlots + 1,
          remainingSlots: Math.max(0, Number(capacity.remainingSlots) - 1),
        });
      }

      setShowModelModal(false);
      setModelName("");
      setModelSlug("");
    } catch (err: any) {
      setModelError(err.message);
    } finally {
      setModelLoading(false);
    }
  };

  // 3. Bind Model to Project (Zero slot cost)
  const handleBindModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBindModal || !selectedProjectId) return;
    setBindLoading(true);

    try {
      const res = await fetch("/api/v1/hub/models/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: showBindModal,
          projectId: selectedProjectId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to bind");

      // Update local state
      const targetProj = projects.find((p) => p.id === selectedProjectId);
      const targetModel = models.find((m) => m.id === showBindModal);

      if (targetProj && targetModel) {
        setModels(
          models.map((m) =>
            m.id === showBindModal
              ? {
                  ...m,
                  boundProjects: [
                    ...m.boundProjects.filter((p) => p.id !== selectedProjectId),
                    { id: targetProj.id, name: targetProj.name, slug: targetProj.slug },
                  ],
                }
              : m
          )
        );

        setProjects(
          projects.map((p) =>
            p.id === selectedProjectId
              ? {
                  ...p,
                  boundModels: [
                    ...p.boundModels.filter((m) => m.id !== showBindModal),
                    {
                      id: targetModel.id,
                      name: targetModel.name,
                      slug: targetModel.slug,
                      riskCategory: targetModel.riskCategory,
                    },
                  ],
                }
              : p
          )
        );
      }

      setShowBindModal(null);
      setSelectedProjectId("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBindLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-600 dark:text-sky-400 font-bold uppercase text-[10px] tracking-widest font-mono">
            SOVEREIGN WORKLOAD CONTROL PLANE
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Workload &amp; Model Governance
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">
            Hub: <strong className="text-slate-900 dark:text-slate-200">{hubName}</strong> ({hubId})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setCreatedApiKey(null);
              setProjError(null);
              setShowProjectModal(true);
            }}
            className="pure-glass-badge px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center space-x-2 transition rounded-xl shadow-sm border border-slate-200 dark:border-white/10"
          >
            <Plus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Provision Project</span>
          </button>

          <button
            onClick={() => {
              setModelError(null);
              setShowModelModal(true);
            }}
            className="pure-glass-badge px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center space-x-2 transition rounded-xl shadow-sm border border-emerald-300 dark:border-emerald-500/30"
          >
            <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Register Governed AI Model</span>
          </button>
        </div>
      </div>

      {/* Governance Capacity Bar */}
      <div className="pure-glass-card rounded-2xl p-5 border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-sm">
        <div>
          <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
            STATIC CODEBASES
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {projects.length}
            </span>
            <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
              UNRESTRICTED
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Zero project slot ceiling. Unlimited AST and CI/CD code scans.
          </p>
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
            GOVERNED AI MODEL SLOTS
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {capacity.consumedSlots}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              / {capacity.isUnlimited ? "∞" : capacity.totalSlots} SLOTS
            </span>
            {!capacity.isUnlimited && capacity.consumedSlots >= capacity.totalSlots && (
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-600">
                CAPACITY REACHED
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Licensed capacity for active runtime decision auditing &amp; DAC blocks.
          </p>
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
            INTEGRATION TOPOLOGY
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {models.reduce((sum, m) => sum + m.boundProjects.length, 0)}
            </span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              CROSS-BINDINGS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Models connect to multiple projects without consuming extra capacity slots.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-white/10 font-mono text-xs">
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-4 font-bold border-b-2 transition-colors ${
            activeTab === "projects"
              ? "border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Project Silos ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab("models")}
          className={`pb-3 px-4 font-bold border-b-2 transition-colors ${
            activeTab === "models"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Governed AI Models ({models.length})
        </button>
      </div>

      {/* Tab 1: Project Silos */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="pure-glass-card rounded-2xl p-16 text-center space-y-4 shadow-sm border border-slate-200 dark:border-white/10">
              <Layers className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <div className="text-slate-900 dark:text-slate-200 font-semibold text-base">
                No Projects Registered
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono max-w-sm mx-auto">
                Provision a project silo to register your first governed codebase.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="pure-glass-card rounded-2xl p-6 space-y-4 shadow-sm border border-slate-200 dark:border-white/10"
                >
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/10 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {proj.name}
                        </h3>
                        <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">
                          UNRESTRICTED
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        Slug: {proj.slug}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      BOUND GOVERNED AI MODELS
                    </span>
                    {proj.boundModels.length === 0 ? (
                      <span className="text-xs font-mono text-slate-400 italic">
                        No AI models bound to this codebase yet.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.boundModels.map((bm) => (
                          <span
                            key={bm.id}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                          >
                            <Bot className="w-3 h-3 text-emerald-500" />
                            <span>{bm.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono pt-3 border-t border-slate-200 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400">
                      Created: {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab("models");
                      }}
                      className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                    >
                      Connect Models →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Governed AI Models */}
      {activeTab === "models" && (
        <div className="space-y-6">
          {models.length === 0 ? (
            <div className="pure-glass-card rounded-2xl p-16 text-center space-y-4 shadow-sm border border-slate-200 dark:border-white/10">
              <Bot className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <div className="text-slate-900 dark:text-slate-200 font-semibold text-base">
                No Governed AI Models Registered
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono max-w-sm mx-auto">
                Register an AI model identity to begin runtime decision auditing under statutory rules.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {models.map((mod) => (
                <div
                  key={mod.id}
                  className="pure-glass-card rounded-2xl p-6 space-y-4 shadow-sm border border-slate-200 dark:border-white/10"
                >
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/10 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {mod.name}
                        </h3>
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600">
                          {mod.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        Slug: {mod.slug} · {mod.riskCategory}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                      1 SLOT CONSUMED
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        CONNECTED CODEBASE SILOS ({mod.boundProjects.length})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedProjectId("");
                          setShowBindModal(mod.id);
                        }}
                        className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Bind Project</span>
                      </button>
                    </div>

                    {mod.boundProjects.length === 0 ? (
                      <span className="text-xs font-mono text-slate-400 italic block">
                        Unattached — not bound to any repository yet.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {mod.boundProjects.map((bp) => (
                          <span
                            key={bp.id}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200"
                          >
                            <Layers className="w-3 h-3 text-sky-500" />
                            <span>{bp.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono pt-3 border-t border-slate-200 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400">
                      Registered: {new Date(mod.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Type: {mod.modelClass}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Provision Project (Unrestricted) */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="pure-glass-card bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-white/15 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  Provision New Project Silo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
                  Project registration is unrestricted. Zero capacity slots consumed.
                </p>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdApiKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-mono text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Project Provisioned! Save Your API Key:</span>
                  </div>
                  <input
                    readOnly
                    value={createdApiKey}
                    className="w-full bg-white dark:bg-black/50 border border-emerald-400 rounded-lg p-2.5 font-mono text-xs text-slate-900 dark:text-slate-100 select-all"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                    This key is only displayed once. Configure it in your repository via{" "}
                    <code>ANCHOR_API_KEY</code>.
                  </p>
                </div>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-mono">
                {projError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 text-xs">
                    {projError}
                  </div>
                )}

                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    PROJECT NAME *
                  </label>
                  <input
                    required
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. Trading Execution Gateway"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    SLUG (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={projSlug}
                    onChange={(e) => setProjSlug(e.target.value)}
                    placeholder="e.g. trading-execution-gateway"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={projLoading}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {projLoading ? "Provisioning..." : "Provision Project Silo"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Register Governed AI Model (Capacity Metered) */}
      {showModelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="pure-glass-card bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-white/15 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  Register Governed AI Model
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
                  Consumes 1 Governed AI Model Slot ({capacity.consumedSlots}/{capacity.isUnlimited ? "∞" : capacity.totalSlots} used).
                </p>
              </div>
              <button
                onClick={() => setShowModelModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterModel} className="space-y-4 text-xs font-mono">
              {modelError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 text-xs whitespace-pre-wrap">
                  {modelError}
                </div>
              )}

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                  MODEL / AI AGENT NAME *
                </label>
                <input
                  required
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. Credit-Scoring-Agent"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                  SLUG (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={modelSlug}
                  onChange={(e) => setModelSlug(e.target.value)}
                  placeholder="e.g. credit-scoring-agent"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    MODEL CLASS
                  </label>
                  <select
                    value={modelClass}
                    onChange={(e) => setModelClass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-slate-100"
                  >
                    <option value="PROPRIETARY">Proprietary In-House</option>
                    <option value="OSS_FINE_TUNE">OSS Fine-Tuned</option>
                    <option value="HOSTED_API">Commercial Hosted API</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    EU AI ACT RISK CLASS
                  </label>
                  <select
                    value={riskCategory}
                    onChange={(e) => setRiskCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-slate-100"
                  >
                    <option value="HIGH_RISK">High Risk (Annex III)</option>
                    <option value="GPAI_SYSTEMIC">GPAI with Systemic Risk</option>
                    <option value="MINIMAL_RISK">Minimal / Transparency</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modelLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {modelLoading ? "Registering..." : "Register Model (Consume 1 Slot)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Bind Model to Project (Zero slot cost) */}
      {showBindModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="pure-glass-card bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-white/15 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  Bind Model to Project
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
                  Connecting an AI model to codebases consumes 0 additional capacity slots.
                </p>
              </div>
              <button
                onClick={() => setShowBindModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBindModel} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                  SELECT TARGET PROJECT SILO
                </label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Choose a Project Silo --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBindModal(null)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bindLoading || !selectedProjectId}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {bindLoading ? "Binding..." : "Create Binding (0 Slots)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
