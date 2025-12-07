import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Supabase client for auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============= HELPER FUNCTIONS =============

async function verifyAuth(authHeader: string | null) {
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============= AUTH ENDPOINTS =============

// Sign up
app.post("/make-server-26b9a347/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields: email, password, name" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'client' },
      email_confirm: true // Auto-confirm since email server not configured
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'client',
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      user: data.user,
      message: "User created successfully" 
    }, 201);
  } catch (error) {
    console.log("Error in signup:", error);
    return c.json({ error: "Failed to create user", details: String(error) }, 500);
  }
});

// Get current user profile
app.get("/make-server-26b9a347/auth/profile", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ profile: profile || user });
  } catch (error) {
    console.log("Error getting profile:", error);
    return c.json({ error: "Failed to get profile", details: String(error) }, 500);
  }
});

// Health check endpoint
app.get("/make-server-26b9a347/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============= PRODUCTS ENDPOINTS =============

// Get all products (public)
app.get("/make-server-26b9a347/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    const activeOnly = c.req.query('active');
    
    let filteredProducts = products || [];
    
    if (activeOnly === 'true') {
      filteredProducts = filteredProducts.filter((p: any) => p.active !== false);
    }

    // Sort by createdAt descending
    filteredProducts.sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return c.json({ products: filteredProducts, count: filteredProducts.length });
  } catch (error) {
    console.log("Error getting products:", error);
    return c.json({ error: "Failed to get products", details: String(error) }, 500);
  }
});

// Get single product (public)
app.get("/make-server-26b9a347/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.log("Error getting product:", error);
    return c.json({ error: "Failed to get product", details: String(error) }, 500);
  }
});

// Create product (admin only)
app.post("/make-server-26b9a347/products", async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, price, category, image, stock, active } = body;

    if (!name || price === undefined || stock === undefined) {
      return c.json({ error: "Missing required fields: name, price, stock" }, 400);
    }

    const id = generateId();
    const product = {
      id,
      name,
      description: description || "",
      price: parseFloat(price),
      category: category || "General",
      image: image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      stock: parseInt(stock),
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`product:${id}`, product);
    
    console.log(`Product created: ${id} - ${name}`);
    return c.json({ product, message: "Product created successfully" }, 201);
  } catch (error) {
    console.log("Error creating product:", error);
    return c.json({ error: "Failed to create product", details: String(error) }, 500);
  }
});

// Update product (admin only)
app.put("/make-server-26b9a347/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existingProduct = await kv.get(`product:${id}`);
    if (!existingProduct) {
      return c.json({ error: "Product not found" }, 404);
    }

    const updatedProduct = {
      ...existingProduct,
      ...body,
      id, // Keep the original id
      createdAt: existingProduct.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    await kv.set(`product:${id}`, updatedProduct);
    
    console.log(`Product updated: ${id}`);
    return c.json({ product: updatedProduct, message: "Product updated successfully" });
  } catch (error) {
    console.log("Error updating product:", error);
    return c.json({ error: "Failed to update product", details: String(error) }, 500);
  }
});

// Delete product (soft delete)
app.delete("/make-server-26b9a347/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existingProduct = await kv.get(`product:${id}`);
    if (!existingProduct) {
      return c.json({ error: "Product not found" }, 404);
    }

    const updatedProduct = {
      ...existingProduct,
      active: false,
      deletedAt: new Date().toISOString()
    };

    await kv.set(`product:${id}`, updatedProduct);
    
    console.log(`Product soft deleted: ${id}`);
    return c.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Failed to delete product", details: String(error) }, 500);
  }
});

// Update product stock
app.patch("/make-server-26b9a347/products/:id/stock", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { quantity, reason } = body;

    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    const previousStock = product.stock;
    const newStock = parseInt(quantity);

    // Save stock movement history
    const movementId = generateId();
    const stockMovement = {
      id: movementId,
      productId: id,
      productName: product.name,
      type: newStock > previousStock ? 'in' : newStock < previousStock ? 'out' : 'adjustment',
      quantity: Math.abs(newStock - previousStock),
      previousStock,
      newStock,
      reason: reason || 'Manual adjustment',
      createdAt: new Date().toISOString()
    };
    await kv.set(`stock_movement:${movementId}`, stockMovement);

    const updatedProduct = {
      ...product,
      stock: newStock,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`product:${id}`, updatedProduct);
    
    console.log(`Product stock updated: ${id} - Previous: ${previousStock}, New: ${newStock}`);
    return c.json({ product: updatedProduct, message: "Stock updated successfully" });
  } catch (error) {
    console.log("Error updating stock:", error);
    return c.json({ error: "Failed to update stock", details: String(error) }, 500);
  }
});

// Increment product view count
app.patch("/make-server-26b9a347/products/:id/views", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    const updatedProduct = {
      ...product,
      viewCount: (product.viewCount || 0) + 1,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`product:${id}`, updatedProduct);
    return c.json({ product: updatedProduct });
  } catch (error) {
    console.log("Error incrementing view count:", error);
    return c.json({ error: "Failed to increment view count", details: String(error) }, 500);
  }
});

// Increment product sales count
app.patch("/make-server-26b9a347/products/:id/sales", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { quantity } = body;

    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    const updatedProduct = {
      ...product,
      salesCount: (product.salesCount || 0) + parseInt(quantity),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`product:${id}`, updatedProduct);
    return c.json({ product: updatedProduct });
  } catch (error) {
    console.log("Error incrementing sales count:", error);
    return c.json({ error: "Failed to increment sales count", details: String(error) }, 500);
  }
});

// ============= ORDERS ENDPOINTS =============

// Create order
app.post("/make-server-26b9a347/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { items, customerName, customerPhone, customerEmail, deliveryMethod, shippingAddress } = body;

    if (!items || items.length === 0 || !customerName) {
      return c.json({ error: "Missing required fields: items, customerName" }, 400);
    }

    // Validate stock availability
    for (const item of items) {
      const product = await kv.get(`product:${item.product.id}`);
      if (!product) {
        return c.json({ error: `Product not found: ${item.product.name}` }, 404);
      }
      if (product.stock < item.quantity) {
        return c.json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        }, 400);
      }
    }

    const id = generateId();
    const total = items.reduce((sum: number, item: any) => 
      sum + (item.product.price * item.quantity), 0
    );

    const order = {
      id,
      items,
      total,
      customerName,
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      deliveryMethod: deliveryMethod || "Domicilio",
      shippingAddress: shippingAddress || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`order:${id}`, order);

    // Update product stock
    for (const item of items) {
      const product = await kv.get(`product:${item.product.id}`);
      const updatedProduct = {
        ...product,
        stock: product.stock - item.quantity,
        updatedAt: new Date().toISOString()
      };
      await kv.set(`product:${item.product.id}`, updatedProduct);
    }
    
    console.log(`Order created: ${id} - Total: $${total}`);
    return c.json({ order, message: "Order created successfully" }, 201);
  } catch (error) {
    console.log("Error creating order:", error);
    return c.json({ error: "Failed to create order", details: String(error) }, 500);
  }
});

// Get all orders
app.get("/make-server-26b9a347/orders", async (c) => {
  try {
    const status = c.req.query('status');
    const orders = await kv.getByPrefix("order:");
    
    let filteredOrders = orders || [];
    
    if (status) {
      filteredOrders = filteredOrders.filter((o: any) => o.status === status);
    }

    // Sort by createdAt descending
    filteredOrders.sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return c.json({ orders: filteredOrders, count: filteredOrders.length });
  } catch (error) {
    console.log("Error getting orders:", error);
    return c.json({ error: "Failed to get orders", details: String(error) }, 500);
  }
});

// Get single order
app.get("/make-server-26b9a347/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    return c.json({ order });
  } catch (error) {
    console.log("Error getting order:", error);
    return c.json({ error: "Failed to get order", details: String(error) }, 500);
  }
});

// Update order status
app.patch("/make-server-26b9a347/orders/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status, notes } = body;

    const validStatuses = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: `Invalid status. Valid values: ${validStatuses.join(', ')}` }, 400);
    }

    const order = await kv.get(`order:${id}`);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const statusHistory = order.statusHistory || [];
    statusHistory.push({
      status,
      date: new Date().toISOString(),
      notes: notes || ''
    });

    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      statusHistory,
      [`${status}At`]: new Date().toISOString()
    };

    await kv.set(`order:${id}`, updatedOrder);
    
    console.log(`Order status updated: ${id} - ${status}`);
    return c.json({ order: updatedOrder, message: "Order status updated successfully" });
  } catch (error) {
    console.log("Error updating order status:", error);
    return c.json({ error: "Failed to update order status", details: String(error) }, 500);
  }
});

// Update order
app.put("/make-server-26b9a347/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const order = await kv.get(`order:${id}`);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updatedOrder = {
      ...order,
      ...body,
      id,
      createdAt: order.createdAt,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`order:${id}`, updatedOrder);
    
    console.log(`Order updated: ${id}`);
    return c.json({ order: updatedOrder, message: "Order updated successfully" });
  } catch (error) {
    console.log("Error updating order:", error);
    return c.json({ error: "Failed to update order", details: String(error) }, 500);
  }
});

// ============= CUSTOMERS ENDPOINTS =============

// Get all customers
app.get("/make-server-26b9a347/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    
    // Sort by lastOrderDate descending
    const sortedCustomers = (customers || []).sort((a: any, b: any) => {
      const dateA = new Date(a.lastOrderDate || 0).getTime();
      const dateB = new Date(b.lastOrderDate || 0).getTime();
      return dateB - dateA;
    });

    return c.json({ customers: sortedCustomers, count: sortedCustomers.length });
  } catch (error) {
    console.log("Error getting customers:", error);
    return c.json({ error: "Failed to get customers", details: String(error) }, 500);
  }
});

// Get single customer
app.get("/make-server-26b9a347/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);
    
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }
    
    return c.json({ customer });
  } catch (error) {
    console.log("Error getting customer:", error);
    return c.json({ error: "Failed to get customer", details: String(error) }, 500);
  }
});

// Update customer
app.put("/make-server-26b9a347/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    let customer = await kv.get(`customer:${id}`);
    
    if (!customer) {
      // Create new customer if doesn't exist
      customer = {
        id,
        name: body.name || '',
        phone: body.phone || '',
        email: body.email || '',
        address: body.address || '',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString()
      };
    }

    const updatedCustomer = {
      ...customer,
      ...body,
      id,
      createdAt: customer.createdAt
    };

    await kv.set(`customer:${id}`, updatedCustomer);
    
    console.log(`Customer updated: ${id}`);
    return c.json({ customer: updatedCustomer, message: "Customer updated successfully" });
  } catch (error) {
    console.log("Error updating customer:", error);
    return c.json({ error: "Failed to update customer", details: String(error) }, 500);
  }
});

// ============= CATEGORIES ENDPOINTS =============

// Get all categories
app.get("/make-server-26b9a347/categories", async (c) => {
  try {
    const categories = await kv.get("categories") || [
      { id: '1', name: 'Laptops', icon: '💻' },
      { id: '2', name: 'Smartphones', icon: '📱' },
      { id: '3', name: 'Audio', icon: '🎧' },
      { id: '4', name: 'Accesorios', icon: '⌨️' },
      { id: '5', name: 'Tablets', icon: '📲' },
      { id: '6', name: 'Gaming', icon: '🎮' }
    ];

    return c.json({ categories });
  } catch (error) {
    console.log("Error getting categories:", error);
    return c.json({ error: "Failed to get categories", details: String(error) }, 500);
  }
});

// Update categories
app.put("/make-server-26b9a347/categories", async (c) => {
  try {
    const body = await c.req.json();
    const { categories } = body;

    if (!Array.isArray(categories)) {
      return c.json({ error: "Categories must be an array" }, 400);
    }

    await kv.set("categories", categories);
    
    console.log("Categories updated");
    return c.json({ categories, message: "Categories updated successfully" });
  } catch (error) {
    console.log("Error updating categories:", error);
    return c.json({ error: "Failed to update categories", details: String(error) }, 500);
  }
});

// ============= SETTINGS ENDPOINTS =============

// Get settings
app.get("/make-server-26b9a347/settings", async (c) => {
  try {
    const settings = await kv.get("settings");
    return c.json({ 
      settings: settings || {
        whatsappNumber: "573001234567",
        storeName: "TechStore",
        storeEmail: "contacto@techstore.com",
        storeAddress: "Bogotá, Colombia",
        currency: "USD",
        taxRate: 0,
        shippingCost: 0
      }
    });
  } catch (error) {
    console.log("Error getting settings:", error);
    return c.json({ error: "Failed to get settings", details: String(error) }, 500);
  }
});

// Update settings
app.put("/make-server-26b9a347/settings", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings", {
      ...body,
      updatedAt: new Date().toISOString()
    });
    
    console.log("Settings updated");
    return c.json({ settings: body, message: "Settings updated successfully" });
  } catch (error) {
    console.log("Error updating settings:", error);
    return c.json({ error: "Failed to update settings", details: String(error) }, 500);
  }
});

// ============= ANALYTICS ENDPOINTS =============

// Get dashboard stats
app.get("/make-server-26b9a347/analytics/dashboard", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    const orders = await kv.getByPrefix("order:");

    const activeProducts = products.filter((p: any) => p.active !== false);
    const lowStockProducts = activeProducts.filter((p: any) => p.stock < 10);
    
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

    const stats = {
      totalProducts: activeProducts.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      lowStockProducts: lowStockProducts.length,
      productsOutOfStock: activeProducts.filter((p: any) => p.stock === 0).length,
      recentOrders: orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      topProducts: activeProducts
        .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
        .slice(0, 5)
    };

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting dashboard stats:", error);
    return c.json({ error: "Failed to get dashboard stats", details: String(error) }, 500);
  }
});

// ============= INITIALIZATION =============

// Initialize with demo data if empty
app.post("/make-server-26b9a347/init", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    
    if (!products || products.length === 0) {
      const demoProducts = [
        {
          id: '1',
          name: 'MacBook Pro M3',
          description: 'Potencia profesional para creativos y desarrolladores con chip M3',
          price: 2499,
          category: 'Laptops',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
          stock: 15,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'iPhone 15 Pro',
          description: 'Innovación en cada detalle con titanio premium y chip A17 Pro',
          price: 1199,
          category: 'Smartphones',
          image: 'https://images.unsplash.com/photo-1678652197950-91e8739d59d8?w=500',
          stock: 25,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'AirPods Max',
          description: 'Audio de alta fidelidad con cancelación de ruido activa',
          price: 549,
          category: 'Audio',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          stock: 8,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Magic Keyboard',
          description: 'Teclado inalámbrico con diseño elegante y teclas precisas',
          price: 99,
          category: 'Accesorios',
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
          stock: 30,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          name: 'iPad Pro 12.9"',
          description: 'Rendimiento extremo con chip M2 y pantalla Liquid Retina XDR',
          price: 1099,
          category: 'Tablets',
          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
          stock: 12,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          name: 'PlayStation 5',
          description: 'Consola de nueva generación con gráficos 4K y SSD ultra rápido',
          price: 499,
          category: 'Gaming',
          image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
          stock: 5,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '7',
          name: 'Samsung Galaxy S24 Ultra',
          description: 'Smartphone Android premium con S Pen y cámara de 200MP',
          price: 1299,
          category: 'Smartphones',
          image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
          stock: 18,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '8',
          name: 'Sony WH-1000XM5',
          description: 'Audífonos premium con la mejor cancelación de ruido del mercado',
          price: 399,
          category: 'Audio',
          image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=500',
          stock: 22,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const product of demoProducts) {
        await kv.set(`product:${product.id}`, product);
      }

      console.log(`Demo data initialized: ${demoProducts.length} products`);
      return c.json({ 
        message: "Demo data initialized successfully", 
        count: demoProducts.length 
      });
    }

    return c.json({ message: "Data already exists", count: products.length });
  } catch (error) {
    console.log("Error initializing data:", error);
    return c.json({ error: "Failed to initialize data", details: String(error) }, 500);
  }
});

// Reset all data (use with caution)
app.post("/make-server-26b9a347/reset", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    const orders = await kv.getByPrefix("order:");

    // Delete all products
    for (const product of products) {
      await kv.del(`product:${product.id}`);
    }

    // Delete all orders
    for (const order of orders) {
      await kv.del(`order:${order.id}`);
    }

    console.log("Database reset completed");
    return c.json({ message: "Database reset successfully" });
  } catch (error) {
    console.log("Error resetting database:", error);
    return c.json({ error: "Failed to reset database", details: String(error) }, 500);
  }
});

console.log("🚀 TechStore Server started successfully");
console.log("📊 Endpoints available:");
console.log("  - GET  /make-server-26b9a347/health");
console.log("  - GET  /make-server-26b9a347/products");
console.log("  - POST /make-server-26b9a347/products");
console.log("  - GET  /make-server-26b9a347/orders");
console.log("  - POST /make-server-26b9a347/orders");
console.log("  - GET  /make-server-26b9a347/analytics/dashboard");

Deno.serve(app.fetch);