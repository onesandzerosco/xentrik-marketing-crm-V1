import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, ShoppingCart, Package, Ticket, Copy, Check } from 'lucide-react';
import { useGamification, ShopItem, Purchase } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface SupplyDepotProps {
  isAdmin: boolean;
}

const SupplyDepot: React.FC<SupplyDepotProps> = ({ isAdmin }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    myStats,
    shopItems,
    myPurchases,
    isLoading,
    purchaseItem,
    refetch
  } = useGamification();

  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    banana_cost: 100,
    stock: null as number | null
  });
  const [allPurchases, setAllPurchases] = useState<any[]>([]);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  // Fetch all purchases for admin
  React.useEffect(() => {
    if (isAdmin) {
      fetchAllPurchases();
    }
  }, [isAdmin]);

  const fetchAllPurchases = async () => {
    const { data, error } = await supabase
      .from('gamification_purchases')
      .select(`
        *,
        profile:profiles!gamification_purchases_chatter_id_fkey (name),
        shop_item:gamification_shop_items (name)
      `)
      .order('purchased_at', { ascending: false });

    if (!error) {
      setAllPurchases((data as any) || []);
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.name.trim()) {
      toast({ title: "Error", description: "Item name is required", variant: "destructive" });
      return;
    }

    try {
      setIsCreating(true);
      const { error } = await supabase
        .from('gamification_shop_items')
        .insert({
          ...newItem,
          created_by: user?.id
        });

      if (error) throw error;

      toast({ title: "Success", description: "Shop item created successfully!" });
      setNewItem({ name: '', description: '', banana_cost: 100, stock: null });
      refetch.shopItems();
    } catch (error) {
      console.error('Error creating item:', error);
      toast({ title: "Error", description: "Failed to create shop item", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRedeemVoucher = async (purchaseId: string) => {
    try {
      const { error } = await supabase
        .from('gamification_purchases')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
          redeemed_by: user?.id
        })
        .eq('id', purchaseId);

      if (error) throw error;

      toast({ title: "Success", description: "Voucher marked as redeemed!" });
      fetchAllPurchases();
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast({ title: "Error", description: "Failed to redeem voucher", variant: "destructive" });
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeItems = shopItems.filter(item => item.is_active);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🍌</div>
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-3xl font-bold text-yellow-500">{myStats?.banana_balance || 0} Bananas</p>
              </div>
            </div>
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
          </div>
        </CardContent>
      </Card>

      {/* Admin Controls */}
      {isAdmin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Admin Controls</CardTitle>
            <CardDescription>Manage shop items and view purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Item Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shop Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Shop Item</DialogTitle>
                  <DialogDescription>
                    Add a new perk or reward that chatters can purchase with bananas.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input 
                      value={newItem.name}
                      onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Extra Day Off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newItem.description}
                      onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Describe the perk or reward..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Banana Cost 🍌</Label>
                      <Input 
                        type="number"
                        value={newItem.banana_cost}
                        onChange={e => setNewItem({ ...newItem, banana_cost: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock (leave empty for unlimited)</Label>
                      <Input 
                        type="number"
                        value={newItem.stock ?? ''}
                        onChange={e => setNewItem({ ...newItem, stock: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateItem} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Shop / My Purchases / (Admin: All Purchases) */}
      <Tabs defaultValue="shop" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="my-purchases" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            My Vouchers
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="all-purchases" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              All Purchases
            </TabsTrigger>
          )}
        </TabsList>

        {/* Shop Tab */}
        <TabsContent value="shop" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeItems.map(item => (
              <Card key={item.id} className="relative overflow-hidden">
                {item.stock !== null && item.stock <= 0 && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <Badge variant="destructive" className="text-lg px-4 py-2">Out of Stock</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.description && (
                        <CardDescription className="mt-1">{item.description}</CardDescription>
                      )}
                    </div>
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🍌</span>
                    <span className="text-2xl font-bold text-yellow-500">{item.banana_cost}</span>
                  </div>
                  {item.stock !== null && (
                    <p className="text-sm text-muted-foreground">
                      {item.stock} in stock
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={(myStats?.banana_balance || 0) < item.banana_cost || (item.stock !== null && item.stock <= 0)}
                    onClick={() => purchaseItem(item.id)}
                  >
                    {(myStats?.banana_balance || 0) < item.banana_cost ? 'Not enough bananas' : 'Purchase'}
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {activeItems.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No items available in the shop right now.
                  {isAdmin && " Add items using the admin controls above."}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* My Purchases Tab */}
        <TabsContent value="my-purchases" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Vouchers</CardTitle>
              <CardDescription>Your purchased vouchers and their redemption status</CardDescription>
            </CardHeader>
            <CardContent>
              {myPurchases.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  You haven't purchased anything yet. Visit the shop to spend your bananas!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Voucher Code</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Purchased</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPurchases.map(purchase => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.shop_item?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{purchase.voucher_code}</code>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => copyVoucherCode(purchase.voucher_code)}
                            >
                              {copiedVoucher === purchase.voucher_code ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{purchase.banana_spent} 🍌</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              purchase.status === 'redeemed' ? 'default' : 
                              purchase.status === 'expired' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {purchase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(purchase.purchased_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Purchases Tab (Admin) */}
        {isAdmin && (
          <TabsContent value="all-purchases" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Purchases</CardTitle>
                <CardDescription>View and manage all chatter purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {allPurchases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No purchases have been made yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chatter</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Voucher Code</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Purchased</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allPurchases.map(purchase => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">{purchase.profile?.name}</TableCell>
                          <TableCell>{purchase.shop_item?.name}</TableCell>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded text-sm">{purchase.voucher_code}</code>
                          </TableCell>
                          <TableCell>{purchase.banana_spent} 🍌</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                purchase.status === 'redeemed' ? 'default' : 
                                purchase.status === 'expired' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {purchase.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(purchase.purchased_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {purchase.status === 'unused' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRedeemVoucher(purchase.id)}
                              >
                                Mark Redeemed
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Manage Shop Items */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Manage Shop Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                        <TableCell>{item.banana_cost} 🍌</TableCell>
                        <TableCell>{item.stock ?? '∞'}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? 'default' : 'secondary'}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              await supabase
                                .from('gamification_shop_items')
                                .update({ is_active: !item.is_active })
                                .eq('id', item.id);
                              refetch.shopItems();
                            }}
                          >
                            {item.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SupplyDepot;
