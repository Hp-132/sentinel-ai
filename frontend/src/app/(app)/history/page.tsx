"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchEvaluations } from "@/lib/api";
import { AVAILABLE_MODELS, EvaluationRecord } from "@/lib/types";

function safetyColor(score: number) {
  if (score >= 0.8) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  if (score >= 0.5) return "text-amber-400 border-amber-400/30 bg-amber-400/10";
  return "text-red-400 border-red-400/30 bg-red-400/10";
}

function getThreats(e: EvaluationRecord): string[] {
  const threats: string[] = [];
  if (e.prompt_injection_score > 0.3) threats.push("Injection");
  if (e.jailbreak_score > 0.3) threats.push("Jailbreak");
  if (e.toxicity_score > 0.3) threats.push("Toxicity");
  if (e.pii_detected) threats.push("PII");
  if (e.hallucination_score > 0.5) threats.push("Hallucination");
  return threats;
}

export default function HistoryPage() {
  const [evals, setEvals] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("0");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvaluations(200)
      .then(setEvals)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return evals.filter((e) => {
      if (modelFilter !== "all" && e.model !== modelFilter) return false;
      if (e.safety_score < parseFloat(minScore)) return false;
      if (search && !e.prompt.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [evals, search, modelFilter, minScore]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-medium">History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Full evaluation log — {filtered.length} of {evals.length} records
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search prompt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All models</SelectItem>
              {AVAILABLE_MODELS.map((m) => (
                <SelectItem key={m.key} value={m.key}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={minScore} onValueChange={setMinScore}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Min safety score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any safety score</SelectItem>
              <SelectItem value="0.5">0.5+ (medium+)</SelectItem>
              <SelectItem value="0.8">0.8+ (safe only)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-sm">Loading history...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">No evaluations match these filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Threats</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const threats = getThreats(e);
                  const expanded = expandedId === e.id;
                  return (
                    <Fragment key={e.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setExpandedId(expanded ? null : e.id)}
                      >
                        <TableCell className="font-medium">{e.model}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {e.prompt}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={safetyColor(e.safety_score)}>
                            {e.safety_score.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{e.latency_ms}ms</TableCell>
                        <TableCell>
                          {threats.length === 0 ? (
                            <span className="text-muted-foreground text-xs">—</span>
                          ) : (
                            <div className="flex gap-1 flex-wrap">
                              {threats.map((t) => (
                                <Badge
                                  key={t}
                                  variant="outline"
                                  className="text-red-400 border-red-400/30 bg-red-400/10 text-xs"
                                >
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(e.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>

                      {expanded && (
                        <TableRow key={`${e.id}-detail`}>
                          <TableCell colSpan={6} className="bg-secondary/30">
                            <div className="p-4 space-y-3 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Full Prompt</p>
                                <p>{e.prompt}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Response</p>
                                <p className="whitespace-pre-wrap">{e.response}</p>
                              </div>
                              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 font-mono text-xs pt-2 border-t border-border">
                                <span>Injection: {e.prompt_injection_score}</span>
                                <span>Jailbreak: {e.jailbreak_score}</span>
                                <span>Hallucination: {e.hallucination_score}</span>
                                <span>Toxicity: {e.toxicity_score}</span>
                                <span>PII: {e.pii_detected ? "Yes" : "No"}</span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}