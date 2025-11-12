export interface Printer {
  id: number;
  store_id: number;
  name: string;
  model_id?: string;
  full_details?: any;
  status: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrinterRequest {
  name: string;
  model_id?: string;
  full_details?: any;
  is_default?: boolean;
}

export interface UpdatePrinterRequest {
  name: string;
  model_id?: string;
  full_details?: any;
  is_default?: boolean;
}

export interface PrinterResponse {
  status: number;
  message: string;
  data: Printer[];
  meta?: any;
}

export interface PrinterDetailsResponse {
  status: number;
  message: string;
  data: Printer;
}

export interface PrinterStats {
  total_printers: number;
  active_printers: number;
  inactive_printers: number;
  default_printer: Printer | null;
}

export interface PrinterStatsResponse {
  status: number;
  message: string;
  data: PrinterStats;
}
