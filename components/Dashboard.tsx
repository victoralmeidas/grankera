
import React, { useState, useMemo } from 'react';
import { Sale, Receipt, User } from '../types';
import { formatCurrency, formatDate, getWeekRange, getMonthRange, getYearRange, isInRange, ensureDate } from '../utils';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

interface DashboardProps {
  sales: Sale[];
  receipts: Receipt[];
  monthlyGoal: number;
  currentUser: User;
}

type FilterType = 'week' | 'month' | 'year' | 'custom';

const Dashboard: React.FC<DashboardProps> = ({ sales, receipts, monthlyGoal, currentUser }) => {
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const activeRange = useMemo(() => {
    if (filterType === 'week') return getWeekRange();
    if (filterType === 'month') return getMonthRange();
    if (filterType === 'year') return getYearRange();
    if (filterType === 'custom' && customRange.start && customRange.end) {
      return {
        start: startOfDay(parseISO(customRange.start)),
        end: endOfDay(parseISO(customRange.end))
      };
    }
    return getMonthRange();
  }, [filterType, customRange]);

  const filteredData = useMemo(() => {
    // If manager, see all. If seller, maybe just see their own? 
    // Usually a "dashboard" shows all if the prompt says "login de gestão" for control.
    // Let's allow managers to see all and sellers to see only their contributions for personal tracking.
    const baseSales = currentUser.role === 'MANAGER' ? sales : sales.filter(s => s.sellerId === currentUser.id);
    const baseReceipts = currentUser.role === 'MANAGER' ? receipts : receipts.filter(r => r.sellerId === currentUser.id);

    const fSales = baseSales.filter(s => isInRange(ensureDate(s.date), activeRange));
    const fReceipts = baseReceipts.filter(r => isInRange(ensureDate(r.date), activeRange));
    
    const totalSales = fSales.reduce((acc, s) => acc + s.total, 0);
    const totalReceipts = fReceipts.reduce((acc, r) => acc + r.amount, 0);
    
    return {
      sales: fSales,
      receipts: fReceipts,
      totalSales,
      totalReceipts
    };
  }, [sales, receipts, activeRange, currentUser]);

  const goalPercentage = Math.min(100, (filteredData.totalSales / monthlyGoal) * 100);

  const filterButtons: { type: FilterType; label: string; icon: string }[] = [
    { type: 'week', label: 'Semana', icon: 'fa-calendar-week' },
    { type: 'month', label: 'Mês', icon: 'fa-calendar-day' },
    { type: 'year', label: 'Ano', icon: 'fa-calendar' },
    { type: 'custom', label: 'Personalizado', icon: 'fa-sliders' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 font-medium">
            {currentUser.role === 'MANAGER' ? 'Visão Geral do Negócio' : `Seu Desempenho: ${currentUser.name}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {filterButtons.map(btn => (
            <button
              key={btn.type}
              onClick={() => setFilterType(btn.type)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                filterType === btn.type 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${btn.icon}`}></i>
              {btn.label}
            </button>
          ))}
        </div>
      </header>

      {filterType === 'custom' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end animate-in slide-in-from-top-4 duration-300">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Início do Período</label>
            <input 
              type="date" 
              className="border-slate-200 rounded-xl bg-slate-50 text-sm font-bold px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={customRange.start}
              onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
            />
          </div>
          <div className="flex items-center pb-4 text-slate-300"><i className="fas fa-arrow-right"></i></div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Fim do Período</label>
            <input 
              type="date" 
              className="border-slate-200 rounded-xl bg-slate-50 text-sm font-bold px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={customRange.end}
              onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
              <i className="fas fa-chart-line text-2xl"></i>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-black uppercase tracking-widest">Receita</span>
          </div>
          <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Total em Vendas</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{formatCurrency(filteredData.totalSales)}</p>
          <div className="flex items-center gap-2 mt-4">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
             <p className="text-xs text-slate-400 font-bold">{filteredData.sales.length} operações registradas</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
              <i className="fas fa-receipt text-2xl"></i>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-black uppercase tracking-widest">Entradas</span>
          </div>
          <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Total Recebido</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{formatCurrency(filteredData.totalReceipts)}</p>
          <div className="flex items-center gap-2 mt-4">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <p className="text-xs text-slate-400 font-bold">{filteredData.receipts.length} baixas realizadas</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Meta do Período</p>
              <span className="text-blue-600 font-black text-sm">{goalPercentage.toFixed(1)}%</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{formatCurrency(monthlyGoal)}</p>
          </div>
          <div className="mt-8">
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-1 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-lg" 
                style={{ width: `${goalPercentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase text-center">Baseado na meta de vendas mensal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                <i className="fas fa-list"></i>
              </div>
              Últimas Atividades
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 uppercase font-black bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5">Data e Hora</th>
                  <th className="px-8 py-5">Colaborador</th>
                  <th className="px-8 py-5">Descrição</th>
                  <th className="px-8 py-5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 text-slate-500 font-medium">{formatDate(ensureDate(sale.date))}</td>
                    <td className="px-8 py-6">
                       <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {sale.sellerName}
                       </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-900">
                      <div className="flex flex-col">
                        <span>{sale.productName}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-black">{sale.isReturn ? 'Devolução' : 'Venda Direta'}</span>
                      </div>
                    </td>
                    <td className={`px-8 py-6 text-right font-black text-lg ${sale.isReturn ? 'text-red-500' : 'text-slate-900'}`}>
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                ))}
                {filteredData.sales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-24 text-center text-slate-300">
                      <i className="fas fa-search text-4xl mb-4 block opacity-20"></i>
                      <p className="font-bold">Nenhuma atividade encontrada</p>
                      <p className="text-xs">Tente alterar os filtros para ver mais dados.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
             {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <i className="fas fa-shield-halved text-blue-400"></i>
              Sumário Executivo
            </h3>
            
            <div className="space-y-6">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-blue-500/50 transition-colors">
                <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-1">Média por Venda</span>
                <span className="text-2xl font-black block">
                  {formatCurrency(filteredData.sales.length ? filteredData.totalSales / filteredData.sales.length : 0)}
                </span>
              </div>
              
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-emerald-500/50 transition-colors">
                <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-1">Eficiência de Caixa</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-emerald-400">
                    {filteredData.totalSales > 0 ? ((filteredData.totalReceipts / filteredData.totalSales) * 100).toFixed(0) : '0'}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold mb-1">Recebido vs Vendido</span>
                </div>
              </div>
            </div>

            <div className="mt-10 p-4 bg-blue-600/20 rounded-2xl border border-blue-500/30">
               <p className="text-xs font-bold italic leading-relaxed text-blue-100">
                 "A taxa de recebimento atual indica {filteredData.totalReceipts < filteredData.totalSales ? 'atenção aos inadimplentes' : 'ótima saúde financeira'} no período."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
