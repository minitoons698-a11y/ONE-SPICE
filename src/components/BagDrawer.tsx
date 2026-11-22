import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Check, Minus, Plus, Smartphone, Trash2, Wallet, X } from 'lucide-react';
import {
  PaymentMethod,
  PaymentSettings,
  SHOP_INFO,
  formatUGX,
} from '../data/spices';
import { OperationType, db, handleFirestoreError } from '../lib/firebase';
import { SpiceImage } from './SpiceImage';

export interface BagItem {
  spiceId: string;
  name: string;
  image: string;
  weightLabel: string;
  unitPrice: number;
  quantity: number;
}

interface BagDrawerProps {
  isOpen: boolean;
  items: BagItem[];
  paymentSettings: PaymentSettings;
  onClose: () => void;
  onUpdateQuantity: (spiceId: string, weightLabel: string, delta: number) => void;
  onRemoveItem: (spiceId: string, weightLabel: string) => void;
  onClearBag: () => void;
}

export function BagDrawer({
  isOpen,
  items,
  paymentSettings,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearBag,
}: BagDrawerProps) {
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('+256 ');
  const [paymentReference, setPaymentReference] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<{
    orderNumber: string;
    total: number;
    method: 'pickup' | 'delivery';
    paymentMethod: PaymentMethod;
  } | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryFee =
    fulfillment === 'delivery' && subtotal > 0 && subtotal < SHOP_INFO.freeDeliveryThresholdUGX
      ? SHOP_INFO.deliveryFeeUGX
      : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const orderNumber = `OS-${Math.floor(1040 + Math.random() * 8900)}`;
    const path = 'orders';

    try {
      await addDoc(collection(db, path), {
        orderNumber,
        customerName: customerName.trim().slice(0, 120),
        customerPhone: customerPhone.trim().slice(0, 40),
        customerEmail: customerEmail.trim().slice(0, 160),
        fulfillment,
        deliveryAddress: fulfillment === 'delivery' ? customerAddress.trim().slice(0, 240) : '',
        paymentMethod,
        paymentPhone: paymentMethod === 'cod' ? '' : paymentPhone.trim().slice(0, 40),
        paymentReference: paymentMethod === 'cod' ? '' : paymentReference.trim().slice(0, 120),
        paymentConfirmed: false,
        notes: orderNotes.trim().slice(0, 500),
        items: items.slice(0, 30).map((item) => ({
          spiceId: item.spiceId,
          name: item.name,
          weightLabel: item.weightLabel,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
        subtotal,
        deliveryFee,
        total,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setOrderConfirmed({
        orderNumber,
        total,
        method: fulfillment,
        paymentMethod,
      });
      onClearBag();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
      setPaymentPhone('+256 ');
      setPaymentReference('');
      setOrderNotes('');
    } catch (error) {
      setSubmitError('Unable to submit order right now. Please check your details and try again.');
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOrderConfirmed(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-[#171614]/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#F8F7F4] border-l border-[#171614]/12 flex flex-col shadow-2xl"
          >
            <div className="px-6 py-5 border-b border-[#171614]/10 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-medium text-[#171614]">
                  Your {SHOP_INFO.brand} Bag
                </h2>
                <p className="text-xs text-[#5C5852] mt-0.5 tabular-nums">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} items selected
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#5C5852] hover:text-[#171614] hover:bg-[#EFECE6] transition-colors cursor-pointer"
                aria-label="Close bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {orderConfirmed ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#8C1D2F]/10 text-[#8C1D2F] flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-medium text-[#171614]">
                    Order {orderConfirmed.orderNumber} Received
                  </h3>
                  <p className="text-sm text-[#5C5852] leading-relaxed max-w-xs mx-auto">
                    {orderConfirmed.paymentMethod === 'cod'
                      ? 'Your order is queued for Cash on Delivery / Counter payment.'
                      : `Your ${
                          orderConfirmed.paymentMethod === 'momo' ? 'MTN MoMo' : 'Airtel Pay'
                        } order is queued. Our team will verify payment and dispatch your spices shortly.`}
                  </p>
                  <div className="pt-2 text-sm font-semibold text-[#171614] tabular-nums">
                    Total Ordered: {formatUGX(orderConfirmed.total)}
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-4 inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-[#171614] hover:bg-[#8C1D2F] rounded-lg transition-colors cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="font-display text-xl text-[#171614]">Your bag is empty</p>
                  <p className="text-sm text-[#5C5852] max-w-xs mx-auto leading-relaxed">
                    Browse our spice profiles to select a jar weight and add freshly packed spices to your bag.
                  </p>
                  <a
                    href="#/spices"
                    onClick={handleClose}
                    className="inline-block pt-2 text-xs font-semibold text-[#8C1D2F] underline underline-offset-4"
                  >
                    Browse One Spice Catalog
                  </a>
                </div>
              ) : (
                <div className="space-y-5">
                  <ul className="divide-y divide-[#171614]/10">
                    {items.map((item) => (
                      <li
                        key={`${item.spiceId}-${item.weightLabel}`}
                        className="py-4 first:pt-0 flex gap-4 items-start"
                      >
                        <div className="w-20 h-16 rounded-md overflow-hidden bg-[#EFECE6] shrink-0 border border-[#171614]/8">
                          <SpiceImage
                            src={item.image}
                            alt={item.name}
                            title={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-base font-medium text-[#171614] truncate">
                              {item.name}
                            </h3>
                            <span className="text-sm font-medium text-[#171614] tabular-nums shrink-0">
                              {formatUGX(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                          <p className="text-xs text-[#5C5852] mt-0.5 tabular-nums">
                            {item.weightLabel} · {formatUGX(item.unitPrice)} each
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-[#171614]/15 rounded-md bg-white">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.spiceId, item.weightLabel, -1)}
                                className="w-8 h-8 inline-flex items-center justify-center text-[#5C5852] hover:text-[#171614] cursor-pointer"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-medium tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.spiceId, item.weightLabel, 1)}
                                className="w-8 h-8 inline-flex items-center justify-center text-[#5C5852] hover:text-[#171614] cursor-pointer"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.spiceId, item.weightLabel)}
                              className="inline-flex items-center gap-1 text-xs text-[#5C5852] hover:text-[#8C1D2F] transition-colors cursor-pointer"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-[#171614]/10 space-y-4">
                    {/* Fulfillment Method */}
                    <div>
                      <span className="block text-xs font-medium text-[#5C5852] mb-2">
                        Fulfillment Method
                      </span>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-[#EFECE6] rounded-lg">
                        <button
                          type="button"
                          onClick={() => setFulfillment('delivery')}
                          className={`py-2 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                            fulfillment === 'delivery'
                              ? 'bg-white text-[#171614] shadow-xs'
                              : 'text-[#5C5852] hover:text-[#171614]'
                          }`}
                        >
                          Online Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setFulfillment('pickup')}
                          className={`py-2 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                            fulfillment === 'pickup'
                              ? 'bg-white text-[#171614] shadow-xs'
                              : 'text-[#5C5852] hover:text-[#171614]'
                          }`}
                        >
                          Shop Pickup (Free)
                        </button>
                      </div>
                    </div>

                    {/* 3 Payment Options: MTN MoMo, Airtel Pay, Cash on Delivery */}
                    <div className="space-y-2.5">
                      <span className="block text-xs font-medium text-[#5C5852]">
                        Payment Option
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('momo')}
                          className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                            paymentMethod === 'momo'
                              ? 'border-[#8C1D2F] bg-white text-[#171614]'
                              : 'border-[#171614]/12 bg-[#EFECE6]/50 text-[#5C5852]'
                          }`}
                        >
                          MTN MoMo
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('airtel')}
                          className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                            paymentMethod === 'airtel'
                              ? 'border-[#8C1D2F] bg-white text-[#171614]'
                              : 'border-[#171614]/12 bg-[#EFECE6]/50 text-[#5C5852]'
                          }`}
                        >
                          Airtel Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                            paymentMethod === 'cod'
                              ? 'border-[#8C1D2F] bg-white text-[#171614]'
                              : 'border-[#171614]/12 bg-[#EFECE6]/50 text-[#5C5852]'
                          }`}
                        >
                          Cash on Delivery
                        </button>
                      </div>

                      {paymentMethod === 'momo' && (
                        <div className="p-3.5 bg-white rounded-lg border border-[#171614]/12 space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-[#171614]">
                            <Smartphone className="w-3.5 h-3.5 text-[#8C1D2F]" />
                            <span>Send {formatUGX(total)} via MTN MoMo</span>
                          </div>
                          <p className="text-[#5C5852]">
                            Number:{' '}
                            <strong className="font-mono text-[#171614] tabular-nums">
                              {paymentSettings.momoNumber}
                            </strong>{' '}
                            ({paymentSettings.momoName})
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'airtel' && (
                        <div className="p-3.5 bg-white rounded-lg border border-[#171614]/12 space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-[#171614]">
                            <Smartphone className="w-3.5 h-3.5 text-[#8C1D2F]" />
                            <span>Send {formatUGX(total)} via Airtel Pay</span>
                          </div>
                          <p className="text-[#5C5852]">
                            Number:{' '}
                            <strong className="font-mono text-[#171614] tabular-nums">
                              {paymentSettings.airtelNumber}
                            </strong>{' '}
                            ({paymentSettings.airtelName})
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'cod' && (
                        <div className="p-3.5 bg-white rounded-lg border border-[#171614]/12 flex items-center gap-2 text-xs text-[#5C5852]">
                          <Wallet className="w-3.5 h-3.5 text-[#8C1D2F] shrink-0" />
                          <span>Pay {formatUGX(total)} in cash when your spices arrive or at pickup.</span>
                        </div>
                      )}
                    </div>

                    <form id="bag-checkout-form" onSubmit={handleCheckout} className="space-y-3">
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                      />
                      <input
                        type="tel"
                        required
                        minLength={4}
                        maxLength={40}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Contact phone (+256 ...)"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                      />
                      {paymentMethod !== 'cod' && (
                        <>
                          <input
                            type="tel"
                            required
                            minLength={6}
                            maxLength={40}
                            value={paymentPhone}
                            onChange={(e) => setPaymentPhone(e.target.value)}
                            placeholder={`Your ${paymentMethod === 'momo' ? 'MTN MoMo' : 'Airtel'} number (+256 ...)`}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                          />
                          <input
                            type="text"
                            maxLength={120}
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="Transaction ID / Reference (if already paid)"
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                          />
                        </>
                      )}
                      <input
                        type="email"
                        maxLength={160}
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Email address (optional)"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                      />
                      {fulfillment === 'delivery' && (
                        <input
                          type="text"
                          required
                          maxLength={240}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Delivery neighborhood / landmark"
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                        />
                      )}
                      <input
                        type="text"
                        maxLength={500}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Grind preference or delivery notes (optional)"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                      />
                    </form>
                  </div>
                </div>
              )}
            </div>

            {items.length > 0 && !orderConfirmed && (
              <div className="px-6 py-5 bg-white border-t border-[#171614]/10 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#5C5852]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatUGX(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5C5852]">
                  <span>
                    {fulfillment === 'pickup'
                      ? 'Shop Pickup'
                      : `Delivery (Free over ${formatUGX(SHOP_INFO.freeDeliveryThresholdUGX)})`}
                  </span>
                  <span className="tabular-nums">
                    {deliveryFee === 0 ? 'Free' : formatUGX(deliveryFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#171614]/10 flex items-center justify-between text-base font-semibold text-[#171614]">
                  <span>Total</span>
                  <span className="tabular-nums">{formatUGX(total)}</span>
                </div>
                {submitError && (
                  <p className="text-xs text-[#8C1D2F] font-medium">{submitError}</p>
                )}
                <button
                  type="submit"
                  form="bag-checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Placing Order...' : `Place Order · ${formatUGX(total)}`}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
