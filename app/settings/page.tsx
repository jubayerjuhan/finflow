'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchWallets,
  createWallet,
  updateWallet,
  deleteWallet,
  Wallet,
} from '@/store/slices/walletsSlice';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  Category,
} from '@/store/slices/categoriesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, Wallet as WalletIcon, Tag, RefreshCcw, Sun, Moon, Monitor,
  Smile, Palette, Banknote, Settings2, Database,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { setTheme, ThemeMode } from '@/store/slices/themeSlice';

const WALLET_ICONS = ['💵', '🏦', '📱', '💳', '💰', '🏧', '💎', '🪙', '👛', '🏪', '💸', '🤑'];
const WALLET_COLORS = ['#22c55e', '#3b82f6', '#e91e8c', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f59e0b', '#ef4444'];
const CATEGORY_ICONS = ['🍔', '🚌', '🛍️', '💊', '🎬', '🏠', '💰', '📚', '⚡', '📦', '✈️', '🎁', '💇', '🐾', '🎮', '☕', '🍕', '🏋️', '🎓', '🚗', '🏥', '🛒', '📺', '🎵'];
const CATEGORY_COLORS = ['#f97316', '#3b82f6', '#ec4899', '#22c55e', '#a855f7', '#06b6d4', '#84cc16', '#f59e0b', '#64748b', '#6366f1', '#ef4444', '#10b981'];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const wallets = useAppSelector((s) => s.wallets.items);
  const categories = useAppSelector((s) => s.categories.items);
  const currentTheme = useAppSelector((s) => (s as any).theme?.mode ?? 'system') as ThemeMode;

  const [walletDialog, setWalletDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  // Wallet form
  const [wName, setWName] = useState('');
  const [wIcon, setWIcon] = useState('💳');
  const [wColor, setWColor] = useState('#6366f1');
  const [wCurrency, setWCurrency] = useState('BDT');
  const [wBalance, setWBalance] = useState('0');
  const [wSaving, setWSaving] = useState(false);
  const wIconInputRef = useRef<HTMLInputElement>(null);

  // Category form
  const [cName, setCName] = useState('');
  const [cIcon, setCIcon] = useState('📦');
  const [cColor, setCColor] = useState('#6366f1');
  const [cSaving, setCSaving] = useState(false);
  const cIconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchWallets());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wName.trim()) { toast.error('Enter a wallet name'); return; }
    setWSaving(true);
    try {
      await dispatch(createWallet({
        name: wName.trim(),
        icon: wIcon,
        color: wColor,
        currency: wCurrency,
        balance: parseFloat(wBalance) || 0,
      })).unwrap();
      toast.success('Wallet created!');
      setWalletDialog(false);
      setWName(''); setWIcon('💳'); setWColor('#6366f1'); setWBalance('0');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create wallet');
    } finally {
      setWSaving(false);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm('Delete this wallet? All transactions will still exist.')) return;
    try {
      await dispatch(deleteWallet(id)).unwrap();
      toast.success('Wallet deleted');
    } catch {
      toast.error('Failed to delete wallet');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) { toast.error('Enter a category name'); return; }
    setCSaving(true);
    try {
      await dispatch(createCategory({
        name: cName.trim(),
        icon: cIcon,
        color: cColor,
      })).unwrap();
      toast.success('Category created!');
      setCategoryDialog(false);
      setCName(''); setCIcon('📦'); setCColor('#6366f1');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create category');
    } finally {
      setCSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (cat.isDefault) { toast.error('Cannot delete default categories'); return; }
    if (!confirm('Delete this category?')) return;
    try {
      await dispatch(deleteCategory(cat._id)).unwrap();
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleReseed = async () => {
    if (!confirm('This will reset all data! Are you sure?')) return;
    setReseeding(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      toast.success('Data reset and reseeded!');
      dispatch(fetchWallets());
      dispatch(fetchCategories());
    } catch {
      toast.error('Failed to reseed');
    } finally {
      setReseeding(false);
    }
  };

  // Emoji input helper — extract first emoji/char from typed input
  const extractEmoji = (val: string) => {
    const segments = [...new Intl.Segmenter().segment(val)];
    return segments[0]?.segment ?? val[0] ?? '';
  };

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings2 size={18} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="wallets">
        <TabsList className="w-full grid grid-cols-4 rounded-xl h-10">
          <TabsTrigger value="wallets" className="rounded-lg text-xs sm:text-sm">
            <WalletIcon size={14} className="mr-1 flex-shrink-0" />Wallets
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg text-xs sm:text-sm">
            <Tag size={14} className="mr-1 flex-shrink-0" />Categories
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg text-xs sm:text-sm">
            <Palette size={14} className="mr-1 flex-shrink-0" />Theme
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg text-xs sm:text-sm">
            <Database size={14} className="mr-1 flex-shrink-0" />Data
          </TabsTrigger>
        </TabsList>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="mt-4 space-y-3" id="wallets">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <WalletIcon size={13} /> {wallets.length} wallets
            </p>
            <Button size="sm" onClick={() => setWalletDialog(true)} className="rounded-xl gap-1">
              <Plus size={14} /> New Wallet
            </Button>
          </div>

          <div className="space-y-2">
            {wallets.map((wallet) => (
              <Card key={wallet._id} className="border border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: wallet.color }}
                  >
                    {wallet.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{wallet.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Banknote size={11} /> {wallet.currency} · ৳{wallet.balance.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteWallet(wallet._id)}
                    className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Tag size={13} /> {categories.length} categories
            </p>
            <Button size="sm" onClick={() => setCategoryDialog(true)} className="rounded-xl gap-1">
              <Plus size={14} /> New Category
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <Card key={cat._id} className="border border-border">
                <CardContent className="p-3 flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: cat.color + '22', border: `1.5px solid ${cat.color}44` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{cat.name}</p>
                    {cat.isDefault && (
                      <Badge variant="secondary" className="text-[9px] h-3.5 px-1">default</Badge>
                    )}
                  </div>
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sun size={15} className="text-primary" /> Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">Color Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { mode: 'light' as ThemeMode, icon: Sun, label: 'Light', desc: 'Always light', emoji: '☀️' },
                      { mode: 'system' as ThemeMode, icon: Monitor, label: 'System', desc: 'Follow device', emoji: '💻' },
                      { mode: 'dark' as ThemeMode, icon: Moon, label: 'Dark', desc: 'Always dark', emoji: '🌙' },
                    ] as const
                  ).map(({ mode, icon: Icon, label, desc, emoji }) => (
                    <button
                      key={mode}
                      onClick={() => dispatch(setTheme(mode))}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                        currentTheme === mode
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <div className="text-center">
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-[10px] opacity-70">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="mt-4 space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Database size={15} className="text-primary" /> Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Reset & Reseed Data</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Creates fresh sample wallets, categories, and transactions. Existing data must be cleared manually from MongoDB.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReseed}
                  disabled={reseeding}
                  className="gap-1.5 rounded-xl"
                >
                  <RefreshCcw size={13} />
                  {reseeding ? 'Reseeding...' : 'Seed Sample Data'}
                </Button>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">About FinFlow</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Built with Next.js 14, MongoDB, Redux Toolkit
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wallet Dialog */}
      <Dialog open={walletDialog} onOpenChange={setWalletDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[90dvh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <WalletIcon size={16} className="text-primary" /> New Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            <form onSubmit={handleCreateWallet} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Savings"
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Emoji Picker for Wallet Icon */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Smile size={13} className="text-primary" /> Icon
                  <span className="text-xs text-muted-foreground font-normal ml-1">— type, paste or use your emoji keyboard</span>
                </Label>

                {/* Big emoji display + free input */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => wIconInputRef.current?.focus()}
                    className="w-14 h-14 rounded-2xl border-2 border-primary bg-primary/5 text-3xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                  >
                    {wIcon}
                  </button>
                  <div className="flex-1">
                    <Input
                      ref={wIconInputRef}
                      value={wIcon}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) setWIcon(extractEmoji(val));
                      }}
                      className="rounded-xl text-center text-lg font-bold h-11"
                      placeholder="Type or paste any emoji"
                      maxLength={8}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                      💡 Mac: Ctrl+Cmd+Space · Windows: Win+.
                    </p>
                  </div>
                </div>

                {/* Quick picks */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {WALLET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setWIcon(icon)}
                      className={cn(
                        'w-10 h-10 rounded-xl text-xl border-2 transition-all hover:scale-110',
                        wIcon === icon ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Palette size={13} className="text-primary" /> Color
                </Label>
                <div className="flex flex-wrap gap-2">
                  {WALLET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setWColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full border-4 transition-all hover:scale-110',
                        wColor === color ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input
                    value={wCurrency}
                    onChange={(e) => setWCurrency(e.target.value)}
                    className="rounded-xl"
                    placeholder="BDT"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Starting Balance</Label>
                  <Input
                    type="number"
                    value={wBalance}
                    onChange={(e) => setWBalance(e.target.value)}
                    className="rounded-xl"
                    min="0"
                  />
                </div>
              </div>

              {/* Preview */}
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ backgroundColor: wColor }}
              >
                <span className="text-2xl">{wIcon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{wName || 'Wallet Name'}</p>
                  <p className="text-white/70 text-xs">৳{parseFloat(wBalance || '0').toLocaleString()}</p>
                </div>
              </div>

              <Button type="submit" disabled={wSaving} className="w-full rounded-xl">
                {wSaving ? 'Creating...' : 'Create Wallet'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[90dvh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Tag size={16} className="text-primary" /> New Category
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            <form onSubmit={handleCreateCategory} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Coffee"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Emoji Picker for Category Icon */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Smile size={13} className="text-primary" /> Icon
                  <span className="text-xs text-muted-foreground font-normal ml-1">— any emoji you like!</span>
                </Label>

                {/* Big emoji display + free input */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => cIconInputRef.current?.focus()}
                    className="w-14 h-14 rounded-2xl border-2 border-primary bg-primary/5 text-3xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                    style={{ borderColor: cColor + '88', backgroundColor: cColor + '15' }}
                  >
                    {cIcon}
                  </button>
                  <div className="flex-1">
                    <Input
                      ref={cIconInputRef}
                      value={cIcon}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) setCIcon(extractEmoji(val));
                      }}
                      className="rounded-xl text-center text-lg font-bold h-11"
                      placeholder="Type or paste any emoji"
                      maxLength={8}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                      💡 Mac: Ctrl+Cmd+Space · Windows: Win+.
                    </p>
                  </div>
                </div>

                {/* Quick picks */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setCIcon(icon)}
                      className={cn(
                        'w-10 h-10 rounded-xl text-xl border-2 transition-all hover:scale-110',
                        cIcon === icon ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Palette size={13} className="text-primary" /> Color
                </Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full border-4 transition-all hover:scale-110',
                        cColor === color ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div
                className="rounded-xl p-3 flex items-center gap-3 border-2"
                style={{ borderColor: cColor + '44', backgroundColor: cColor + '11' }}
              >
                <span className="text-2xl">{cIcon}</span>
                <p className="font-medium text-sm">{cName || 'Category Name'}</p>
              </div>

              <Button type="submit" disabled={cSaving} className="w-full rounded-xl">
                {cSaving ? 'Creating...' : 'Create Category'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
