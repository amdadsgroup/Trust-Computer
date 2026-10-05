'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartContext';
import { submitCheckoutAction, getCheckoutCustomerDataAction, validateCouponAction } from './actions';
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
  Tag,
  X,
  Check,
  Copy,
  Clock,
  Loader2,
} from 'lucide-react';
import { business } from '@/lib/business';

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
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH'>('COD');

  // bKash Payment Form Fields
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [copiedBkash, setCopiedBkash] = useState(false);

  // Account creation at checkout (for guest users)
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: string;
    discountAmount: number;
    message: string;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Delivery fee & discount calculations
  const baseDeliveryFee =
    cityArea.toLowerCase().includes('sadar') || cityArea.toLowerCase().includes('kusumbagh')
      ? 60
      : 120;
  const isFreeDelivery = appliedCoupon?.type === 'FREE_DELIVERY';
  const effectiveDeliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const discountAmount = isFreeDelivery ? baseDeliveryFee : (appliedCoupon?.discountAmount || 0);
  const grandTotal = Math.max(0, subtotal + effectiveDeliveryFee - (isFreeDelivery ? 0 : discountAmount));

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

  // Handle coupon validation & application
  const handleApplyCoupon = async () => {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await validateCouponAction({
        code,
        orderSubtotal: subtotal,
      });

      if (res.valid && res.code) {
        setAppliedCoupon({
          code: res.code,
          type: res.type || 'PERCENTAGE',
          discountAmount: res.discountAmount || 0,
          message: res.message,
        });
        setCouponSuccess(res.message);
        setCouponCodeInput('');
      } else {
        setCouponError(res.message || 'Invalid coupon code.');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Copy bKash number with modern Clipboard API and fallback
  const handleCopyBkash = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(business.payment.bkash);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = business.payment.bkash;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedBkash(true);
      setTimeout(() => setCopiedBkash(false), 2500);
    } catch (err) {
      console.error('Failed to copy bKash number:', err);
      setCopiedBkash(true);
      setTimeout(() => setCopiedBkash(false), 2500);
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

    if (paymentMethod === 'BKASH') {
      const sanitizedSender = senderNumber.trim().replace(/[\s\-()]/g, '');
      const trimmedTxId = transactionId.trim();

      if (!sanitizedSender) {
        setErrorMessage('Please enter the Sender bKASH Number used for the transaction.');
        return;
      }

      if (!/^01[3-9]\d{8}$/.test(sanitizedSender)) {
        setErrorMessage('Please enter a valid 11-digit Bangladesh bKash mobile number (e.g. 01XXXXXXXXX).');
        return;
      }

      if (!trimmedTxId || trimmedTxId.length < 4) {
        setErrorMessage(`Please complete the bKash payment to ${business.payment.bkash} and enter the Transaction ID.`);
        return;
      }
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
        transactionId: paymentMethod === 'BKASH' ? transactionId.trim().toUpperCase() : undefined,
        senderNumber: paymentMethod === 'BKASH' ? senderNumber.trim().replace(/[\s\-()]/g, '') : undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        customerId: customer?.id,
        createAccount: !customer && createAccount,
        accountPassword: !customer && createAccount ? accountPassword : undefined,
        couponCode: appliedCoupon?.code || undefined,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete the form below to place your order. Our team will verify and dispatch your order swiftly.
          </p>
        </div>
        <div className="inline-flex items-center self-start sm:self-auto px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2A3B97] text-xs font-bold">
          <span>- Your Trust, Our Technology -</span>
        </div>
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

              {/* bKash Cash Out */}
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
                    <span>bKASH Cash Out</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Send payment to official bKash number ({business.payment.bkash}) and submit Transaction ID.
                  </p>
                </div>
              </label>
            </div>

            {/* bKash Payment Card */}
            {paymentMethod === 'BKASH' && (
              <div className="mt-4 p-5 rounded-2xl bg-white border-2 border-pink-300 shadow-sm space-y-5 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                      ৳
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                        bKASH CASH OUT
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Official Trust Computer bKash Payment Account
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Payment Status: Verification Pending</span>
                  </span>
                </div>

                {/* Number & Amount Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-pink-50/50 p-4 rounded-xl border border-pink-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Pay To:
                    </span>
                    <div className="flex items-center gap-2.5 mt-1">
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-wider">
                        {business.payment.bkash}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyBkash}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          copiedBkash
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-pink-600 text-white hover:bg-pink-700 shadow-xs'
                        }`}
                        title="Copy bKash Number"
                      >
                        {copiedBkash ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>bKASH number copied ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY NUMBER</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-[10.5px] text-slate-500 block mt-1">
                      Type: bKash Cash Out / Payment
                    </span>
                  </div>

                  <div className="border-t sm:border-t-0 sm:border-l border-pink-200 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Amount to Pay:
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#0084d6] mt-0.5">
                      ৳ {grandTotal.toLocaleString('en-BD')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Exact order total (items + delivery fee)
                    </span>
                  </div>
                </div>

                {/* Step-by-Step Payment Instructions */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <span>HOW TO PAY WITH bKASH</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11.5px] leading-relaxed text-slate-700">
                    <li>Note the total amount shown above (<strong>৳ {grandTotal.toLocaleString('en-BD')}</strong>).</li>
                    <li>
                      Complete the bKASH cash-out/payment transaction using the provided bKASH number:{' '}
                      <strong className="font-mono text-slate-900">{business.payment.bkash}</strong>.
                    </li>
                    <li>Keep your bKASH transaction ID.</li>
                    <li>Enter the bKASH number used for the transaction below.</li>
                    <li>Enter the Transaction ID below.</li>
                    <li>Submit your payment information.</li>
                    <li>Trust Computer will verify the payment against our official records.</li>
                  </ol>
                </div>

                {/* Form Fields: Sender Number & Transaction ID */}
                <div className="space-y-4 pt-1">
                  <p className="text-xs font-semibold text-slate-700">
                    After completing your bKASH payment, enter the payment information below:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5">
                        Sender bKASH Number *
                      </label>
                      <input
                        type="tel"
                        required={paymentMethod === 'BKASH'}
                        inputMode="tel"
                        placeholder="01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        The 11-digit mobile number you sent money from
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === 'BKASH'}
                        placeholder="XXXXXXXXXX"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        className="w-full text-xs sm:text-sm font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-pink-600 focus:bg-white focus:ring-2 focus:ring-pink-100 transition tracking-wider"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Received in bKash SMS or app transaction statement
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification Notice */}
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <p className="font-semibold">
                    Payment verification requires manual confirmation by Trust Computer.
                  </p>
                  <p className="text-[10.5px] text-amber-800">
                    Payment status will remain <strong>Verification Pending</strong> until an authorized administrator verifies the transaction against our official bKash merchant/cash-out records.
                  </p>
                </div>

                {/* Support Helpline */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Having trouble with payment?</span>
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${business.sales.phone}`}
                      className="font-bold text-[#0084d6] hover:underline"
                    >
                      Sales Care: {business.sales.phone}
                    </a>
                    <span>•</span>
                    <a
                      href={business.sales.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      WhatsApp Support
                    </a>
                  </div>
                </div>
              </div>
            )}
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

            {/* Coupon Code Section */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                <Tag className="w-3.5 h-3.5 text-[#0084d6]" />
                <span>Apply Coupon Code</span>
              </div>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-emerald-900 tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                          {isFreeDelivery ? 'Free Delivery' : `-৳${discountAmount.toLocaleString('en-BD')}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                        {appliedCoupon.message}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-white rounded-lg transition"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME100"
                      value={couponCodeInput}
                      onChange={(e) => {
                        setCouponCodeInput(e.target.value.toUpperCase());
                        if (couponError) setCouponError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white font-mono uppercase tracking-wider transition"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCodeInput.trim()}
                      className="bg-[#0084d6] hover:bg-[#0074be] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </div>
              )}
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
                  {isFreeDelivery ? (
                    <span className="flex items-center gap-1.5">
                      <span className="line-through text-slate-400">৳{baseDeliveryFee}</span>
                      <span className="text-emerald-600 font-bold">৳0 (Free)</span>
                    </span>
                  ) : (
                    `৳${baseDeliveryFee.toLocaleString('en-BD')}`
                  )}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code}):</span>
                  <span>-৳{discountAmount.toLocaleString('en-BD')}</span>
                </div>
              )}
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
              className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg disabled:opacity-50 ${
                paymentMethod === 'BKASH'
                  ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/20'
                  : 'bg-[#0084d6] hover:bg-[#0074be] text-white shadow-blue-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{paymentMethod === 'BKASH' ? 'Submitting bKash Payment...' : 'Processing Order...'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{paymentMethod === 'BKASH' ? 'SUBMIT PAYMENT' : 'Confirm Order'}</span>
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
            <div className="pt-2 border-t border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                - Your Trust, Our Technology -
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
