import React, { useState, useEffect } from 'react';
import { SelectField } from '@/components/SelectField';
import { Button } from '@/components/Button';
import { printerApi, type Printer } from '@/api/printerApi';
import { useToast } from '@/components/Toast';

interface PrinterSelectorProps {
  value?: number;
  onChange: (printerId: number | null) => void;
  disabled?: boolean;
  showActiveOnly?: boolean;
  className?: string;
}

const PrinterSelector: React.FC<PrinterSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  showActiveOnly = true,
  className = ''
}) => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPrinters();
  }, [showActiveOnly]);

  useEffect(() => {
    if (value && printers.length > 0) {
      const printer = printers.find(p => p.id === value);
      setSelectedPrinter(printer || null);
    } else {
      setSelectedPrinter(null);
    }
  }, [value, printers]);

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const response = showActiveOnly 
        ? await printerApi.getActive()
        : await printerApi.getAll();
      
      if (response.status === 1) {
        setPrinters(response.data || []);
      } else {
        showToast('error', 'Failed to fetch printers');
      }
    } catch (error) {
      console.error('Failed to fetch printers:', error);
      showToast('error', 'Failed to fetch printers');
    } finally {
      setLoading(false);
    }
  };

  const handlePrinterChange = (printerId: string) => {
    const id = printerId ? parseInt(printerId) : null;
    const printer = printers.find(p => p.id === id) || null;
    setSelectedPrinter(printer);
    onChange(id);
  };

  const handleSetDefault = async () => {
    if (!selectedPrinter) return;

    try {
      const response = await printerApi.setDefault(selectedPrinter.id);
      if (response.status === 1) {
        showToast('success', 'Printer set as default successfully');
        fetchPrinters(); // Refresh to update the default status
      } else {
        showToast('error', response.message || 'Failed to set default printer');
      }
    } catch (error) {
      console.error('Failed to set default printer:', error);
      showToast('error', 'Failed to set default printer');
    }
  };

  const options = printers.map(printer => ({
    value: printer.id.toString(),
    label: `${printer.name}${printer.is_default ? ' (Default)' : ''}`,
    disabled: !printer.status
  }));

  if (loading) {
    return (
      <div className={`${className}`}>
        <SelectField
          options={[]}
          value=""
          onChange={() => {}}
          placeholder="Loading printers..."
          disabled={true}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <SelectField
        options={options}
        value={selectedPrinter?.id.toString() || ''}
        onChange={handlePrinterChange}
        placeholder="Select a printer"
        disabled={disabled}
      />
      
      {selectedPrinter && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              selectedPrinter.status ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span>
              {selectedPrinter.status ? 'Active' : 'Inactive'}
              {selectedPrinter.model_id && ` • ${selectedPrinter.model_id}`}
            </span>
          </div>
          
          {!selectedPrinter.is_default && selectedPrinter.status && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSetDefault}
              className="text-xs"
            >
              Set Default
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PrinterSelector;
