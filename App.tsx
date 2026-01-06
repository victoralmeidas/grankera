
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Customer, Sale, Receipt, PaymentMethod, User } from './types';
import { getWeekRange, getMonthRange, isInRange, ensureDate } from './utils';
import Dashboard from './components/Dashboard';
import InventoryManager from './components/InventoryManager';
import CustomerList from './components/CustomerList';
import Navigation from './components/Navigation';
import Login from './components/Login';

const STORAGE_KEY = 'gestor_pro_data_v2';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'customers'>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State initialization
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyGoal] = useState(15000);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedUser = localStorage.getItem('gestor_pro_user');
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProducts(data.products || []);
        setCustomers(data.customers || []);
        setSales((data.sales || []).map((s: any) => ({ ...s, date: ensureDate(s.date) })));
        setReceipts((data.receipts || []).map((r: any) => ({ ...r, date: ensureDate(r.date) })));
      } catch (e) {
        console.error("Erro ao carregar dados salvos", e);
      }
    } else {
      setProducts([
        { id: '1', sku: 'P001', name: 'Camisa Polo Azul', price: 89.90, stock: 15, category: 'Vestuário' },
        { id: '2', sku: 'P002', name: 'Calça Jeans Slim', price: 149.90, stock: 8, category: 'Vestuário' },
      ]);
    }

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      const data = { products, customers, sales, receipts };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (currentUser) {
        localStorage.setItem('gestor_pro_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('gestor_pro_user');
      }
    }
  }, [products, customers, sales, receipts, currentUser, isLoading]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSale = (customerId: string, productId: string, quantity: number, isReturn: boolean = false) => {
    if (!currentUser) return;
    const product = products.find(p => p.id === productId);
    const customer = customers.find(c => c.id === customerId);

    if (!product || !customer) return;

    if (!isReturn && product.stock < quantity) {
      alert("Estoque insuficiente!");
      return;
    }

    const total = product.price * quantity;
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      customerId,
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      total: isReturn ? -total : total,
      date: new Date(),
      isReturn,
      sellerId: currentUser.id,
      sellerName: currentUser.name
    };

    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, stock: isReturn ? p.stock + quantity : p.stock - quantity } 
        : p
    ));

    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, pendingBalance: c.pendingBalance + (isReturn ? -total : total) } 
        : c
    ));

    setSales(prev => [newSale, ...prev]);
  };

  const handleReceipt = (customerId: string, amount: number, method: PaymentMethod, installments: number) => {
    if (!currentUser) return;
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newReceipt: Receipt = {
      id: Math.random().toString(36).substr(2, 9),
      customerId,
      amount,
      method,
      installments,
      date: new Date(),
      sellerId: currentUser.id,
      sellerName: currentUser.name
    };

    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, pendingBalance: Math.max(0, c.pendingBalance - amount) } 
        : c
    ));

    setReceipts(prev => [newReceipt, ...prev]);
  };

  const handleAddCustomer = (c: Omit<Customer, 'id' | 'pendingBalance'>) => {
    setCustomers([...customers, { ...c, id: Date.now().toString(), pendingBalance: 0 }]);
  };

  const handleEditCustomer = (id: string, updatedData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const handleDeleteCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (customer && customer.pendingBalance > 0) {
      if (!confirm("Este cliente possui saldo pendente. Tem certeza que deseja excluí-lo?")) {
        return;
      }
    } else {
      if (!confirm("Tem certeza que deseja excluir este cliente permanentemente?")) {
        return;
      }
    }
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">Carregando Gestor Pro...</div>;

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              sales={sales} 
              receipts={receipts} 
              monthlyGoal={monthlyGoal} 
              currentUser={currentUser}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager 
              products={products} 
              setProducts={setProducts} 
              currentUser={currentUser}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerList 
              customers={customers} 
              products={products}
              sales={sales}
              receipts={receipts}
              onSale={handleSale}
              onReceipt={handleReceipt}
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
