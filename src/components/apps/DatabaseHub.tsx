import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ProductItem, ClientItem, OrderItem } from '../../types/database';
import {
  Database,
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Tag,
  Sparkles,
  Shield,
  ShieldAlert,
  HardDrive,
  Package,
  Users,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

export const DatabaseHub: React.FC = () => {
  const {
    products,
    clients,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    updateClient,
    deleteClient,
    addOrder,
    updateOrder,
    deleteOrder,
    settings,
    togglePrivacyMode,
    maskSensitive,
    exportDatabaseJson,
    importDatabaseJson,
    storageStats,
    logActivity,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'products' | 'clients' | 'orders'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for creating/editing records
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);

  // New item form drafts
  const [newProductDraft, setNewProductDraft] = useState({
    sku: '',
    title: '',
    category: 'Substrates & Media',
    price: 0,
    stock: 0,
    minStock: 10,
    status: 'In Stock' as const,
    labels: '',
    description: '',
  });

  const [newClientDraft, setNewClientDraft] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    city: '',
    totalOrders: 0,
    totalSpent: 0,
    status: 'Active' as const,
    notes: '',
  });

  const [newOrderDraft, setNewOrderDraft] = useState({
    orderNumber: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
    clientName: '',
    amount: 0,
    status: 'Pending' as const,
    date: new Date().toISOString().split('T')[0],
    itemsSummary: '',
    paymentMethod: 'Advance / Bank Transfer',
  });

  // AI Generation on Product
  const [isAiGenerating, setIsAiGenerating] = useState<string | null>(null);

  const handleGenerateLabelsWithAi = async (product: ProductItem) => {
    setIsAiGenerating(product.id);
    try {
      const response = await fetch('/api/gemini/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'labels',
          template: 'Product: {{product_name}}\nCategory: {{category}}\nGenerate 5 SEO search tags as comma-separated values only.',
          variables: { product_name: product.title, category: product.category },
        }),
      });
      const data = await response.json();
      if (data.result) {
        const rawTags = data.result
          .replace(/Tags:|Search Tags:/i, '')
          .split(/[,;\n]/)
          .map((t: string) => t.trim().replace(/^[-*•0-9.]+\s*/, ''))
          .filter((t: string) => t.length > 1)
          .slice(0, 6);
        updateProduct(product.id, { labels: rawTags });
        logActivity('AI Labels Generated', 'Database', `Generated ${rawTags.length} tags for ${product.sku}`, 'success');
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAiGenerating(null);
    }
  };

  const handleGenerateDescriptionWithAi = async (product: ProductItem) => {
    setIsAiGenerating(product.id);
    try {
      const response = await fetch('/api/gemini/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'descriptions',
          template: 'Product: {{product_name}}\nCategory: {{category}}\nPrice: ${{price}}\nWrite an executive 2-sentence commercial description with specifications.',
          variables: { product_name: product.title, category: product.category, price: String(product.price) },
        }),
      });
      const data = await response.json();
      if (data.result) {
        updateProduct(product.id, { description: data.result.trim() });
        logActivity('AI Description Generated', 'Database', `Updated description for ${product.sku}`, 'success');
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAiGenerating(null);
    }
  };

  // Filtered queries
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0f1d] text-slate-100 overflow-hidden select-text">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#0e1422] shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">RAJ EXPO PERSONAL DATABASE</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Real Local-First Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {storageStats.totalRecords} total items · {(storageStats.byteSize / 1024).toFixed(1)} KB persisted
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Privacy Toggle */}
          <button
            onClick={togglePrivacyMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              settings.privacyMode
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {settings.privacyMode ? <Shield className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            <span>{settings.privacyMode ? 'Data Masking: ON' : 'Data Masking: OFF'}</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={exportDatabaseJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" /> Export JSON
          </button>

          {/* Add Record Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white border border-sky-500/40 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add {activeTab === 'products' ? 'Product' : activeTab === 'clients' ? 'Client' : 'Order'}
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="px-6 py-3 border-b border-white/10 bg-[#070b14] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-lg">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'products'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'clients'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Clients & Accounts ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Orders & Log ({orders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full bg-[#121929] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* Table Content Viewport */}
      <div className="flex-1 overflow-auto p-6">
        {/* PRODUCTS TABLE */}
        {activeTab === 'products' && (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0e1422]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121929] text-slate-400 font-semibold border-b border-white/10 select-none">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Title & Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Catalog Labels</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-sky-400 whitespace-nowrap">{p.sku}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-white truncate">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.category}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-200">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {p.stock} <span className="text-[10px] text-slate-500">units</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'In Stock'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : p.status === 'Low Stock'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-red-500/15 text-red-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {p.labels.map((lbl, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleGenerateLabelsWithAi(p)}
                        disabled={isAiGenerating === p.id}
                        title="Generate Search Labels with AI"
                        className="p-1 rounded text-sky-400 hover:bg-sky-500/20 transition-colors"
                      >
                        <Tag className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => handleGenerateDescriptionWithAi(p)}
                        disabled={isAiGenerating === p.id}
                        title="Generate Product Description with AI"
                        className="p-1 rounded text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        title="Delete Record"
                        className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CLIENTS TABLE */}
        {activeTab === 'clients' && (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0e1422]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121929] text-slate-400 font-semibold border-b border-white/10 select-none">
                <tr>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Email (Protected)</th>
                  <th className="px-4 py-3">Phone (Protected)</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3 text-right">Orders</th>
                  <th className="px-4 py-3 text-right">Total Spent</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-slate-300">{c.company}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {maskSensitive(c.email, 'email')}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {maskSensitive(c.phone, 'phone')}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{c.city}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-emerald-400">
                      ${c.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteClient(c.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS TABLE */}
        {activeTab === 'orders' && (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0e1422]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121929] text-slate-400 font-semibold border-b border-white/10 select-none">
                <tr>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Manifest Summary</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-sky-400">{o.orderNumber}</td>
                    <td className="px-4 py-3 font-semibold text-white">{o.clientName}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      ${o.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : o.status === 'In Transit'
                            ? 'bg-sky-500/15 text-sky-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{o.date}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{o.itemsSummary}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteOrder(o.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Order Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#0e1422] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                Add New {activeTab === 'products' ? 'Product' : activeTab === 'clients' ? 'Client' : 'Order'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {activeTab === 'products' && (
                <>
                  <div>
                    <label className="text-[11px] text-slate-400">SKU Code</label>
                    <input
                      type="text"
                      value={newProductDraft.sku}
                      onChange={(e) => setNewProductDraft({ ...newProductDraft, sku: e.target.value })}
                      placeholder="e.g. RED-TEX-09"
                      className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Title</label>
                    <input
                      type="text"
                      value={newProductDraft.title}
                      onChange={(e) => setNewProductDraft({ ...newProductDraft, title: e.target.value })}
                      placeholder="Product full name"
                      className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400">Unit Price ($)</label>
                      <input
                        type="number"
                        value={newProductDraft.price}
                        onChange={(e) => setNewProductDraft({ ...newProductDraft, price: parseFloat(e.target.value) || 0 })}
                        className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Initial Stock</label>
                      <input
                        type="number"
                        value={newProductDraft.stock}
                        onChange={(e) => setNewProductDraft({ ...newProductDraft, stock: parseInt(e.target.value, 10) || 0 })}
                        className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'clients' && (
                <>
                  <div>
                    <label className="text-[11px] text-slate-400">Contact Name</label>
                    <input
                      type="text"
                      value={newClientDraft.name}
                      onChange={(e) => setNewClientDraft({ ...newClientDraft, name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Company</label>
                    <input
                      type="text"
                      value={newClientDraft.company}
                      onChange={(e) => setNewClientDraft({ ...newClientDraft, company: e.target.value })}
                      placeholder="Company Name"
                      className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400">Email</label>
                      <input
                        type="email"
                        value={newClientDraft.email}
                        onChange={(e) => setNewClientDraft({ ...newClientDraft, email: e.target.value })}
                        placeholder="client@domain.com"
                        className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={newClientDraft.phone}
                        onChange={(e) => setNewClientDraft({ ...newClientDraft, phone: e.target.value })}
                        placeholder="+91..."
                        className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'orders' && (
                <>
                  <div>
                    <label className="text-[11px] text-slate-400">Order Number</label>
                    <input
                      type="text"
                      value={newOrderDraft.orderNumber}
                      onChange={(e) => setNewOrderDraft({ ...newOrderDraft, orderNumber: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Client Name</label>
                    <input
                      type="text"
                      value={newOrderDraft.clientName}
                      onChange={(e) => setNewOrderDraft({ ...newOrderDraft, clientName: e.target.value })}
                      placeholder="Select or type client"
                      className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Total Amount ($)</label>
                    <input
                      type="number"
                      value={newOrderDraft.amount}
                      onChange={(e) => setNewOrderDraft({ ...newOrderDraft, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10 bg-black/30">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'products') {
                    if (!newProductDraft.title) return;
                    addProduct({
                      sku: newProductDraft.sku || `RED-ITEM-${Math.floor(100 + Math.random() * 900)}`,
                      title: newProductDraft.title,
                      category: newProductDraft.category,
                      price: newProductDraft.price,
                      stock: newProductDraft.stock,
                      minStock: 10,
                      status: newProductDraft.stock > 0 ? 'In Stock' : 'Out of Stock',
                      labels: ['New', 'Catalog'],
                      description: 'Raj Expo Digitals catalog item.',
                    });
                  } else if (activeTab === 'clients') {
                    if (!newClientDraft.name) return;
                    addClient({
                      name: newClientDraft.name,
                      company: newClientDraft.company || 'Enterprise Partner',
                      email: newClientDraft.email || 'client@rajexpo.com',
                      phone: newClientDraft.phone || '+91 00000 00000',
                      city: 'National',
                      totalOrders: 1,
                      totalSpent: 0,
                      status: 'Active',
                      notes: 'Created via Database Hub',
                      lastContact: new Date().toISOString().split('T')[0],
                    });
                  } else {
                    if (!newOrderDraft.clientName) return;
                    addOrder({
                      orderNumber: newOrderDraft.orderNumber,
                      clientName: newOrderDraft.clientName,
                      amount: newOrderDraft.amount,
                      status: 'Processing',
                      date: newOrderDraft.date,
                      itemsSummary: 'Direct invoice creation',
                      paymentMethod: 'Wire / Pending',
                    });
                  }
                  setIsAddModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
