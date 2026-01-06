
import React, { useState, useMemo } from 'react';
import { Customer, Product, PaymentMethod, Sale, Receipt } from '../types';
import { formatCurrency, formatDate, ensureDate } from '../utils';

interface CustomerListProps {
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  receipts: Receipt[];
  onSale: (cid: string, pid: string, qty: number, isReturn?: boolean) => void;
  onReceipt: (cid: string, amount: number, method: PaymentMethod, inst: number) => void;
  onAddCustomer: (c: Omit<Customer, 'id' | 'pendingBalance'>) => void;
  onEditCustomer: (id: string, updatedData: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  customers, 
  products, 
  sales, 
  receipts, 
  onSale, 
  onReceipt, 
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [newCustomer, setNewCustomer] = useState({ name: '', cpf: '', address: '', phone: '', ficha: '' });
  const [editingCustomerData, setEditingCustomerData] = useState<Customer | null>(null);
  const [saleData, setSaleData] = useState({ productId: '', quantity: 1, isReturn: false });
  const [receiptData, setReceiptData] = useState({ amount: 0, method: PaymentMethod.PIX, installments: 1 });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Filter customers by search term (Name, CPF or Phone)
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.cpf.includes(term) ||
      (c.phone && c.phone.includes(term))
    );
  }, [customers, searchTerm]);

  // Combine sales and receipts for chronological history
  const history = useMemo(() => {
    if (!selectedCustomerId) return [];
    
    const customerSales = sales
      .filter(s => s.customerId === selectedCustomerId)
      .map(s => ({ ...s, type: 'SALE' as const }));
    
    const customerReceipts = receipts
      .filter(r => r.customerId === selectedCustomerId)
      .map(r => ({ ...r, type: 'RECEIPT' as const }));

    return [...customerSales, ...customerReceipts].sort((a, b) => 
      ensureDate(b.date).getTime() - ensureDate(a.date).getTime()
    );
  }, [selectedCustomerId, sales, receipts]);

  const resetModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowSaleModal(false);
    setShowReceiptModal(false);
    setEditingCustomerData(null);
  };

  const handleOpenEdit = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomerData({ ...customer });
    setShowEditModal(true);
  };

  const handleConfirmDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onDeleteCustomer(id);
    if (selectedCustomerId === id) setSelectedCustomerId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <header className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          
          <div className="relative group">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Nome, CPF ou Telefone..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
          {filteredCustomers.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedCustomerId(c.id)}
              className={`group relative w-full text-left p-4 rounded-xl border cursor-pointer transition-all ${
                selectedCustomerId === c.id 
                  ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500' 
                  : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
            >
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleOpenEdit(c, e)}
                  className="p-1.5 bg-white border border-gray-100 text-blue-600 rounded-lg hover:bg-blue-50 shadow-sm"
                  title="Editar"
                >
                  <i className="fas fa-pencil-alt text-[10px]"></i>
                </button>
                <button 
                  onClick={(e) => handleConfirmDelete(c.id, e)}
                  className="p-1.5 bg-white border border-gray-100 text-red-600 rounded-lg hover:bg-red-50 shadow-sm"
                  title="Excluir"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>

              <div className="flex justify-between items-start mb-2 pr-12">
                <span className="font-bold text-gray-800 truncate">{c.name}</span>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-mono">{c.cpf}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${c.pendingBalance > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {c.pendingBalance > 0 ? 'Pendente' : 'Em dia'}
                    </span>
                    {c.phone && <span className="text-[9px] text-gray-400 font-medium"><i className="fas fa-phone text-[8px] mr-1"></i>{c.phone}</span>}
                  </div>
                </div>
                <span className={`font-bold ${c.pendingBalance > 0 ? 'text-red-500' : 'text-blue-600'}`}>
                  {formatCurrency(c.pendingBalance)}
                </span>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center">
              <i className="fas fa-users-slash text-2xl mb-2 opacity-20"></i>
              <p className="text-sm">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-8">
        {selectedCustomer ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-3xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEdit(selectedCustomer)}
                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                        title="Editar Cliente"
                      >
                        <i className="fas fa-pencil-alt text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleConfirmDelete(selectedCustomer.id)}
                        className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                        title="Excluir Cliente"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><i className="fas fa-id-card text-blue-400 w-4"></i> {selectedCustomer.cpf}</span>
                    <span className="flex items-center gap-1"><i className="fas fa-phone text-green-400 w-4"></i> {selectedCustomer.phone}</span>
                    <span className="flex items-center gap-1"><i className="fas fa-map-marker-alt text-red-400 w-4"></i> {selectedCustomer.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Saldo Devedor</p>
                  <p className={`text-4xl font-black ${selectedCustomer.pendingBalance > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatCurrency(selectedCustomer.pendingBalance)}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowSaleModal(true)}
                  className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                  <i className="fas fa-cart-shopping"></i>
                  Lançar Venda
                </button>
                <button 
                  onClick={() => setShowReceiptModal(true)}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                  <i className="fas fa-hand-holding-dollar"></i>
                  Receber Pagamento
                </button>
              </div>
            </div>

            <div className="p-8">
              <h4 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                <i className="fas fa-history text-blue-500"></i>
                Histórico de Movimentações
              </h4>
              
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                {history.map((item) => (
                  <div key={item.id} className="relative pl-8">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      item.type === 'SALE' 
                        ? (item.isReturn ? 'bg-orange-500' : 'bg-blue-600') 
                        : 'bg-emerald-500'
                    }`}></div>
                    
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.type === 'SALE' 
                              ? (item.isReturn ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700') 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.type === 'SALE' ? (item.isReturn ? 'Devolução' : 'Venda') : 'Recebimento'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-tighter">{formatDate(ensureDate(item.date))}</span>
                        </div>
                        <span className={`font-black ${
                          item.type === 'SALE' 
                            ? (item.isReturn ? 'text-red-500' : 'text-slate-900') 
                            : 'text-emerald-600'
                        }`}>
                          {item.type === 'SALE' ? (item.isReturn ? '-' : '+') : '-'}
                          {formatCurrency(item.type === 'SALE' ? Math.abs(item.total) : item.amount)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="text-sm">
                          {item.type === 'SALE' ? (
                            <p className="text-gray-700 font-medium">
                              {item.quantity}x {item.productName}
                            </p>
                          ) : (
                            <p className="text-gray-700 font-medium flex items-center gap-2">
                              <i className="fas fa-wallet text-gray-400"></i>
                              {item.method} {item.installments > 1 && `(${item.installments}x)`}
                            </p>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                          <i className="fas fa-user-tag text-[8px]"></i>
                          {item.sellerName}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 ml-4">
                    <i className="fas fa-ghost text-2xl mb-2 block opacity-20"></i>
                    Nenhuma movimentação registrada.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-user-circle text-4xl text-gray-300"></i>
            </div>
            <p className="text-lg font-bold text-gray-500">Gestão de Clientes</p>
            <p className="text-sm max-w-xs text-center">Selecione um cliente na lista à esquerda para gerenciar vendas, pagamentos e histórico.</p>
          </div>
        )}
      </div>

      {/* Modal Adicionar Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-slate-900">Novo Cliente</h3>
               <button onClick={resetModals} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Dados Pessoais</label>
                <input placeholder="Nome Completo" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                <input placeholder="CPF" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={newCustomer.cpf} onChange={e => setNewCustomer({...newCustomer, cpf: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Contato e Localização</label>
                <input placeholder="Telefone" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                <input placeholder="Endereço" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              </div>
              <textarea placeholder="Observações/Ficha" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 h-32 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none" value={newCustomer.ficha} onChange={e => setNewCustomer({...newCustomer, ficha: e.target.value})} />
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={resetModals} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600">Cancelar</button>
              <button 
                onClick={() => {
                  if(!newCustomer.name) return;
                  onAddCustomer(newCustomer);
                  setNewCustomer({ name: '', cpf: '', address: '', phone: '', ficha: '' });
                  resetModals();
                }}
                className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && editingCustomerData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-slate-900">Editar Cliente</h3>
               <button onClick={resetModals} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Dados Pessoais</label>
                <input placeholder="Nome Completo" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={editingCustomerData.name} onChange={e => setEditingCustomerData({...editingCustomerData, name: e.target.value})} />
                <input placeholder="CPF" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={editingCustomerData.cpf} onChange={e => setEditingCustomerData({...editingCustomerData, cpf: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Contato e Localização</label>
                <input placeholder="Telefone" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={editingCustomerData.phone} onChange={e => setEditingCustomerData({...editingCustomerData, phone: e.target.value})} />
                <input placeholder="Endereço" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={editingCustomerData.address} onChange={e => setEditingCustomerData({...editingCustomerData, address: e.target.value})} />
              </div>
              <textarea placeholder="Observações/Ficha" className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 h-32 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none" value={editingCustomerData.ficha} onChange={e => setEditingCustomerData({...editingCustomerData, ficha: e.target.value})} />
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={resetModals} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600">Cancelar</button>
              <button 
                onClick={() => {
                  if(!editingCustomerData.name) return;
                  onEditCustomer(editingCustomerData.id, editingCustomerData);
                  resetModals();
                }}
                className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {showSaleModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Lançar Venda/Devolução</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Produto</label>
                <select 
                  className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={saleData.productId}
                  onChange={e => setSaleData({...saleData, productId: e.target.value})}
                >
                  <option value="">Selecione o Item</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)} ({p.stock} em estoque)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Qtd</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4"
                    value={saleData.quantity}
                    onChange={e => setSaleData({...saleData, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="flex-1">
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Tipo</label>
                   <button 
                     onClick={() => setSaleData({...saleData, isReturn: !saleData.isReturn})}
                     className={`w-full py-4 rounded-2xl font-bold border-2 transition-all ${
                       saleData.isReturn ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-600'
                     }`}
                   >
                     {saleData.isReturn ? 'Devolução' : 'Venda Normal'}
                   </button>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={resetModals} className="flex-1 py-4 text-slate-400 font-bold">Cancelar</button>
              <button 
                onClick={() => {
                  if (!saleData.productId) return alert("Selecione um produto");
                  onSale(selectedCustomer.id, saleData.productId, saleData.quantity, saleData.isReturn);
                  resetModals();
                }}
                className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black shadow-xl"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-emerald-700 mb-6">Receber Pagamento</h3>
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <span className="text-xs text-emerald-600 font-black block uppercase mb-1">Dívida Total</span>
                <span className="text-3xl font-black text-emerald-800">{formatCurrency(selectedCustomer.pendingBalance)}</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Valor Pago</label>
                <input 
                  type="number"
                  className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 text-xl font-bold"
                  value={receiptData.amount}
                  onChange={e => setReceiptData({...receiptData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Método</label>
                  <select 
                    className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 font-bold"
                    value={receiptData.method}
                    onChange={e => setReceiptData({...receiptData, method: e.target.value as PaymentMethod})}
                  >
                    {Object.values(PaymentMethod).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Parcelas</label>
                  <select 
                    className="w-full border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 font-bold"
                    value={receiptData.installments}
                    onChange={e => setReceiptData({...receiptData, installments: parseInt(e.target.value)})}
                  >
                    {[1,2,3,4,5,6,10,12].map(n => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={resetModals} className="flex-1 py-4 text-slate-400 font-bold">Cancelar</button>
              <button 
                onClick={() => {
                  if (receiptData.amount <= 0) return;
                  onReceipt(selectedCustomer.id, receiptData.amount, receiptData.method, receiptData.installments);
                  resetModals();
                }}
                className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Concluir Recebimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
