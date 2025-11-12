import React from 'react';
import { Receipt, Calculator, Percent } from 'lucide-react';
import { Modal } from '@/components';
import { OrderItemTax } from '@/types/order.types';

interface TaxDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  taxes: OrderItemTax[];
  basePrice: number;
  quantity: number;
  orderDiscountAmount?: number;
  orderSubtotalAmount?: number;
}

const TaxDetailsModal: React.FC<TaxDetailsModalProps> = ({
  isOpen,
  onClose,
  itemName,
  taxes,
  basePrice,
  quantity,
  orderDiscountAmount = 0,
  orderSubtotalAmount = 0,
}) => {
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  const calculateSubtotal = () => {
    return basePrice * quantity;
  };

  const calculatePriceBreakdown = () => {
    const subtotal = basePrice * quantity;
    
    // Separate inclusive and exclusive taxes
    const inclusiveTaxes = taxes.filter(tax => tax.is_excluded === 2); // Included taxes
    const exclusiveTaxes = taxes.filter(tax => tax.is_excluded === 1); // Excluded taxes
    
    // Step 1: Extract base price excluding inclusive taxes
    let basePriceExcludingInclusive = subtotal;
    if (inclusiveTaxes.length > 0) {
      const inclusiveTaxRate = inclusiveTaxes.reduce((sum, tax) => {
        const rate = typeof tax.rate === 'string' ? parseFloat(tax.rate) : tax.rate;
        return sum + rate;
      }, 0);
      // Formula: basePrice = inclusivePrice / (1 + inclusiveTaxRate/100)
      basePriceExcludingInclusive = subtotal / (1 + inclusiveTaxRate / 100);
    }
    
    // Step 2: Apply discount from order data if available
    let discountAmount = 0;
    let discountedBasePrice = basePriceExcludingInclusive;
    
    if (orderDiscountAmount > 0 && orderSubtotalAmount > 0) {
      // Calculate proportional discount for this item
      const itemProportion = (basePrice * quantity) / orderSubtotalAmount;
      discountAmount = orderDiscountAmount * itemProportion;
      discountedBasePrice = basePriceExcludingInclusive - discountAmount;
    }
    
    // Step 3: Recalculate inclusive taxes on discounted base price
    const recalculatedInclusiveTax = inclusiveTaxes.reduce((sum, tax) => {
      const rate = typeof tax.rate === 'string' ? parseFloat(tax.rate) : tax.rate;
      return sum + (discountedBasePrice * rate / 100);
    }, 0);
    
    // Step 4: Add exclusive taxes on discounted base price
    const exclusiveTaxAmount = exclusiveTaxes.reduce((sum, tax) => {
      const rate = typeof tax.rate === 'string' ? parseFloat(tax.rate) : tax.rate;
      return sum + (discountedBasePrice * rate / 100);
    }, 0);
    
    return {
      originalSubtotal: subtotal,
      basePriceExcludingInclusive,
      discountAmount,
      discountedBasePrice,
      recalculatedInclusiveTax,
      exclusiveTaxAmount,
      finalAmount: discountedBasePrice + recalculatedInclusiveTax + exclusiveTaxAmount
    };
  };

  const calculateTotalTaxAmount = () => {
    const breakdown = calculatePriceBreakdown();
    return breakdown.recalculatedInclusiveTax + breakdown.exclusiveTaxAmount;
  };

  const calculateTaxAmount = (tax: any) => {
    const breakdown = calculatePriceBreakdown();
    const taxRate = typeof tax.rate === 'string' ? parseFloat(tax.rate) : tax.rate;
    
    if (tax.is_excluded === 1) {
      // Exclusive tax - applied on discounted base price
      return breakdown.discountedBasePrice * taxRate / 100;
    } else {
      // Inclusive tax - recalculated on discounted base price
      return breakdown.discountedBasePrice * taxRate / 100;
    }
  };

  const getTaxTypeText = (isExcluded: number) => {
    return isExcluded === 1 ? 'Excluded' : 'Included';
  };

  const getTaxTypeColor = (isExcluded: number) => {
    return isExcluded === 1 ? 'text-indigo-600' : 'text-green-600';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Details" size="md">
      <div className="space-y-6">
        {/* Item Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Receipt className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Item Information</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Item:</span>
              <span className="font-medium">{itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-medium">{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
            </div>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Tax Breakdown</h3>
          </div>
          
          {taxes && taxes.length > 0 ? (
            <div className="space-y-3">
              {taxes.map((tax) => (
                <div key={tax.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Percent className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{tax.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getTaxTypeColor(tax.is_excluded)}`}>
                        {getTaxTypeText(tax.is_excluded)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Rate:</span>
                      <span className="ml-2 font-medium">{tax.rate}%</span>
                    </div>
                     <div>
                       <span className="text-gray-600">Amount:</span>
                       <span className="ml-2 font-medium text-green-600">
                         {formatCurrency(calculateTaxAmount(tax))}
                       </span>
                     </div>
                  </div>
                  
                  {tax.current_tax && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Current tax rate: {tax.current_tax.rate}% ({getTaxTypeText(tax.current_tax.is_excluded)})
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Tax Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Tax Summary</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(calculateTotalTaxAmount())}
                  </span>
                </div>
                 <div className="text-sm text-gray-600 space-y-1">
                   <div>Total tax amount applied to this item</div>
                   {taxes.filter(tax => tax.is_excluded === 1).length > 0 && (
                     <div className="text-xs text-green-700">
                       Excluded taxes: {formatCurrency(taxes.filter(tax => tax.is_excluded === 1).reduce((sum, tax) => sum + calculateTaxAmount(tax), 0))}
                     </div>
                   )}
                   {taxes.filter(tax => tax.is_excluded === 2).length > 0 && (
                     <div className="text-xs text-indigo-700">
                       Included taxes: {formatCurrency(taxes.filter(tax => tax.is_excluded === 2).reduce((sum, tax) => sum + calculateTaxAmount(tax), 0))}
                     </div>
                   )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Calculator className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No taxes applied to this item</p>
            </div>
          )}
        </div>

         {/* Price Breakdown */}
         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-4">
           <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
           {(() => {
             const breakdown = calculatePriceBreakdown();
             return (
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600">Original Price (Inclusive):</span>
                   <span className="font-medium">{formatCurrency(breakdown.originalSubtotal)}</span>
                 </div>
                 
                 <div className="flex justify-between">
                   <span className="text-gray-600">Base Price (Excluding Inclusive Tax):</span>
                   <span className="font-medium">{formatCurrency(breakdown.basePriceExcludingInclusive)}</span>
                 </div>
                 
                 {breakdown.discountAmount > 0 && (
                   <div className="flex justify-between">
                     <span className="text-gray-600">Discount:</span>
                     <span className="font-medium text-red-600">-{formatCurrency(breakdown.discountAmount)}</span>
                   </div>
                 )}
                 
                 <div className="flex justify-between">
                   <span className="text-gray-600">{breakdown.discountAmount > 0 ? 'Discounted Base Price:' : 'Base Price:'}</span>
                   <span className="font-medium">{formatCurrency(breakdown.discountedBasePrice)}</span>
                 </div>
                 
                 {breakdown.recalculatedInclusiveTax > 0 && (
                   <div className="flex justify-between">
                     <span className="text-gray-600">Inclusive Tax (Recalculated):</span>
                     <span className="font-medium text-indigo-600">+{formatCurrency(breakdown.recalculatedInclusiveTax)}</span>
                   </div>
                 )}
                 
                 {breakdown.exclusiveTaxAmount > 0 && (
                   <div className="flex justify-between">
                     <span className="text-gray-600">Exclusive Tax (SCGT):</span>
                     <span className="font-medium text-green-600">+{formatCurrency(breakdown.exclusiveTaxAmount)}</span>
                   </div>
                 )}
                 
                 <div className="border-t pt-2">
                   <div className="flex justify-between">
                     <span className="font-semibold text-gray-900">Final Payable Amount:</span>
                     <span className="text-lg font-bold text-gray-900">
                       {formatCurrency(breakdown.finalAmount)}
                     </span>
                   </div>
                 </div>
               </div>
             );
           })()}
         </div>
      </div>
    </Modal>
  );
};

export default TaxDetailsModal;
