import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  LogOut,
  Search,
  MessageCircle,
  Eye,
  Loader2,
  Users,
  TrendingUp,
  Zap,
  CalendarDays,
  Download,
  Settings,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatBRL, formatDate, formatKwh, formatNumber } from "@/lib/format";
import { leadWhatsappUrl } from "@/lib/whatsapp";
import { type CalcParams, DEFAULT_PARAMS } from "@/lib/calc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Lead = {
  id: string;
  nome: string;
  whatsapp: string;
  cidade_estado: string;
  tipo_imovel: string;
  possui_telhado: boolean;
  valor_conta: number;
  consumo_kwh: number;
  modulos: number;
  potencia_kwp: number;
  economia_mensal: number;
  economia_anual: number;
  investimento: number;
  payback: number;
  created_at: string;
};

function exportarCSV(leads: Lead[]) {
  const headers = [
    "Nome",
    "WhatsApp",
    "Cidade/Estado",
    "Tipo",
    "Telhado",
    "Conta (R$)",
    "Consumo (kWh)",
    "Módulos",
    "Potência (kWp)",
    "Economia Mensal (R$)",
    "Economia Anual (R$)",
    "Investimento (R$)",
    "Payback (meses)",
    "Data",
  ];

  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const rows = leads.map((l) => [
    esc(l.nome),
    esc(l.whatsapp),
    esc(l.cidade_estado),
    esc(l.tipo_imovel),
    l.possui_telhado ? "Sim" : "Não",
    String(Number(l.valor_conta).toFixed(2)),
    String(Number(l.consumo_kwh).toFixed(2)),
    String(l.modulos),
    String(Number(l.potencia_kwp).toFixed(2)),
    String(Number(l.economia_mensal).toFixed(2)),
    String(Number(l.economia_anual).toFixed(2)),
    String(Number(l.investimento).toFixed(2)),
    String(Number(l.payback).toFixed(1)),
    esc(formatDate(l.created_at)),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-sunny-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [tipo, setTipo] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  // Configurações
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<CalcParams>(DEFAULT_PARAMS);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/admin/login", { replace: true });
    } else if (!authLoading && session && !isAdmin) {
      toast.error("Sua conta ainda não tem permissão de administrador.");
      navigate("/admin/login", { replace: true });
    }
  }, [authLoading, session, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("simulacoes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) {
        toast.error("Erro ao carregar leads: " + error.message);
      } else {
        setLeads((data ?? []) as Lead[]);
      }
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("configuracoes")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setConfig({
            tarifa_kwh: Number(data.tarifa_kwh),
            kwh_por_modulo: Number(data.kwh_por_modulo),
            kwp_por_modulo: Number(data.kwp_por_modulo),
            percentual_economia: Number(data.percentual_economia),
            custo_por_modulo: Number(data.custo_por_modulo),
          });
        }
      });
  }, [isAdmin]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (search && !l.nome.toLowerCase().includes(search.toLowerCase())) return false;
      if (city && !l.cidade_estado.toLowerCase().includes(city.toLowerCase())) return false;
      if (tipo !== "all" && l.tipo_imovel !== tipo) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(l.created_at) < from) return false;
      }
      return true;
    });
  }, [leads, search, city, tipo, dateFrom]);

  const metrics = useMemo(() => {
    const total = leads.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = leads.filter((l) => new Date(l.created_at) >= today).length;
    const avgConsumo = total
      ? leads.reduce((s, l) => s + Number(l.consumo_kwh), 0) / total
      : 0;
    const avgModulos = total
      ? leads.reduce((s, l) => s + l.modulos, 0) / total
      : 0;
    return { total, todayCount, avgConsumo, avgModulos };
  }, [leads]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  const onSaveConfig = async () => {
    setSavingConfig(true);
    const { error } = await supabase
      .from("configuracoes")
      .update({
        tarifa_kwh: config.tarifa_kwh,
        kwh_por_modulo: config.kwh_por_modulo,
        kwp_por_modulo: config.kwp_por_modulo,
        percentual_economia: config.percentual_economia,
        custo_por_modulo: config.custo_por_modulo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setSavingConfig(false);
    if (error) {
      toast.error("Erro ao salvar configurações: " + error.message);
    } else {
      toast.success("Configurações salvas com sucesso!");
    }
  };

  if (authLoading || (loading && !leads.length)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground">
              <Sun className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <div>
              <div className="text-sm font-bold leading-tight">Sunny Energia</div>
              <div className="text-xs text-muted-foreground">Painel Admin</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:bg-foreground/5"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Users} label="Total de simulações" value={String(metrics.total)} />
          <MetricCard icon={CalendarDays} label="Leads do dia" value={String(metrics.todayCount)} />
          <MetricCard icon={Zap} label="Consumo médio" value={formatKwh(metrics.avgConsumo)} />
          <MetricCard icon={TrendingUp} label="Módulos médios" value={formatNumber(metrics.avgModulos, 1)} />
        </section>

        {/* Configurações do simulador */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => setConfigOpen((o) => !o)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-foreground/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Settings className="w-4 h-4 text-primary" />
              Configurações do Simulador
            </div>
            {configOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {configOpen && (
            <div className="border-t border-border/60 p-5 space-y-4">
              <p className="text-xs text-muted-foreground">
                Estes valores são usados em todos os cálculos do simulador público.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ConfigField
                  label="Tarifa kWh (divisor do consumo)"
                  hint="Ex: 0.95"
                  value={config.tarifa_kwh}
                  onChange={(v) => setConfig((c) => ({ ...c, tarifa_kwh: v }))}
                />
                <ConfigField
                  label="kWh por módulo"
                  hint="Ex: 60"
                  value={config.kwh_por_modulo}
                  onChange={(v) => setConfig((c) => ({ ...c, kwh_por_modulo: v }))}
                />
                <ConfigField
                  label="kWp por módulo"
                  hint="Ex: 0.55"
                  value={config.kwp_por_modulo}
                  onChange={(v) => setConfig((c) => ({ ...c, kwp_por_modulo: v }))}
                />
                <ConfigField
                  label="% de economia (0 a 1)"
                  hint="Ex: 0.70 = 70%"
                  value={config.percentual_economia}
                  onChange={(v) => setConfig((c) => ({ ...c, percentual_economia: v }))}
                />
                <ConfigField
                  label="Custo por módulo (R$)"
                  hint="Ex: 2500"
                  value={config.custo_por_modulo}
                  onChange={(v) => setConfig((c) => ({ ...c, custo_por_modulo: v }))}
                />
              </div>
              <button
                onClick={onSaveConfig}
                disabled={savingConfig}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:shadow-glow transition-all disabled:opacity-60"
              >
                {savingConfig ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar configurações
              </button>
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="glass-card p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-9"
              />
            </div>
            <input
              placeholder="Cidade..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="form-input"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="form-input"
            >
              <option value="all">Todos os tipos</option>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="rural">Rural</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Mostrando <span className="text-foreground font-semibold">{filtered.length}</span> de{" "}
              {leads.length} leads
            </span>
            <button
              onClick={() => exportarCSV(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:bg-foreground/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </section>

        {/* Table */}
        <section className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-input/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <Th>Nome</Th>
                  <Th>WhatsApp</Th>
                  <Th>Cidade</Th>
                  <Th>Tipo</Th>
                  <Th className="text-right">Conta</Th>
                  <Th className="text-right">Módulos</Th>
                  <Th className="text-right">Economia/mês</Th>
                  <Th>Data</Th>
                  <Th className="text-right">Ações</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id} className="border-t border-border/50 hover:bg-foreground/[0.02]">
                      <Td className="font-medium">{l.nome}</Td>
                      <Td className="text-muted-foreground">{l.whatsapp}</Td>
                      <Td className="text-muted-foreground">{l.cidade_estado}</Td>
                      <Td className="capitalize">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          {l.tipo_imovel}
                        </span>
                      </Td>
                      <Td className="text-right">{formatBRL(Number(l.valor_conta))}</Td>
                      <Td className="text-right">{l.modulos}</Td>
                      <Td className="text-right text-primary font-semibold">
                        {formatBRL(Number(l.economia_mensal))}
                      </Td>
                      <Td className="text-muted-foreground whitespace-nowrap">
                        {formatDate(l.created_at)}
                      </Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <a
                            href={leadWhatsappUrl(l.whatsapp, l.nome)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chamar no WhatsApp"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setSelected(l)}
                            title="Ver detalhes"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-input border border-border text-foreground hover:bg-foreground/5"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Lead detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do lead</DialogTitle>
            <DialogDescription>
              {selected && formatDate(selected.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 mt-2">
              <DetailRow k="Nome" v={selected.nome} />
              <DetailRow k="WhatsApp" v={selected.whatsapp} />
              <DetailRow k="Cidade / Estado" v={selected.cidade_estado} />
              <DetailRow k="Tipo de imóvel" v={selected.tipo_imovel} className="capitalize" />
              <DetailRow k="Possui telhado" v={selected.possui_telhado ? "Sim" : "Não"} />
              <hr className="border-border/60" />
              <DetailRow k="Valor da conta" v={formatBRL(Number(selected.valor_conta))} />
              <DetailRow k="Consumo estimado" v={formatKwh(Number(selected.consumo_kwh))} />
              <DetailRow k="Módulos" v={String(selected.modulos)} />
              <DetailRow k="Potência" v={`${formatNumber(Number(selected.potencia_kwp), 2)} kWp`} />
              <DetailRow k="Economia mensal" v={formatBRL(Number(selected.economia_mensal))} highlight />
              <DetailRow k="Economia anual" v={formatBRL(Number(selected.economia_anual))} highlight />
              <DetailRow k="Investimento" v={formatBRL(Number(selected.investimento))} />
              <DetailRow k="Payback" v={`${formatNumber(Number(selected.payback), 1)} meses`} />

              <a
                href={leadWhatsappUrl(selected.whatsapp, selected.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-glow transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Chamar no WhatsApp
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) => (
  <div className="glass-card p-5">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </div>
    <div className="mt-2 text-2xl md:text-3xl font-bold">{value}</div>
  </div>
);

const ConfigField = ({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={hint}
      className="form-input"
    />
    <p className="mt-1 text-xs text-muted-foreground/60">{hint}</p>
  </div>
);

const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>
);

const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
);

const DetailRow = ({
  k,
  v,
  highlight,
  className = "",
}: {
  k: string;
  v: string;
  highlight?: boolean;
  className?: string;
}) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{k}</span>
    <span className={`font-semibold ${highlight ? "text-primary" : ""} ${className}`}>{v}</span>
  </div>
);

export default AdminDashboard;
