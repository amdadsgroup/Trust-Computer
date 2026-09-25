'use client';

import React, { useState, useEffect } from 'react';
import {
  addCustomerAddressAction,
  updateCustomerAddressAction,
  deleteCustomerAddressAction,
  setDefaultCustomerAddressAction,
} from '../../auth/actions';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface AddressItem {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  postalCode: string | null;
  deliveryInstructions: string | null;
  isDefault: boolean;
}

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Moulvibazar Sadar');
  const [city, setCity] = useState('Moulvibazar');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadAddresses() {
    try {
      const res = await fetch('/api/account/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (e) {
      console.error('Failed to load addresses:', e);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingAddressId(null);
    setFullName('');
    setPhone('');
    setAddress('');
    setArea('Moulvibazar Sadar');
    setCity('Moulvibazar');
    setPostalCode('');
    setDeliveryInstructions('');
    setIsDefault(addresses.length === 0);
    setIsFormOpen(true);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddress(addr.address);
    setArea(addr.area);
    setCity(addr.city);
    setPostalCode(addr.postalCode || '');
    setDeliveryInstructions(addr.deliveryInstructions || '');
    setIsDefault(addr.isDefault);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const payload = {
      fullName,
      phone,
      address,
      area,
      city,
      postalCode: postalCode || undefined,
      deliveryInstructions: deliveryInstructions || undefined,
      isDefault,
    };

    try {
      let result;
      if (editingAddressId) {
        result = await updateCustomerAddressAction(editingAddressId, payload);
      } else {
        result = await addCustomerAddressAction(payload);
      }

      if (result.success) {
        setSuccessMessage(result.message || 'Address saved.');
        setIsFormOpen(false);
        await loadAddresses();
      } else {
        setErrorMessage(result.error || 'Failed to save address.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this saved address?')) return;
    try {
      const result = await deleteCustomerAddressAction(id);
      if (result.success) {
        await loadAddresses();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const result = await setDefaultCustomerAddressAction(id);
      if (result.success) {
        await loadAddresses();
      }
    } catch (err) {
      console.error('Set default error:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your delivery destinations for rapid checkout.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-800">No Saved Addresses</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save your home or office address once to complete future orders in one click.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition relative space-y-3 ${
                addr.isDefault
                  ? 'border-[#0084d6] bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">
                  {addr.fullName}
                </span>
                {addr.isDefault && (
                  <span className="bg-[#0084d6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Default</span>
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-medium text-slate-800">{addr.address}</p>
                <p>
                  {addr.area}, {addr.city} {addr.postalCode ? `(${addr.postalCode})` : ''}
                </p>
                <p className="text-slate-500">Phone: {addr.phone}</p>
                {addr.deliveryInstructions && (
                  <p className="text-[11px] text-slate-400 italic">
                    Note: &ldquo;{addr.deliveryInstructions}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-[#0084d6] hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shiblu Ahmed"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Area / Upazila *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Kusumbagh / Moulvibazar Sadar"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Moulvibazar"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Postal Code (Optional)</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 3200"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Street Address *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Road, Apartment, Landmark"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Ring the doorbell on 2nd floor"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0084d6] focus:bg-white transition"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0084d6] focus:ring-[#0084d6]"
                />
                <span className="font-medium text-slate-700">Set as my default delivery address</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#0084d6] hover:bg-[#0074be] text-white font-bold px-5 py-2 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
