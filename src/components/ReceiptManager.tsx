import React, { useState } from 'react';
import { Mail, MessageSquare, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button, Modal, Input, LoadingSpinner } from '@/components';
import { orderApi } from '@/api/orderApi';
import { Order } from '@/types/order.types';

interface ReceiptManagerProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email?: string; phone?: string; includePdf?: boolean }) => Promise<void>;
  type: 'email' | 'sms';
  loading: boolean;
  success: boolean;
  error: string | null;
  order: Order;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  loading,
  success,
  error,
  order
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [includePdf, setIncludePdf] = useState(false);

  // Pre-fill with customer data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (type === 'email' && order.customer_email) {
        setEmail(order.customer_email);
      } else if (type === 'sms' && order.customer_phone) {
        setPhone(order.customer_phone);
      }
    }
  }, [isOpen, type, order.customer_email, order.customer_phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'email' && email) {
      await onSubmit({ email, includePdf });
    } else if (type === 'sms' && phone) {
      await onSubmit({ phone, includePdf });
    }
  };

  const handleClose = () => {
    setEmail('');
    setPhone('');
    setIncludePdf(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Send ${type.toUpperCase()} Receipt`}>
      <div className="p-6">
        {success ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {type.toUpperCase()} Receipt Sent Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              The receipt has been sent to {type === 'email' ? email : phone}.
            </p>
            <Button onClick={handleClose} variant="primary">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {type === 'email' ? (
              <div>
                {order.customer_email && (
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-800">Customer Email Available</span>
                    </div>
                    <p className="text-sm text-indigo-700 mt-1">{order.customer_email}</p>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(value) => setEmail(value)}
                  placeholder={order.customer_email ? "Enter email address (or use customer email above)" : "Enter email address"}
                  required
                />
              </div>
            ) : (
              <div>
                {order.customer_phone && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Customer Phone Available</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{order.customer_phone}</p>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(value) => setPhone(value)}
                  placeholder={order.customer_phone ? "Enter phone number (or use customer phone above)" : "Enter phone number"}
                  required
                />
              </div>
            )}

            {/* PDF Option */}
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePdf}
                  onChange={(e) => setIncludePdf(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-indigo-800">
                  {type === 'email' ? '📄 Include PDF receipt as attachment' : '📄 Include PDF receipt download link'}
                </span>
              </label>
              <p className="text-xs text-indigo-600 mt-1">
                {type === 'email' 
                  ? 'A detailed PDF receipt will be attached to the email'
                  : 'A download link for the PDF receipt will be included in the SMS'
                }
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || (type === 'email' ? !email : !phone)}
                leftIcon={loading ? <LoadingSpinner size="sm" /> : undefined}
              >
                {loading ? 'Sending...' : `Send ${type.toUpperCase()} Receipt`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

const ReceiptManager: React.FC<ReceiptManagerProps> = ({ order, isOpen, onClose }) => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if customer has email and phone
  const hasCustomerEmail = Boolean(order.customer_email);
  const hasCustomerPhone = Boolean(order.customer_phone);

  const handleEmailReceipt = async (data: { email?: string; includePdf?: boolean }) => {
    if (!data.email) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.sendEmailReceipt({
        order_id: order.id,
        email: data.email,
        include_pdf_attachment: data.includePdf || false,
      });
      
      if (response?.status === 1) {
        setSuccess(true);
      } else {
        setError(response?.message || 'Failed to send email receipt');
      }
    } catch (err) {
      setError('Failed to send email receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSmsReceipt = async (data: { phone?: string; includePdf?: boolean }) => {
    if (!data.phone) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.sendSmsReceipt({
        order_id: order.id,
        phone_number: data.phone,
        include_pdf_link: data.includePdf || false,
      });
      
      if (response?.status === 1) {
        setSuccess(true);
      } else {
        setError(response?.message || 'Failed to send SMS receipt');
      }
    } catch (err) {
      setError('Failed to send SMS receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.downloadReceiptPdf(order.id);
      
      // Create a link to download the PDF using the URL from the response
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = result.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      setSuccess(true);
      // You can add a toast notification here if needed
      console.log('PDF receipt downloaded successfully!');
    } catch (err) {
      setError('Failed to download PDF receipt. Please try again.');
      console.error('PDF download error:', err);
    } finally {
      setLoading(false);
    }
  };


  const resetModal = () => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  };

  const handleEmailModalClose = () => {
    setEmailModalOpen(false);
    resetModal();
  };

  const handleSmsModalClose = () => {
    setSmsModalOpen(false);
    resetModal();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Receipt Management">
        <div className="p-6">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Order Receipt Options
              </h3>
              <p className="text-gray-600">
                Choose how you'd like to send the receipt for order #{order.order_no}
              </p>
              
              {/* Customer Contact Information Summary */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Contact Information</h4>
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <div className="flex items-start space-x-2 min-w-0">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-600 ml-1 break-all">
                        {hasCustomerEmail ? order.customer_email : 'Not available'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 min-w-0">
                    <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <span className="text-gray-600 ml-1 break-all">
                        {hasCustomerPhone ? order.customer_phone : 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center space-y-2 p-6 h-auto min-h-[120px]"
                onClick={() => setEmailModalOpen(true)}
              >
                <Mail className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                <span className="font-medium text-center">Email Receipt</span>
                <span className="text-sm text-gray-500 text-center break-words max-w-full px-2">
                  {hasCustomerEmail ? (
                    <span className="block">
                      <span className="block">Send to</span>
                      <span className="block truncate" title={order.customer_email}>
                        {order.customer_email}
                      </span>
                    </span>
                  ) : (
                    'Enter email address'
                  )}
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center space-y-2 p-6 h-auto min-h-[120px]"
                onClick={() => setSmsModalOpen(true)}
              >
                <MessageSquare className="h-8 w-8 text-green-600 flex-shrink-0" />
                <span className="font-medium text-center">SMS Receipt</span>
                <span className="text-sm text-gray-500 text-center break-words max-w-full px-2">
                  {hasCustomerPhone ? (
                    <span className="block">
                      <span className="block">Send to</span>
                      <span className="block truncate" title={order.customer_phone}>
                        {order.customer_phone}
                      </span>
                    </span>
                  ) : (
                    'Enter phone number'
                  )}
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center space-y-2 p-6 h-auto min-h-[120px]"
                onClick={handleDownloadPdf}
                disabled={loading}
                leftIcon={loading ? <LoadingSpinner size="sm" /> : undefined}
              >
                <Download className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-center">Download PDF</span>
                <span className="text-sm text-gray-500 text-center">Download receipt</span>
              </Button>

            </div>

            <div className="flex justify-end pt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ReceiptModal
        isOpen={emailModalOpen}
        onClose={handleEmailModalClose}
        onSubmit={handleEmailReceipt}
        type="email"
        loading={loading}
        success={success}
        error={error}
        order={order}
      />

      <ReceiptModal
        isOpen={smsModalOpen}
        onClose={handleSmsModalClose}
        onSubmit={handleSmsReceipt}
        type="sms"
        loading={loading}
        success={success}
        error={error}
        order={order}
      />
    </>
  );
};

export default ReceiptManager;
