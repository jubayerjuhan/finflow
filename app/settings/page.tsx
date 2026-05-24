'use client';

import { useEffect, useState } from 'react';
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
import { Plus, Trash2, Edit2, Wallet as WalletIcon, Tag, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const WALLET_ICONS = ['💵', '🏦', '📱', '💳', '💰', '🏧', '💎', '🪙'];
const WALLET_COLORS = ['#22c55e', '#3b82f6', '#e91e8c', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
const CATEGORY_ICONS = ['🍔', '🚌', '🛍️', '💊', '🎬', '🏠', '💰', '📚', '⚡', '📦', '✈️', '🎁', '💇', '🐾'];
const CATEGORY_COLORS = ['#f97316', '#3b82f6', '#ec4899', '#22c55e', '#a855f7', '#06b6d4', '#84cc16', '#f59e0b', '#64748b', '#6366f1'];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const wallets = useAppSelector((s) => s.wallets.items);
  const categories = useAppSelector((s) => s.categories.items);

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

  // Category form
  const [cName, setCName] = useState('');
  const [cIcon, setCIcon] = useState('📦');
  const [cColor, setCColor] = useState('#6366f1');
  const [cSaving, setCSaving] = useState(false);

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
      // Clear existing data via API then seed
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

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="wallets">
        <TabsList className="w-full grid grid-cols-3 rounded-xl h-10">
          <TabsTrigger value="wallets" className="rounded-lg text-xs sm:text-sm">
            <WalletIcon size={14} className="mr-1.5 flex-shrink-0" />Wallets
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg text-xs sm:text-sm">
            <Tag size={14} className="mr-1.5 flex-shrink-0" />Categories
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg text-xs sm:text-sm">Data</TabsTrigger>
        </TabsList>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="mt-4 space-y-3" id="wallets">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{wallets.length} wallets</p>
            <Button size="sm" onClick={() => setWalletDialog(true)} className="rounded-xl gap-1">
              <Plus size={14} /> New Wallet
            </Button>
          </div>

          <div className="space-y-2">
            {wallets.map((wallet) => (
              <Card key={wallet._id} className="border border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: wallet.color }}
                  >
                    {wallet.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{wallet.name}</p>
                    <p className="text-xs text-muted-foreground">{wallet.currency} · ৳{wallet.balance.toLocaleString()}</p>
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
            <p className="text-sm text-muted-foreground">{categories.length} categories</p>
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

        {/* Data Tab */}
        <TabsContent value="data" className="mt-4 space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-sm">Data Management</CardTitle>
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
            <DialogTitle>New Wallet</DialogTitle>
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

            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {WALLET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setWIcon(icon)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-xl border-2 transition-all',
                      wIcon === icon ? 'border-primary bg-primary/10' : 'border-border'
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {WALLET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setWColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full border-4 transition-all',
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
            <DialogTitle>New Category</DialogTitle>
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

            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCIcon(icon)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-xl border-2 transition-all',
                      cIcon === icon ? 'border-primary bg-primary/10' : 'border-border'
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full border-4 transition-all',
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
