'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartContext';
import { submitCheckoutAction, getCheckoutCustomerDataAction } from './actions';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  AlertCircle,
  Lock,
  User,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  postalCode: string | null;
  isDefault: boolean;
}

interface LoggedInCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  // Logged-in customer state
  const [customer, setCustomer] = useState<LoggedInCustomer | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cityArea, setCityArea] = useState('Moulvibazar Sadar');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD'>('COD');

  // Account creation at checkout (for guest users)
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delivery fee calculation
  const deliveryFee = cityArea.toLowerCase().includes('sadar') || cityArea.toLowerCase().includes('kusumbagh') ? 60 : 120;
  const grandTotal = subtotal + deliveryFee;

  // Load customer session and saved addresses on mount
  useEffect(() => {
    async function loadCustomer() {
      try {
        const data = await getCheckoutCustomerDataAction();
        if (data.customer) {
          setCustomer(data.customer);
          setCustomerName(data.customer.fullName);
          if (data.customer.phone) setCustomerPhone(data.customer.phone);
          if (data.customer.email) setCustomerEmail(data.customer.email);

          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault) || data.addresses[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setCustomerName(defaultAddr.fullName);
              setCustomerPhone(defaultAddr.phone);
              setDeliveryAddress(defaultAddr.address);
              setCityArea(defaultAddr.area.includes('Sadar') ? 'Moulvibazar Sadar' : defaultAddr.area);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load customer data for checkout:', err);
      }
    }

    loadCustomer();
  }, []);

  // Handle selecting a saved address
  const handleSelectSavedAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === 'custom') {
      return;
    }
    const addr = savedAddresses.find((a) => a.id === addressId);
    if (addr) {
      setCustomerName(addr.fullName);
      setCustomerPhone(addr.phone);
      setDeliveryAddress(addr.address);
      setCityArea(addr.area.includes('Sadar') ? 'Moulvibazar Sadar' : addr.area);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your shopping cart is empty. Please add products first.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage('Please provide your full name, phone number, and delivery address.');
      return;
    }

    if (createAccount) {
      if (!customerEmail.trim()) {
        setErrorMessage('An email address is required to create your account.');
        return;
      }
      if (accountPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryAddress: deliveryAddress.trim(),
        cityArea,
        notes: notes.trim() || undefined,
        deliveryMethod: 'STANDARD' as const,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        customerId: customer?.id,
        createAccount: !customer && createAccount,
        accountPassword: !customer && createAccount ? accountPassword : undefined,
      };

      const result = await submitCheckoutAction(payload);

      if (result.success && result.orderNumber && result.trackingToken) {
        clearCart();
        router.push(
          `/order-confirmation/${result.orderNumber}?token=${encodeURIComponent(
            result.trackingToken
          )}`
        );
      } else {
        setErrorMessage(result.error || 'Failed to complete order. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Your Cart is Empty</h1>
        <p className="text-xs text-slate-500">
          Please add products to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#0084d6] hover:bg-[#0074be] text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete the form below to place your order. Our team will verify and dispatch your order swiftly.
        </p>
      </div>

      {/* Customer Status Banner */}
      {customer ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              Signed in as <strong className="font-bold">{customer.fullName}</strong> ({customer.email})
            </span>
          </div>
          <Link
            href="/account"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            My Account
          </Link>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Already have an account? Sign in for faster checkout with saved addresses.</span>
          </div>
          <Link
            href="/login?redirect=/checkout"
            className="text-xs font-bold bg-[#0084d6] text-white px-3 py-1.5 rounded-lg hover:bg-[#0074be] transition flex-shrink-0"
          >
            Sign In
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved Addresses Selector (for logged-in customers) */}
          {customer && savedAddresses.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0084d6]" />
                <span>Select a Saved Delivery Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs ${
                      selectedAddressId === addr.id
                        ? 'border-[#0084d6] bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 line-clamp-2">{addr.address}</p>
                    <p className="text-slate-500 text-[11px] mt-1">
                      {addr.area}, {addr.city} • {addr.phone}
                    </p>
                  </div>
                ))}

                <div
                  onClick={() => handleSelectSavedAddress('custom')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs flex items-center justify-center font-bold ${
                    selectedAddressId === 'custom'
                      ? 'border-[#0084d6] bg-blue-50/50 text-[#0084d6] ring-2 ring-blue-100'
                      : 'border-dashed border-slate-300 hover:border-slate-400 text-slate-600'
                  }`}
                >
                  <span>+ Use a Different Address</span>
                </div>
              </div>
            </div>
          )}

          {/* Customer & Delivery Form Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              1. Customer & Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Tanvir Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Active Bangladesh mobile number
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address (Optional for Guest, Required for Account)
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="example@gmail.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Delivery Area / Zone *
              </label>
              <select
                value={cityArea}
                onChange={(e) => setCityArea(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition cursor-pointer"
              >
                <option value="Moulvibazar Sadar">
                  Moulvibazar Sadar / Kusumbagh / Town Area (Delivery Fee ৳60)
                </option>
                <option value="Sreemangal, Moulvibazar">
                  Sreemangal Upazila (Delivery Fee ৳120)
                </option>
                <option value="Kulaura, Moulvibazar">
                  Kulaura Upazila (Delivery Fee ৳120)
                </option>
                <option value="Kamalganj, Moulvibazar">
                  Kamalganj Upazila (Delivery Fee ৳120)
                </option>
                <option value="Rajnagar, Moulvibazar">
                  Rajnagar Upazila (Delivery Fee ৳120)
                </option>
                <option value="Barlekha, Moulvibazar">
                  Barlekha Upazila (Delivery Fee ৳120)
                </option>
                <option value="Juri, Moulvibazar">
                  Juri Upazila (Delivery Fee ৳120)
                </option>
                <option value="Outside Moulvibazar">
                  Outside Moulvibazar / Nationwide Courier (Delivery Fee ৳120)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Street Address (House, Road, Area) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. House #12, Road #4, Kusumbagh, Moulvibazar"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-[#0084d6] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Order Notes & Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Call before delivery"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
              />
            </div>

            {/* Optional "Create an account" section for guests */}
            {!customer && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0084d6] focus:ring-[#0084d6]"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Create an account with this order (Optional)
                  </span>
                </label>

                {createAccount && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 mt-2">
                    <p className="text-xs text-slate-600">
                      Set a password to easily track this order and manage future orders in your Customer Dashboard.
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Create Password *
                      </label>
                      <input
                        type="password"
                        required={createAccount}
                        placeholder="At least 6 characters"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] transition"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash On Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-[#0084d6] bg-blue-50/50 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-[#0084d6] focus:ring-[#0084d6]"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pay securely in cash when you receive and inspect your products.
                  </p>
                </div>
              </label>

              {/* bKash / Mobile Banking */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'BKASH'
                    ? 'border-[#0084d6] bg-blue-50/50 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="BKASH"
                  checked={paymentMethod === 'BKASH'}
                  onChange={() => setPaymentMethod('BKASH')}
                  className="mt-1 text-[#0084d6] focus:ring-[#0084d6]"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                    <CreditCard className="w-4 h-4 text-pink-600" />
                    <span>bKash / Mobile Banking</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Send money directly to our verified merchant hotline number after order placement.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Items summary list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-900 flex-shrink-0">
                      {item.quantity}x
                    </span>
                    <span className="text-slate-700 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 flex-shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  ৳{subtotal.toLocaleString('en-BD')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-slate-800">
                  ৳{deliveryFee.toLocaleString('en-BD')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span className="font-semibold text-emerald-600">৳0</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Payable:</span>
              <span className="text-2xl font-black text-[#0084d6]">
                ৳{grandTotal.toLocaleString('en-BD')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm Order</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              * A representative will contact you via phone/SMS to confirm dispatch.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>100% Genuine Products with Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0084d6] flex-shrink-0" />
              <span>Direct delivery from T.S Plaza, Kusumbagh Showroom</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
