'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchReportSummary, fetchUpcomingReport, setDateRange } from '@/store/slices/reportsSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, CalendarDays } from 'lucide-react';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ৳{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const { summary, upcomingReport, dateRange, loading } = useAppSelector((s) => s.reports);

  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);

  useEffect(() => {
    dispatch(fetchReportSummary({ startDate: dateRange.startDate, endDate: dateRange.endDate }));
    dispatch(fetchUpcomingReport());
  }, [dispatch, dateRange]);

  const applyDateRange = () => {
    dispatch(setDateRange({ startDate, endDate }));
  };

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* ── Date Range Picker ── */}
      <Card className="border border-border">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={14} className="text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">Date Range</span>
          </div>
          {/* Two rows on mobile, single row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 rounded-lg text-sm flex-1"
              />
              <span className="text-muted-foreground text-xs flex-shrink-0">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 rounded-lg text-sm flex-1"
              />
            </div>
            <Button onClick={applyDateRange} size="sm" className="h-9 rounded-lg text-sm px-4 sm:w-auto w-full">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview" className="w-full">
        {/*
          On mobile: scrollable single row — no wrapping, no squishing.
          On desktop: tabs naturally spread across the full width.
        */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max sm:w-full h-9 rounded-xl p-1 gap-0.5">
            <TabsTrigger value="overview"  className="text-xs whitespace-nowrap px-3 h-7 rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="spending"  className="text-xs whitespace-nowrap px-3 h-7 rounded-lg">Spending</TabsTrigger>
            <TabsTrigger value="trends"    className="text-xs whitespace-nowrap px-3 h-7 rounded-lg">Trends</TabsTrigger>
            <TabsTrigger value="budgets"   className="text-xs whitespace-nowrap px-3 h-7 rounded-lg">Budgets</TabsTrigger>
            <TabsTrigger value="upcoming"  className="text-xs whitespace-nowrap px-3 h-7 rounded-lg">Upcoming</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Summary Cards — 3 col but with truncation-safe amounts */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="border-0 bg-emerald-500/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-1 mb-1.5">
                  <TrendingUp size={12} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground">Income</span>
                </div>
                {loading ? (
                  <Skeleton className="h-5 w-full" />
                ) : (
                  <p className="text-sm font-bold text-emerald-600 leading-tight">
                    ৳{(summary?.totalIncome || 0).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 bg-red-500/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-1 mb-1.5">
                  <TrendingDown size={12} className="text-red-500 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground">Expenses</span>
                </div>
                {loading ? (
                  <Skeleton className="h-5 w-full" />
                ) : (
                  <p className="text-sm font-bold text-red-500 leading-tight">
                    ৳{(summary?.totalExpenses || 0).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 bg-primary/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-1 mb-1.5">
                  <Wallet size={12} className="text-primary flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground">Saved</span>
                </div>
                {loading ? (
                  <Skeleton className="h-5 w-full" />
                ) : (
                  <p className="text-sm font-bold text-primary leading-tight">
                    ৳{(summary?.netSavings || 0).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Income vs Expenses Bar */}
          <Card className="border border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summary?.byMonth || []} barGap={4}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Wallet Balances */}
          <Card className="border border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Wallet Balances</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {(summary?.walletBalances || []).map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: w.color }} />
                  <span className="text-sm flex-1 truncate">{w.wallet}</span>
                  <span className="text-sm font-semibold flex-shrink-0">৳{w.balance.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Spending Breakdown ── */}
        <TabsContent value="spending" className="space-y-4 mt-4">
          <Card className="border border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {loading ? (
                <Skeleton className="h-52 w-full" />
              ) : !summary?.byCategory?.length ? (
                <p className="text-center text-muted-foreground text-sm py-8">No expense data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={summary.byCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={45}
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {summary.byCategory.map((entry, index) => (
                          <Cell key={index} fill={entry.color || `hsl(${index * 40}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `৳${Number(v).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 mt-2 px-2">
                    {summary.byCategory.map((cat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 text-center flex-shrink-0">{cat.icon}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(cat.amount / (summary.totalExpenses || 1)) * 100}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-20 text-right flex-shrink-0">
                          ৳{cat.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Trends ── */}
        <TabsContent value="trends" className="space-y-4 mt-4">
          <Card className="border border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">6-Month Spending Trend</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {loading ? (
                <Skeleton className="h-52 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={summary?.byMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="income"   name="Income"   stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Budgets ── */}
        <TabsContent value="budgets" className="space-y-4 mt-4">
          <BudgetsReport />
        </TabsContent>

        {/* ── Upcoming ── */}
        <TabsContent value="upcoming" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 bg-amber-500/10">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground mb-1">Total Upcoming</p>
                <p className="text-base font-bold text-amber-600">
                  ৳{(upcomingReport?.totalUpcoming || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-primary/10">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground mb-1">Available Balance</p>
                <p className="text-base font-bold text-primary">
                  ৳{(upcomingReport?.totalAvailableBalance || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming by category */}
          <Card className="border border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Upcoming by Category</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {!upcomingReport?.byCategory?.length ? (
                <p className="text-center text-muted-foreground text-sm py-6">No pending upcoming expenses</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={upcomingReport.byCategory} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `৳${Math.round(v / 1000)}k`} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={75} />
                    <Tooltip formatter={(v: any) => `৳${Number(v).toLocaleString()}`} />
                    <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
                      {(upcomingReport?.byCategory || []).map((entry, i) => (
                        <Cell key={i} fill={entry.color || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Projected wallet balances */}
          <Card className="border border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Projected Wallet Balances</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {!upcomingReport?.projectedBalances?.length ? (
                <p className="text-center text-muted-foreground text-sm py-6">No data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={upcomingReport.projectedBalances}>
                      <XAxis dataKey="wallet" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="current"   name="Current"    fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="projected" name="After Bills" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 mt-3 px-1">
                    {upcomingReport.projectedBalances.map((w, i) => (
                      <div key={i} className="flex items-center justify-between text-sm gap-2">
                        <span className="text-muted-foreground truncate">{w.wallet}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="font-medium">৳{w.current.toLocaleString()}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className={`font-semibold ${w.projected < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            ৳{w.projected.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Inline Budgets Report component ──
function BudgetsReport() {
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const res = await fetch(`/api/budgets?month=${format(new Date(), 'yyyy-MM')}`);
        const data = await res.json();
        setBudgetData(data.data || []);
      } catch {}
      setLoading(false);
    };
    fetchBudgetData();
  }, []);

  const chartData = budgetData.map((b) => ({
    category: b.categoryId?.name || 'Unknown',
    budgeted: b.amount,
    spent: b.spent || 0,
  }));

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Budget vs Actual (This Month)</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {loading ? (
          <Skeleton className="h-52 w-full" />
        ) : !chartData.length ? (
          <p className="text-center text-muted-foreground text-sm py-8">No budgets set for this month</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" barGap={2}>
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `৳${Math.round(v / 1000)}k`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={(v: any) => `৳${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="budgeted" name="Budget" fill="#6366f1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="spent"    name="Spent"  fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
