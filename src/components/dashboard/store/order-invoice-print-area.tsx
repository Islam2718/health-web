"use client";

import { useStore } from "@/context/store-context";

// Print-only invoice — hidden on screen, revealed only by the matching
// #order-invoice-print-area rule in globals.css. data-print-size picks
// which named @page box (and font size) applies, set right before
// window.print() fires by whichever button was clicked (see
// StoreContext's printOrder). Mounted once in the store layout so it
// stays available no matter which page (POS or Orders) triggered it.
export function OrderInvoicePrintArea() {
  const { myStore, lastOrder, lastOrderCustomer, printInvoiceMode } = useStore();

  if (!lastOrder) return null;

  return (
    <div id="order-invoice-print-area" data-print-size={printInvoiceMode?.size ?? "a4"} className="hidden">
      <div className="text-center">
        <p className="text-base font-bold">{myStore?.store_name}</p>
        {myStore?.store_address && <p className="text-xs">{myStore.store_address}</p>}
        {myStore?.phone && <p className="text-xs">{myStore.phone}</p>}
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <span>Order #{lastOrder.order_number}</span>
        <span>{new Date(lastOrder.placed_at ?? lastOrder.created_at ?? Date.now()).toLocaleString()}</span>
      </div>
      {lastOrderCustomer && (
        <p className="mt-1 text-xs">
          Customer: {lastOrderCustomer.name}
          {lastOrderCustomer.phone && ` · ${lastOrderCustomer.phone}`}
          {lastOrderCustomer.address && ` · ${lastOrderCustomer.address}`}
        </p>
      )}
      <div className="mt-2 border-t border-dashed border-black" />
      <table className="mt-2 w-full text-xs">
        <thead>
          <tr>
            <th className="text-left font-semibold">Item</th>
            <th className="text-right font-semibold">Qty</th>
            <th className="text-right font-semibold">Price</th>
            <th className="text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {lastOrder.items.map((item, i) => (
            <tr key={item.id ?? i}>
              <td>{item.medicine_name ?? `Item #${item.store_product_id}`}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{Number(item.unit_price).toFixed(2)}</td>
              <td className="text-right">{Number(item.total_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 border-t border-dashed border-black" />
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>৳{Number(lastOrder.subtotal).toFixed(2)}</span>
        </div>
        {Number(lastOrder.discount) > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>−৳{Number(lastOrder.discount).toFixed(2)}</span>
          </div>
        )}
        {Number(lastOrder.delivery_fee) > 0 && (
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>৳{Number(lastOrder.delivery_fee).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-black pt-1 text-sm font-bold">
          <span>Total</span>
          <span>৳{Number(lastOrder.total).toFixed(2)}</span>
        </div>
      </div>
      {lastOrder.payment_method && <p className="mt-2 text-xs">Payment: {lastOrder.payment_method}</p>}
      <p className="mt-4 text-center text-xs">Thank you for your purchase!</p>
    </div>
  );
}
