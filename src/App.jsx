import React, { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, Calendar, Users, ShoppingBag, CreditCard, BarChart3, Settings, ChevronRight, Plus, Minus, X, Check, RefreshCw, Clock, MapPin, Truck, AlertCircle, Search, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Mock Square API integration helper
const SquareAPI = {
  async processPayment(amount, nonce) {
    // Simulated Square payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          timestamp: new Date().toISOString()
        });
      }, 800);
    });
  },
  async refundPayment(transactionId, amount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, refundId: `rf_${Date.now()}` });
      }, 600);
    });
  }
};

// Main App Component
export default function MerchFlow() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data
  const [events] = useState([
    { id: 1, artist: 'The Midnight', venue: 'The Fillmore', city: 'San Francisco, CA', date: '2026-01-25', status: 'upcoming', capacity: 1150 },
    { id: 2, artist: 'The Midnight', venue: 'The Wiltern', city: 'Los Angeles, CA', date: '2026-01-27', status: 'upcoming', capacity: 1850 },
    { id: 3, artist: 'The Midnight', venue: 'Brooklyn Steel', city: 'Brooklyn, NY', date: '2026-02-01', status: 'upcoming', capacity: 1800 },
    { id: 4, artist: 'The Midnight', venue: 'House of Blues', city: 'Chicago, IL', date: '2026-01-20', status: 'completed', capacity: 1500, sales: 12450 },
  ]);

  const [inventory, setInventory] = useState([
    { id: 1, name: 'Tour T-Shirt', sku: 'TS-2026', variants: ['S', 'M', 'L', 'XL', '2XL'], price: 35, cost: 12, stock: { S: 50, M: 100, L: 100, XL: 75, '2XL': 40 }, category: 'apparel', image: '👕' },
    { id: 2, name: 'Hoodie', sku: 'HD-2026', variants: ['S', 'M', 'L', 'XL'], price: 65, cost: 25, stock: { S: 30, M: 60, L: 60, XL: 40 }, category: 'apparel', image: '🧥' },
    { id: 3, name: 'Vinyl LP', sku: 'VN-001', variants: ['Standard', 'Limited Edition'], price: 30, cost: 15, stock: { Standard: 200, 'Limited Edition': 50 }, category: 'music', image: '💿' },
    { id: 4, name: 'Poster', sku: 'PS-2026', variants: ['18x24'], price: 20, cost: 5, stock: { '18x24': 300 }, category: 'accessories', image: '🖼️' },
    { id: 5, name: 'Enamel Pin Set', sku: 'PN-001', variants: ['Standard'], price: 15, cost: 4, stock: { Standard: 500 }, category: 'accessories', image: '📍' },
    { id: 6, name: 'Beanie', sku: 'BN-2026', variants: ['One Size'], price: 28, cost: 10, stock: { 'One Size': 150 }, category: 'apparel', image: '🧢' },
  ]);

  const addToCart = (item, variant) => {
    const existingItem = cart.find(c => c.id === item.id && c.variant === variant);
    if (existingItem) {
      setCart(cart.map(c => 
        c.id === item.id && c.variant === variant 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { ...item, variant, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId, variant) => {
    setCart(cart.filter(c => !(c.id === itemId && c.variant === variant)));
  };

  const updateQuantity = (itemId, variant, delta) => {
    setCart(cart.map(c => {
      if (c.id === itemId && c.variant === variant) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const processTransaction = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    try {
      const result = await SquareAPI.processPayment(cartTotal, 'mock_nonce');
      if (result.success) {
        const newTransaction = {
          id: result.transactionId,
          items: [...cart],
          total: cartTotal,
          timestamp: result.timestamp,
          event: selectedEvent,
          paymentMethod: 'card'
        };
        setTransactions([newTransaction, ...transactions]);
        
        // Update inventory
        setInventory(inventory.map(item => {
          const cartItem = cart.find(c => c.id === item.id);
          if (cartItem) {
            return {
              ...item,
              stock: {
                ...item.stock,
                [cartItem.variant]: item.stock[cartItem.variant] - cartItem.quantity
              }
            };
          }
          return item;
        }));
        
        setCart([]);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
    
    setIsProcessing(false);
  };

  const todaysSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalItems = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);

  const Navigation = () => (
    <nav className="nav">
      <div className="nav-brand">
        <div className="brand-icon">
          <ShoppingBag size={24} />
        </div>
        <span className="brand-text">MerchFlow</span>
        <span className="brand-tag">+ Square</span>
      </div>
      
      <div className="nav-links">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
          { id: 'pos', icon: CreditCard, label: 'Point of Sale' },
          { id: 'inventory', icon: Package, label: 'Inventory' },
          { id: 'events', icon: Calendar, label: 'Events' },
          { id: 'settlements', icon: DollarSign, label: 'Settlements' },
        ].map(item => (
          <button
            key={item.id}
            className={`nav-link ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="nav-footer">
        <div className="square-badge">
          <div className="square-icon">□</div>
          <span>Powered by Square</span>
        </div>
      </div>
    </nav>
  );

  const Dashboard = () => (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">The Midnight • Winter Tour 2026</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today's Sales</span>
            <span className="stat-value">${todaysSales.toLocaleString()}</span>
            <span className="stat-change positive">
              <ArrowUpRight size={14} /> +23% vs yesterday
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon blue">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Items Sold</span>
            <span className="stat-value">{totalItems}</span>
            <span className="stat-change positive">
              <ArrowUpRight size={14} /> +15% vs yesterday
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon purple">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Avg Transaction</span>
            <span className="stat-value">${transactions.length ? (todaysSales / transactions.length).toFixed(2) : '0.00'}</span>
            <span className="stat-change negative">
              <ArrowDownRight size={14} /> -5% vs yesterday
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orange">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{transactions.length}</span>
            <span className="stat-change positive">
              <ArrowUpRight size={14} /> +18% vs yesterday
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Events</h3>
            <button className="btn-text" onClick={() => setActiveView('events')}>View All</button>
          </div>
          <div className="event-list">
            {events.filter(e => e.status === 'upcoming').slice(0, 3).map(event => (
              <div key={event.id} className="event-item">
                <div className="event-date">
                  <span className="month">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="day">{new Date(event.date).getDate()}</span>
                </div>
                <div className="event-details">
                  <span className="venue">{event.venue}</span>
                  <span className="location"><MapPin size={12} /> {event.city}</span>
                </div>
                <ChevronRight size={18} className="chevron" />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Top Sellers Today</h3>
            <span className="badge">Live</span>
          </div>
          <div className="top-sellers">
            {inventory.slice(0, 4).map((item, idx) => (
              <div key={item.id} className="seller-item">
                <span className="rank">#{idx + 1}</span>
                <span className="item-emoji">{item.image}</span>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">${item.price}</span>
                </div>
                <span className="sold-count">{Math.floor(Math.random() * 50) + 10} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card full-width">
          <div className="card-header">
            <h3>Recent Transactions</h3>
            <button className="btn-text">View All</button>
          </div>
          <div className="transactions-table">
            {transactions.length === 0 ? (
              <div className="empty-state">
                <Clock size={32} />
                <p>No transactions yet today</p>
                <button className="btn-primary" onClick={() => setActiveView('pos')}>
                  Open POS
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map(t => (
                    <tr key={t.id}>
                      <td className="mono">{t.id.slice(0, 16)}...</td>
                      <td>{t.items.length} items</td>
                      <td className="amount">${t.total.toFixed(2)}</td>
                      <td>{new Date(t.timestamp).toLocaleTimeString()}</td>
                      <td><span className="status-badge success">Completed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const PointOfSale = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const categories = ['all', 'apparel', 'music', 'accessories'];
    
    const filteredInventory = selectedCategory === 'all' 
      ? inventory 
      : inventory.filter(i => i.category === selectedCategory);

    return (
      <div className="pos-container">
        <div className="pos-products">
          <header className="pos-header">
            <h2>Point of Sale</h2>
            <div className="event-selector">
              <MapPin size={16} />
              <select 
                value={selectedEvent?.id || ''} 
                onChange={(e) => setSelectedEvent(events.find(ev => ev.id === parseInt(e.target.value)))}
              >
                <option value="">Select Event</option>
                {events.filter(e => e.status === 'upcoming').map(event => (
                  <option key={event.id} value={event.id}>
                    {event.venue} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <div className="category-tabs">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredInventory.map(item => (
              <div key={item.id} className="product-card">
                <div className="product-image">{item.image}</div>
                <div className="product-info">
                  <h4>{item.name}</h4>
                  <span className="product-price">${item.price}</span>
                </div>
                <div className="variant-buttons">
                  {item.variants.map(variant => (
                    <button
                      key={variant}
                      className="variant-btn"
                      onClick={() => addToCart(item, variant)}
                      disabled={item.stock[variant] <= 0}
                    >
                      {variant}
                      <span className="stock-count">{item.stock[variant]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-cart">
          <div className="cart-header">
            <h3>Current Sale</h3>
            {cart.length > 0 && (
              <button className="btn-text danger" onClick={() => setCart([])}>
                Clear All
              </button>
            )}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBag size={48} />
                <p>Cart is empty</p>
                <span>Select items to begin</span>
              </div>
            ) : (
              cart.map(item => (
                <div key={`${item.id}-${item.variant}`} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-emoji">{item.image}</span>
                    <div>
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-variant">{item.variant}</span>
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, item.variant, -1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.variant, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id, item.variant)}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8.5%)</span>
              <span>${(cartTotal * 0.085).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${(cartTotal * 1.085).toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-actions">
            <button 
              className="btn-payment card"
              onClick={processTransaction}
              disabled={cart.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={20} className="spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Pay with Card
                </>
              )}
            </button>
            <button 
              className="btn-payment cash"
              onClick={processTransaction}
              disabled={cart.length === 0 || isProcessing}
            >
              <DollarSign size={20} />
              Cash
            </button>
          </div>

          <div className="square-footer">
            <div className="square-logo">□</div>
            <span>Secure payments by Square</span>
          </div>
        </div>
      </div>
    );
  };

  const Inventory = () => (
    <div className="inventory-page">
      <header className="page-header">
        <div>
          <h1>Inventory</h1>
          <p className="subtitle">{inventory.length} products • {inventory.reduce((sum, i) => sum + Object.values(i.stock).reduce((s, v) => s + v, 0), 0)} total units</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary">
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </header>

      <div className="inventory-grid">
        {inventory.filter(i => 
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(item => (
          <div key={item.id} className="inventory-card">
            <div className="inventory-card-header">
              <span className="inventory-emoji">{item.image}</span>
              <span className={`category-badge ${item.category}`}>{item.category}</span>
            </div>
            <div className="inventory-card-body">
              <h4>{item.name}</h4>
              <span className="sku">SKU: {item.sku}</span>
              <div className="price-cost">
                <span className="price">${item.price}</span>
                <span className="cost">Cost: ${item.cost}</span>
                <span className="margin">{Math.round((1 - item.cost / item.price) * 100)}% margin</span>
              </div>
            </div>
            <div className="inventory-card-footer">
              <span className="stock-label">Stock by variant:</span>
              <div className="stock-grid">
                {Object.entries(item.stock).map(([variant, qty]) => (
                  <div key={variant} className={`stock-item ${qty < 20 ? 'low' : ''}`}>
                    <span className="variant-name">{variant}</span>
                    <span className="variant-qty">{qty}</span>
                    {qty < 20 && <AlertCircle size={12} className="low-stock-icon" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Events = () => (
    <div className="events-page">
      <header className="page-header">
        <div>
          <h1>Tour Events</h1>
          <p className="subtitle">The Midnight • Winter Tour 2026</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </header>

      <div className="events-timeline">
        {events.map(event => (
          <div key={event.id} className={`event-card ${event.status}`}>
            <div className="event-card-date">
              <span className="month">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
              <span className="day">{new Date(event.date).getDate()}</span>
              <span className="year">{new Date(event.date).getFullYear()}</span>
            </div>
            <div className="event-card-content">
              <div className="event-card-header">
                <h3>{event.venue}</h3>
                <span className={`status-badge ${event.status}`}>
                  {event.status === 'completed' ? <Check size={12} /> : <Clock size={12} />}
                  {event.status}
                </span>
              </div>
              <div className="event-card-details">
                <span><MapPin size={14} /> {event.city}</span>
                <span><Users size={14} /> {event.capacity.toLocaleString()} capacity</span>
              </div>
              {event.status === 'completed' && (
                <div className="event-card-stats">
                  <div className="stat">
                    <span className="label">Total Sales</span>
                    <span className="value">${event.sales?.toLocaleString()}</span>
                  </div>
                  <button className="btn-secondary" onClick={() => setShowSettlement(true)}>
                    View Settlement
                  </button>
                </div>
              )}
              {event.status === 'upcoming' && (
                <div className="event-card-actions">
                  <button className="btn-secondary">
                    <Truck size={14} />
                    Manage Inventory
                  </button>
                  <button className="btn-primary" onClick={() => {
                    setSelectedEvent(event);
                    setActiveView('pos');
                  }}>
                    Open POS
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Settlements = () => (
    <div className="settlements-page">
      <header className="page-header">
        <div>
          <h1>Settlements</h1>
          <p className="subtitle">Revenue splits and payouts</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Filter size={16} />
            Filter
          </button>
          <button className="btn-primary">
            <Download size={16} />
            Export All
          </button>
        </div>
      </header>

      <div className="settlement-summary">
        <div className="summary-card">
          <h4>Total Gross Sales</h4>
          <span className="amount">$58,750.00</span>
        </div>
        <div className="summary-card">
          <h4>Artist Share (70%)</h4>
          <span className="amount">$41,125.00</span>
        </div>
        <div className="summary-card">
          <h4>Venue Share (30%)</h4>
          <span className="amount">$17,625.00</span>
        </div>
        <div className="summary-card">
          <h4>Pending Payout</h4>
          <span className="amount highlight">$12,450.00</span>
        </div>
      </div>

      <div className="settlements-list">
        <div className="card">
          <div className="card-header">
            <h3>Settlement History</h3>
          </div>
          <table className="settlements-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Gross Sales</th>
                <th>Artist Share</th>
                <th>Venue Share</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="event-cell">
                    <span className="venue">House of Blues</span>
                    <span className="city">Chicago, IL</span>
                  </div>
                </td>
                <td>Jan 20, 2026</td>
                <td>$12,450.00</td>
                <td>$8,715.00</td>
                <td>$3,735.00</td>
                <td><span className="status-badge pending">Pending</span></td>
                <td>
                  <button className="btn-text">View Details</button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="event-cell">
                    <span className="venue">9:30 Club</span>
                    <span className="city">Washington, DC</span>
                  </div>
                </td>
                <td>Jan 18, 2026</td>
                <td>$15,890.00</td>
                <td>$11,123.00</td>
                <td>$4,767.00</td>
                <td><span className="status-badge success">Paid</span></td>
                <td>
                  <button className="btn-text">View Details</button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="event-cell">
                    <span className="venue">Terminal 5</span>
                    <span className="city">New York, NY</span>
                  </div>
                </td>
                <td>Jan 15, 2026</td>
                <td>$30,410.00</td>
                <td>$21,287.00</td>
                <td>$9,123.00</td>
                <td><span className="status-badge success">Paid</span></td>
                <td>
                  <button className="btn-text">View Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="square-integration-note">
        <div className="note-icon">□</div>
        <div className="note-content">
          <h4>Square Payouts</h4>
          <p>Settlements are automatically processed through Square. Artist payouts are deposited within 1-2 business days.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          display: flex;
          min-height: 100vh;
          background: #0a0a0b;
          color: #e8e8e8;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Navigation */
        .nav {
          width: 240px;
          background: linear-gradient(180deg, #111113 0%, #0d0d0e 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          position: fixed;
          height: 100vh;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px;
          margin-bottom: 32px;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-text {
          font-weight: 600;
          font-size: 18px;
          color: #fff;
        }

        .brand-tag {
          font-size: 11px;
          color: #00d26a;
          background: rgba(0,210,106,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: #888;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: rgba(255,255,255,0.04);
          color: #ccc;
        }

        .nav-link.active {
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
        }

        .nav-footer {
          margin-top: auto;
        }

        .square-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(0,210,106,0.08);
          border: 1px solid rgba(0,210,106,0.2);
          border-radius: 8px;
          font-size: 12px;
          color: #00d26a;
        }

        .square-icon {
          font-size: 18px;
          font-weight: 700;
        }

        /* Main Content */
        main {
          flex: 1;
          margin-left: 240px;
          padding: 32px 40px;
          max-width: calc(100% - 240px);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 28px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .subtitle {
          color: #666;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        /* Buttons */
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #ccc;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
        }

        .btn-text {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          padding: 4px 8px;
        }

        .btn-text:hover {
          color: #818cf8;
        }

        .btn-text.danger {
          color: #f87171;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(145deg, #141416 0%, #111113 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          gap: 16px;
        }

        .stat-card.highlight {
          background: linear-gradient(145deg, rgba(0,210,106,0.1) 0%, rgba(0,210,106,0.02) 100%);
          border-color: rgba(0,210,106,0.2);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.green {
          background: rgba(0,210,106,0.15);
          color: #00d26a;
        }

        .stat-icon.blue {
          background: rgba(59,130,246,0.15);
          color: #3b82f6;
        }

        .stat-icon.purple {
          background: rgba(139,92,246,0.15);
          color: #8b5cf6;
        }

        .stat-icon.orange {
          background: rgba(249,115,22,0.15);
          color: #f97316;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #fff;
        }

        .stat-change {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .stat-change.positive {
          color: #00d26a;
        }

        .stat-change.negative {
          color: #f87171;
        }

        /* Cards */
        .card {
          background: linear-gradient(145deg, #141416 0%, #111113 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .badge {
          font-size: 11px;
          padding: 4px 8px;
          background: rgba(0,210,106,0.15);
          color: #00d26a;
          border-radius: 4px;
          font-weight: 500;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .dashboard-grid .full-width {
          grid-column: 1 / -1;
        }

        /* Event List */
        .event-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .event-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .event-item:hover {
          background: rgba(255,255,255,0.05);
        }

        .event-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(99,102,241,0.15);
          padding: 8px 12px;
          border-radius: 8px;
          min-width: 56px;
        }

        .event-date .month {
          font-size: 11px;
          text-transform: uppercase;
          color: #a5b4fc;
          font-weight: 600;
        }

        .event-date .day {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
        }

        .event-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .event-details .venue {
          font-weight: 500;
          color: #fff;
        }

        .event-details .location {
          font-size: 13px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .chevron {
          color: #444;
        }

        /* Top Sellers */
        .top-sellers {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .seller-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .rank {
          font-size: 12px;
          color: #666;
          width: 28px;
          font-weight: 600;
        }

        .item-emoji {
          font-size: 24px;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-weight: 500;
          color: #fff;
          font-size: 14px;
        }

        .item-price {
          font-size: 13px;
          color: #666;
        }

        .sold-count {
          font-size: 12px;
          color: #00d26a;
          background: rgba(0,210,106,0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }

        /* Transactions Table */
        .transactions-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .transactions-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .transactions-table td {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 14px;
          color: #ccc;
        }

        .transactions-table .mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        .transactions-table .amount {
          font-weight: 600;
          color: #fff;
        }

        .status-badge {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge.success {
          background: rgba(0,210,106,0.15);
          color: #00d26a;
        }

        .status-badge.pending {
          background: rgba(249,115,22,0.15);
          color: #f97316;
        }

        .status-badge.upcoming {
          background: rgba(59,130,246,0.15);
          color: #3b82f6;
        }

        .status-badge.completed {
          background: rgba(0,210,106,0.15);
          color: #00d26a;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          color: #666;
        }

        .empty-state p {
          margin: 16px 0 24px;
          font-size: 15px;
        }

        /* POS Container */
        .pos-container {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          height: calc(100vh - 64px);
        }

        .pos-products {
          display: flex;
          flex-direction: column;
        }

        .pos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .pos-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #fff;
        }

        .event-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          padding: 8px 16px;
          border-radius: 8px;
          color: #888;
        }

        .event-selector select {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          outline: none;
        }

        .event-selector option {
          background: #1a1a1c;
        }

        .category-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .category-tab {
          padding: 10px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: #888;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-tab:hover {
          background: rgba(255,255,255,0.08);
        }

        .category-tab.active {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          overflow-y: auto;
          flex: 1;
        }

        .product-card {
          background: linear-gradient(145deg, #18181b 0%, #141416 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .product-image {
          font-size: 48px;
          text-align: center;
          margin-bottom: 12px;
          padding: 16px 0;
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
        }

        .product-info {
          margin-bottom: 12px;
        }

        .product-info h4 {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .product-price {
          font-size: 18px;
          font-weight: 700;
          color: #00d26a;
        }

        .variant-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .variant-btn {
          padding: 8px 12px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 6px;
          color: #a5b4fc;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .variant-btn:hover:not(:disabled) {
          background: rgba(99,102,241,0.2);
        }

        .variant-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .stock-count {
          font-size: 10px;
          color: #666;
        }

        /* Cart */
        .pos-cart {
          background: linear-gradient(145deg, #141416 0%, #111113 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          height: fit-content;
          position: sticky;
          top: 32px;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .cart-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 20px;
          min-height: 200px;
          max-height: 320px;
        }

        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #444;
        }

        .cart-empty p {
          margin-top: 16px;
          font-size: 15px;
          color: #666;
        }

        .cart-empty span {
          font-size: 13px;
          color: #444;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .cart-item-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cart-item-emoji {
          font-size: 24px;
        }

        .cart-item-name {
          font-weight: 500;
          color: #fff;
          font-size: 14px;
          display: block;
        }

        .cart-item-variant {
          font-size: 12px;
          color: #666;
        }

        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 6px;
          padding: 4px;
        }

        .quantity-control button {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #888;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .quantity-control button:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .quantity-control span {
          min-width: 24px;
          text-align: center;
          font-weight: 600;
          color: #fff;
        }

        .cart-item-total {
          font-weight: 600;
          color: #fff;
          min-width: 60px;
          text-align: right;
        }

        .remove-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(248,113,113,0.1);
          color: #f87171;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .remove-btn:hover {
          background: rgba(248,113,113,0.2);
        }

        .cart-summary {
          padding: 16px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #888;
        }

        .summary-row.total {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          padding-top: 12px;
        }

        .payment-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .btn-payment {
          padding: 16px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-payment.card {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          grid-column: 1 / -1;
        }

        .btn-payment.card:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99,102,241,0.4);
        }

        .btn-payment.cash {
          background: rgba(0,210,106,0.15);
          color: #00d26a;
          border: 1px solid rgba(0,210,106,0.3);
        }

        .btn-payment:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .square-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          font-size: 12px;
          color: #666;
        }

        .square-logo {
          font-size: 16px;
          font-weight: 700;
        }

        /* Inventory Page */
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .search-box input {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          width: 200px;
        }

        .search-box input::placeholder {
          color: #666;
        }

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .inventory-card {
          background: linear-gradient(145deg, #141416 0%, #111113 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }

        .inventory-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          background: rgba(255,255,255,0.02);
        }

        .inventory-emoji {
          font-size: 48px;
        }

        .category-badge {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .category-badge.apparel {
          background: rgba(139,92,246,0.15);
          color: #a78bfa;
        }

        .category-badge.music {
          background: rgba(59,130,246,0.15);
          color: #60a5fa;
        }

        .category-badge.accessories {
          background: rgba(249,115,22,0.15);
          color: #fb923c;
        }

        .inventory-card-body {
          padding: 20px;
        }

        .inventory-card-body h4 {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .sku {
          font-size: 12px;
          color: #666;
          font-family: 'JetBrains Mono', monospace;
        }

        .price-cost {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-top: 12px;
        }

        .price {
          font-size: 20px;
          font-weight: 700;
          color: #00d26a;
        }

        .cost {
          font-size: 13px;
          color: #666;
        }

        .margin {
          font-size: 12px;
          color: #a5b4fc;
          background: rgba(99,102,241,0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .inventory-card-footer {
          padding: 16px 20px;
          background: rgba(0,0,0,0.2);
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .stock-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #666;
          font-weight: 600;
          margin-bottom: 8px;
          display: block;
        }

        .stock-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .stock-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.04);
          border-radius: 6px;
          font-size: 12px;
        }

        .stock-item.low {
          background: rgba(248,113,113,0.1);
        }

        .variant-name {
          color: #888;
        }

        .variant-qty {
          font-weight: 600;
          color: #fff;
        }

        .low-stock-icon {
          color: #f87171;
        }

        /* Events Page */
        .events-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .event-card {
          display: flex;
          gap: 24px;
          background: linear-gradient(145deg, #141416 0%, #111113 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .event-card.completed {
          opacity: 0.7;
        }

        .event-card-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 80px;
          padding: 16px;
          background: rgba(99,102,241,0.1);
          border-radius: 12px;
        }

        .event-card-date .month {
          font-size: 12px;
          text-transform: uppercase;
          color: #a5b4fc;
          font-weight: 600;
        }

        .event-card-date .day {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }

        .event-card-date .year {
          font-size: 12px;
          color: #666;
        }

        .event-card-content {
          flex: 1;
        }

        .event-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .event-card-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
        }

        .event-card-details {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
        }

        .event-card-details span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #888;
        }

        .event-card-stats {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .event-card-stats .stat {
          display: flex;
          flex-direction: column;
        }

        .event-card-stats .label {
          font-size: 12px;
          color: #666;
        }

        .event-card-stats .value {
          font-size: 24px;
          font-weight: 700;
          color: #00d26a;
        }

        .event-card-actions {
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* Settlements Page */
        .settlement-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .summary-card {
          background: linear-gradient(145deg, #141416 0%, #111113 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 20px;
        }

        .summary-card h4 {
          font-size: 13px;
          color: #666;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .summary-card .amount {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
        }

        .summary-card .amount.highlight {
          color: #00d26a;
        }

        .settlements-table {
          width: 100%;
          border-collapse: collapse;
        }

        .settlements-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .settlements-table td {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 14px;
          color: #ccc;
        }

        .event-cell {
          display: flex;
          flex-direction: column;
        }

        .event-cell .venue {
          font-weight: 500;
          color: #fff;
        }

        .event-cell .city {
          font-size: 12px;
          color: #666;
        }

        .square-integration-note {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(0,210,106,0.05);
          border: 1px solid rgba(0,210,106,0.15);
          border-radius: 12px;
          margin-top: 24px;
        }

        .note-icon {
          font-size: 32px;
          font-weight: 700;
          color: #00d26a;
        }

        .note-content h4 {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .note-content p {
          font-size: 14px;
          color: #888;
        }
      `}</style>

      <Navigation />
      
      <main>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'pos' && <PointOfSale />}
        {activeView === 'inventory' && <Inventory />}
        {activeView === 'events' && <Events />}
        {activeView === 'settlements' && <Settlements />}
      </main>
    </div>
  );
}
