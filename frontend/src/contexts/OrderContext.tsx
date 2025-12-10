import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order, OrderStatus, Customer } from '../types';
import { ordersApi } from '../utils/supabase/client';
import { toast } from 'sonner';

interface OrderContextType {
  orders: Order[];
  customers: Customer[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByCustomer: (customerId: string) => Order[];
  getOrdersByStatus: (status: OrderStatus) => Order[];
  searchOrders: (query: string) => Order[];
  filterOrders: (filters: OrderFilters) => Order[];
  getCustomerById: (id: string) => Customer | undefined;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => Promise<void>;
  loading: boolean;
}

interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await ordersApi.getCustomers();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      const data = await ordersApi.create(orderData);
      setOrders(prev => [data.order, ...prev]);
      
      // Update customer data
      if (orderData.customerId) {
        await updateCustomerStats(orderData.customerId);
      }
      
      toast.success('Pedido creado correctamente');
      return data.order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear pedido');
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      const data = await ordersApi.updateStatus(orderId, status, notes);
      setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      toast.success(`Pedido ${status === 'delivered' ? 'entregado' : 'actualizado'}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar estado del pedido');
      throw error;
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const data = await ordersApi.update(orderId, updates);
      setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      toast.success('Pedido actualizado');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar pedido');
      throw error;
    }
  };

  const updateCustomerStats = async (customerId: string) => {
    try {
      const customerOrders = orders.filter(o => o.customerId === customerId);
      const totalOrders = customerOrders.length;
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
      const lastOrderDate = customerOrders[0]?.createdAt;

      await updateCustomer(customerId, {
        totalOrders,
        totalSpent,
        lastOrderDate
      });
    } catch (error) {
      console.error('Error updating customer stats:', error);
    }
  };

  const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    try {
      const data = await ordersApi.updateCustomer(customerId, updates);
      setCustomers(prev => prev.map(c => c.id === customerId ? data.customer : c));
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id);
  };

  const getOrdersByCustomer = (customerId: string) => {
    return orders.filter(o => o.customerId === customerId);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(o => o.status === status);
  };

  const searchOrders = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return orders.filter(o =>
      o.orderNumber.toLowerCase().includes(lowerQuery) ||
      o.customerName.toLowerCase().includes(lowerQuery) ||
      o.customerPhone.includes(query)
    );
  };

  const filterOrders = (filters: OrderFilters) => {
    return orders.filter(o =>
      (!filters.status || o.status === filters.status) &&
      (!filters.customerId || o.customerId === filters.customerId) &&
      (!filters.startDate || new Date(o.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(o.createdAt) <= new Date(filters.endDate)) &&
      (!filters.minTotal || o.total >= filters.minTotal) &&
      (!filters.maxTotal || o.total <= filters.maxTotal)
    );
  };

  const getCustomerById = (id: string) => {
    return customers.find(c => c.id === id);
  };

  return (
    <OrderContext.Provider value={{
      orders,
      customers,
      createOrder,
      updateOrderStatus,
      updateOrder,
      getOrderById,
      getOrdersByCustomer,
      getOrdersByStatus,
      searchOrders,
      filterOrders,
      getCustomerById,
      updateCustomer,
      loading
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
