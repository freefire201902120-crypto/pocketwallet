import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  PackagePlus,
  X,
  Package,
} from 'lucide-react';
import { StoreProduct, WalletType, Language } from '../types/pocketwallet';
import { walletEngine } from '../services/walletEngine';

interface StorefrontViewProps {
  onTriggerCheckout: (wallet: WalletType, amount: number, invoice: string) => void;
  lang?: Language;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  onTriggerCheckout,
  lang = 'en',
}) => {
  const [products, setProducts] = useState<StoreProduct[]>(walletEngine.getProducts());
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>('bkash');

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Products');
  const [newStock, setNewStock] = useState('20');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    const unsub = walletEngine.subscribe(() => {
      setProducts(walletEngine.getProducts());
    });
    return unsub;
  }, []);

  const addToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const deleteItem = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleDeleteProduct = (id: string) => {
    walletEngine.deleteProduct(id);
    deleteItem(id);
    setProducts(walletEngine.getProducts());
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    walletEngine.addProduct({
      name: newTitle.trim(),
      nameBn: newTitle.trim(),
      price: Number(newPrice),
      image:
        newImage.trim() ||
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      category: newCategory.trim() || 'General',
      categoryBn: newCategory.trim() || 'সাধারণ',
      stock: Number(newStock) || 10,
    });

    setProducts(walletEngine.getProducts());
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    setNewCategory('Products');
    setNewStock('20');
    setNewImage('');
  };

  // Totals
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const prod = products.find((p) => p.id === id);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const discountAmount = Math.round(subtotal * appliedDiscount);
  const deliveryFee = subtotal > 0 ? 60 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'SAVE10') {
      setAppliedDiscount(0.1);
    } else {
      alert('Coupon not recognized. Try SAVE10 for 10% discount.');
    }
  };

  const handleCheckout = () => {
    if (finalTotal <= 0) return;
    const inv = `SHOP-${Date.now().toString().slice(-6)}`;
    onTriggerCheckout(selectedWallet, finalTotal, inv);
  };

  return (
    <div className="space-y-6">
      {/* Store Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'মার্চেন্ট স্টোরফ্রন্ট' : 'Merchant Storefront'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              MFS Gateway Integrated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {lang === 'bn'
              ? 'আপনার আসল প্রোডাক্ট বা সার্ভিস যোগ করে বিকাশ ও নগদ পেমেন্ট সংগ্রহ করুন।'
              : 'Add your real commercial catalog items and accept instant customer payments.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-pink-600/30 transition self-start sm:self-auto"
        >
          <PackagePlus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Main Layout: Products Grid + Cart Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Products Grid (8 cols) */}
        <div className="lg:col-span-8">
          {products.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'স্টোরে কোনো প্রোডাক্ট নেই' : 'Your Store Catalog is Empty'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {lang === 'bn'
                    ? 'আপনার পণ্যের নাম, দাম (টাকা ৳) ও বিবরণ দিয়ে প্রথম প্রোডাক্ট যোগ করুন।'
                    : 'All sample items were removed. Click below to add your first real product or service.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Product</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => {
                const qtyInCart = cart[product.id] || 0;

                return (
                  <div
                    key={product.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition flex flex-col justify-between group"
                  >
                    <div className="relative h-40 overflow-hidden bg-slate-950">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-slate-300 backdrop-blur-sm">
                        {product.category}
                      </span>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-slate-400 hover:text-rose-400 backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-2">
                          {product.name}
                        </h4>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-base font-extrabold text-white font-mono">
                            ৳ {product.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">BDT</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        {qtyInCart > 0 ? (
                          <div className="flex items-center justify-between bg-slate-950 rounded-xl p-1 border border-slate-800">
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-mono font-bold text-pink-400">
                              {qtyInCart} in Cart
                            </span>
                            <button
                              onClick={() => addToCart(product.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product.id)}
                            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart & Checkout Panel (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white">
                  {lang === 'bn' ? 'অর্ডার সারাংশ' : 'Cart & Order Summary'}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {Object.values(cart).reduce((a, b) => a + b, 0)} items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="py-3 space-y-3 max-h-60 overflow-y-auto">
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Your cart is empty. Add products to check out.
                </div>
              ) : (
                Object.entries(cart).map(([id, qty]) => {
                  const product = products.find((p) => p.id === id);
                  if (!product) return null;

                  return (
                    <div key={id} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex-1 truncate">
                        <div className="font-semibold text-white truncate">
                          {product.name}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          ৳{product.price} × {qty}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">
                          ৳{(product.price * qty).toLocaleString()}
                        </span>
                        <button
                          onClick={() => deleteItem(id)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Coupon Code input */}
            <form onSubmit={handleApplyCoupon} className="pt-2 flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Coupon code (Optional)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white uppercase placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
              >
                Apply
              </button>
            </form>

            {/* Cost Breakdown */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">৳ {subtotal.toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Special Discount</span>
                  <span className="font-mono">- ৳ {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span className="font-mono text-slate-200">৳ {deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Payable</span>
                <span className="font-mono text-pink-400 text-base">
                  ৳ {finalTotal.toLocaleString()} BDT
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Choice & Checkout Trigger */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-semibold text-slate-400">
              Payment Gateway:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedWallet('bkash')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition ${
                  selectedWallet === 'bkash'
                    ? 'border-[#E2136E] bg-pink-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#E2136E] text-white font-black text-[9px] flex items-center justify-center">
                  bK
                </div>
                <span className="text-xs">bKash Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWallet('nagad')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition ${
                  selectedWallet === 'nagad'
                    ? 'border-[#F7941D] bg-amber-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#F7941D] to-[#ED1C24] text-white font-bold text-[9px] flex items-center justify-center">
                  নগদ
                </div>
                <span className="text-xs">Nagad Pay</span>
              </button>
            </div>

            <button
              onClick={handleCheckout}
              disabled={finalTotal <= 0}
              className={`w-full py-3 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
                selectedWallet === 'bkash'
                  ? 'bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:opacity-95 shadow-pink-500/25'
                  : 'bg-gradient-to-r from-[#F7941D] to-[#ED1C24] hover:opacity-95 shadow-orange-500/25'
              } disabled:opacity-50`}
            >
              <span>{`Pay ৳${finalTotal.toLocaleString()} with ${selectedWallet.toUpperCase()}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-pink-400" />
                <span>Add Product to Store</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leather Wallet / Organic Tea"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price (BDT ৳)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1200"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Apparel, Electronics, Grocery, etc."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2 px-3 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
