
import React, { useState } from 'react';
import { Product, User } from '../types';
import { formatCurrency } from '../utils';

// Added User to the imported types and currentUser to the props interface to fix the type mismatch error in App.tsx
interface InventoryManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentUser: User;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ products, setProducts, currentUser }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdate = (id: string, field: keyof Product, value: any) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const addRow = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      sku: `SKU-${Math.floor(Math.random() * 1000)}`,
      name: 'Novo Produto',
      price: 0,
      stock: 0,
      category: 'Geral'
    };
    setProducts([newProduct, ...products]);
    setIsEditing(newProduct.id);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Controle de Estoque</h2>
          <p className="text-gray-500">Gerencie seus produtos e níveis de estoque</p>
        </div>
        <button 
          onClick={addRow}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <i className="fas fa-plus"></i>
          Novo Produto
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-2">
          <i className="fas fa-search text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..." 
            className="flex-1 border-none focus:ring-0 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Nome do Produto</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold">Preço</th>
                <th className="px-6 py-4 font-semibold">Estoque</th>
                <th className="px-6 py-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing === product.id ? (
                      <input 
                        className="w-full text-sm border-gray-200 rounded p-1"
                        value={product.sku}
                        onChange={(e) => handleUpdate(product.id, 'sku', e.target.value)}
                      />
                    ) : (
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {product.sku}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === product.id ? (
                      <input 
                        className="w-full text-sm border-gray-200 rounded p-1"
                        value={product.name}
                        onChange={(e) => handleUpdate(product.id, 'name', e.target.value)}
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{product.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === product.id ? (
                      <input 
                        className="w-full text-sm border-gray-200 rounded p-1"
                        value={product.category}
                        onChange={(e) => handleUpdate(product.id, 'category', e.target.value)}
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">{product.category}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {isEditing === product.id ? (
                      <input 
                        type="number"
                        className="w-full text-sm border-gray-200 rounded p-1"
                        value={product.price}
                        onChange={(e) => handleUpdate(product.id, 'price', parseFloat(e.target.value))}
                      />
                    ) : (
                      formatCurrency(product.price)
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === product.id ? (
                      <input 
                        type="number"
                        className="w-full text-sm border-gray-200 rounded p-1"
                        value={product.stock}
                        onChange={(e) => handleUpdate(product.id, 'stock', parseInt(e.target.value))}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                          {product.stock}
                        </span>
                        {product.stock <= 5 && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded uppercase font-bold">Crítico</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setIsEditing(isEditing === product.id ? null : product.id)}
                      className={`text-sm font-semibold transition-colors ${
                        isEditing === product.id ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {isEditing === product.id ? <i className="fas fa-check"></i> : <i className="fas fa-edit"></i>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
        <i className="fas fa-info-circle text-blue-500 mt-1"></i>
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Dica:</strong> Para atualizar em lote, você pode editar diretamente as células na tabela. 
          As alterações de estoque são refletidas automaticamente quando uma venda é lançada para um cliente.
        </p>
      </div>
    </div>
  );
};

export default InventoryManager;
