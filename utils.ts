
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: Date) => {
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
};

export const getWeekRange = () => {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 0 }),
    end: endOfWeek(now, { weekStartsOn: 0 }),
  };
};

export const getMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
};

export const getYearRange = () => {
  const now = new Date();
  return {
    start: startOfYear(now),
    end: endOfYear(now),
  };
};

export const isInRange = (date: Date, range: { start: Date; end: Date }) => {
  return isWithinInterval(date, range);
};

export const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date;
  if (typeof date === 'string') return parseISO(date);
  return new Date(date);
};
