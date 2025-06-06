'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Copy, ExternalLink, Edit, BarChart3, Globe, TestTube } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AffiliateLink {
  id: string;
  shortCode: string;
  productName: string;
  network: string;
  cloakedUrl: string;
  originalUrl: string;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  isActive: boolean;
  hasGeoTargeting: boolean;
  hasABTest: boolean;
}

export function LinkManager() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [newLink, setNewLink] = useState({
    url: '',
    network: 'amazon',
    productId: '',
    productName: '',
    category: '',
    commissionRate: 0
  });

  const [productSearch, setProductSearch] = useState({
    network: 'amazon',
    query: '',
    results: []
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard',
    });
  };

  const createAffiliateLink = async () => {
    try {
      const response = await fetch('/api/revenue/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      });

      if (response.ok) {
        setShowCreateDialog(false);
        // Refresh links
        fetchLinks();
        toast({
          title: 'Success',
          description: 'Affiliate link created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create affiliate link',
        variant: 'destructive'
      });
    }
  };

  const searchProducts = async () => {
    try {
      const response = await fetch(
        `/api/revenue/products/search?network=${productSearch.network}&query=${productSearch.query}`
      );
      const data = await response.json();
      if (data.success) {
        setProductSearch({ ...productSearch, results: data.data });
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const toggleLinkStatus = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/revenue/links/${linkId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        setLinks(links.map(link => 
          link.id === linkId ? { ...link, isActive } : link
        ));
      }
    } catch (error) {
      console.error('Error updating link status:', error);
    }
  };

  const fetchLinks = async () => {
    // Fetch implementation
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Affiliate Links</CardTitle>
              <CardDescription>
                Manage and track your affiliate links
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Link
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Affiliate Link</DialogTitle>
                  <DialogDescription>
                    Search for products or create a custom affiliate link
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="search" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search">Product Search</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Select
                        value={productSearch.network}
                        onValueChange={(value) => setProductSearch({...productSearch, network: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amazon">Amazon</SelectItem>
                          <SelectItem value="shareasale">ShareASale</SelectItem>
                          <SelectItem value="cj">CJ</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Search products..."
                        value={productSearch.query}
                        onChange={(e) => setProductSearch({...productSearch, query: e.target.value})}
                        className="col-span-2"
                      />
                    </div>
                    <Button onClick={searchProducts} className="w-full">
                      Search Products
                    </Button>
                    
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {productSearch.results.map((product: any) => (
                        <div 
                          key={product.id} 
                          className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setNewLink({
                              ...newLink,
                              url: product.url,
                              productId: product.id,
                              productName: product.name,
                              network: productSearch.network,
                              commissionRate: product.commissionRate || 0
                            });
                          }}
                        >
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(product.price)} • {product.commissionRate}% commission
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="network">Network</Label>
                        <Select
                          value={newLink.network}
                          onValueChange={(value) => setNewLink({...newLink, network: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amazon">Amazon</SelectItem>
                            <SelectItem value="shareasale">ShareASale</SelectItem>
                            <SelectItem value="cj">CJ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="url">Product URL</Label>
                        <Input
                          id="url"
                          value={newLink.url}
                          onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                          placeholder="https://example.com/product"
                        />
                      </div>

                      <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                          id="productName"
                          value={newLink.productName}
                          onChange={(e) => setNewLink({...newLink, productName: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="productId">Product ID</Label>
                        <Input
                          id="productId"
                          value={newLink.productId}
                          onChange={(e) => setNewLink({...newLink, productId: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newLink.category}
                          onChange={(e) => setNewLink({...newLink, category: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                        <Input
                          id="commissionRate"
                          type="number"
                          value={newLink.commissionRate}
                          onChange={(e) => setNewLink({...newLink, commissionRate: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAffiliateLink}>
                    Create Link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All networks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All networks</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="shareasale">ShareASale</SelectItem>
                  <SelectItem value="cj">CJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Short Link</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>{link.productName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {link.network.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm">{link.cloakedUrl}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(link.cloakedUrl)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{link.clicks}</TableCell>
                    <TableCell className="text-right">{link.conversions}</TableCell>
                    <TableCell className="text-right">{formatCurrency(link.revenue)}</TableCell>
                    <TableCell className="text-right">{link.conversionRate.toFixed(2)}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {link.hasGeoTargeting && (
                          <Badge variant="secondary" className="text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            Geo
                          </Badge>
                        )}
                        {link.hasABTest && (
                          <Badge variant="secondary" className="text-xs">
                            <TestTube className="w-3 h-3 mr-1" />
                            A/B
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={(checked) => toggleLinkStatus(link.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}