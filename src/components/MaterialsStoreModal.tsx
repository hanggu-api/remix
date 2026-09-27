import React, { useState } from 'react';
import {
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  Plus,
  Minus,
  Check,
  Percent,
  X,
  ShieldCheck,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { MaterialItem, PartnerStore } from '../types';
import { PARTNER_STORES } from '../data/mockStores';

interface MaterialsStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialItem[];
  onUpdateMaterials: (updated: MaterialItem[]) => void;
  serviceTitle: string;
  providerName?: string;
  onConfirmMaterialsToQuote?: (store: PartnerStore, totalMaterials: number) => void;
}

export const MaterialsStoreModal: React.FC<MaterialsStoreModalProps> = ({
  isOpen,
  onClose,
  materials,
  onUpdateMaterials,
  serviceTitle,
  providerName = 'Carlos Mendes',
  onConfirmMaterialsToQuote
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(PARTNER_STORES[0].id);
  const [items, setItems] = useState<MaterialItem[]>(materials);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const selectedStore = PARTNER_STORES.find((s) => s.id === selectedStoreId) || PARTNER_STORES[0];

  const handleToggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    setItems(updated);
    onUpdateMaterials(updated);
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          totalPrice: newQty * item.unitPrice
        };
      }
      return item;
    });
    setItems(updated);
    onUpdateMaterials(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const price = parseFloat(newItemPrice) || 15.0;
    const newItem: MaterialItem = {
      id: `mat-${Date.now()}`,
      name: newItemName.trim(),
      quantity: 1,
      unit: 'un',
      unitPrice: price,
      totalPrice: price,
      inStock: true,
      selected: true
    };
    const updated = [...items, newItem];
    setItems(updated);
    onUpdateMaterials(updated);
    setNewItemName('');
    setNewItemPrice('');
  };

  const selectedItems = items.filter((i) => i.selected);
  const subtotal = selectedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const discountAmount = (subtotal * selectedStore.discountPercent) / 100;
  const finalTotal = subtotal - discountAmount;

  const handleSendToWhatsAppStore = () => {
    const itemsText = selectedItems
      .map((item) => `• ${item.quantity}x ${item.name} (${item.suggestedBrand || 'Padrão'})`)
      .join('%0A');

    const message = `Olá, ${selectedStore.name}! Sou o prestador *${providerName}* do ProServiços.%0A%0AGostaria de solicitar a *separação no balcão* para o serviço: *${serviceTitle}*.%0A%0A*Itens Solicitados:*%0A${itemsText}%0A%0A*Subtotal Tabela:* R$ ${subtotal.toFixed(2)}%0A*Desconto ProServiços (${selectedStore.discountPercent}%):* -R$ ${discountAmount.toFixed(2)}%0A*Total Estimado:* R$ ${finalTotal.toFixed(2)}%0A%0APor favor, confirmem se está tudo separado para retirada rápida a caminho!`;

    window.open(`https://api.whatsapp.com/send?phone=${selectedStore.whatsapp}&text=${message}`, '_blank');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  const handleConfirmQuote = () => {
    if (onConfirmMaterialsToQuote) {
      onConfirmMaterialsToQuote(selectedStore, finalTotal);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Lista Inteligente de Materiais & Loja Parceira
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> IA Integrada
                </span>
              </div>
              <p className="text-xs text-slate-400">
                A IA lista os insumos e envia direto para separação no balcão da loja parceira
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Partner Store Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                1. Selecione a Loja Parceira no Trajeto:
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Percent className="w-3 h-3" /> Desconto Exclusivo ProServiços
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PARTNER_STORES.map((store) => {
                const isSelected = store.id === selectedStoreId;
                return (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStoreId(store.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/20'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          {store.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-[210px] mt-0.5">
                          {store.address}
                        </p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold shrink-0">
                        -{store.discountPercent}% OFF
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1 text-sky-400 font-semibold">
                        <MapPin className="w-3 h-3" /> {store.distanceKm} km ({store.etaMinutes} min)
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-amber-400" /> Pronto em {store.pickupReadyMinutes} min
                      </span>
                      <span className="text-amber-400 font-bold ml-auto">
                        ★ {store.rating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart Material List generated by AI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                2. Materiais Estimados para: "{serviceTitle}"
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedItems.length} selecionados
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 flex items-center justify-between gap-3 transition ${
                    item.selected ? 'bg-slate-900/40' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-xs truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        {item.suggestedBrand && (
                          <span className="text-slate-400">Marca: {item.suggestedBrand}</span>
                        )}
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">Em estoque na loja</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[65px]">
                      <div className="font-bold text-white text-xs">
                        R$ {item.totalPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        R$ {item.unitPrice.toFixed(2)}/{item.unit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add custom item */}
            <form onSubmit={handleAddItem} className="flex gap-2 mt-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="+ Adicionar outro material necessário (ex: 3m cabo flexível 2.5mm)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
              <input
                type="number"
                step="0.5"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="R$ Preço"
                className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
              >
                Adicionar
              </button>
            </form>
          </div>

          {/* Pricing summary */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Subtotal da Tabela Loja:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                Desconto Parceria ProServiços ({selectedStore.discountPercent}%):
              </span>
              <span>- R$ {discountAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-white font-bold text-sm block">Total de Materiais:</span>
                <span className="text-[11px] text-slate-400">
                  Retirada no balcão da {selectedStore.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-amber-400">
                  R$ {finalTotal.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-400 block font-medium">
                  Economia de R$ {discountAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notice of Transparency */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-[11px] flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white">Transparência Total:</strong> O cliente visualiza a nota fiscal da loja parceira diretamente no aplicativo, garantindo que não há sobrepreço em materiais.
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSendToWhatsAppStore}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {sentSuccess ? 'Lista Enviada via WhatsApp!' : 'Mandar Lista para a Loja no WhatsApp'}
            </span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Fechar
            </button>

            {onConfirmMaterialsToQuote && (
              <button
                type="button"
                onClick={handleConfirmQuote}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/25"
              >
                <Check className="w-4 h-4" />
                <span>Incluir no Orçamento</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
