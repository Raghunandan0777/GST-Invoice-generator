export type Plan = 'free' | 'pro' | 'business'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type GstType = 'cgst' | 'igst'

export interface Profile {
  id: string
  full_name: string | null
  plan: Plan
  invoice_count: number
  created_at: string
}

export interface Business {
  id: string
  user_id: string
  name: string
  gstin: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  phone: string | null
  email: string | null
  bank_name: string | null
  bank_account: string | null
  bank_ifsc: string | null
  bank_holder: string | null
  is_default: boolean
  created_at: string
}

export interface Customer {
  id: string
  user_id: string
  name: string
  gstin: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  phone: string | null
  email: string | null
  created_at: string
}

export interface InvoiceItem {
  id: string
  name: string
  hsn: string
  rate: number
  qty: number
  gst_rate: number
  taxable: number
  gst_amount: number
  total: number
}

export interface Invoice {
  id: string
  user_id: string
  business_id: string | null
  customer_id: string | null
  invoice_number: string
  invoice_date: string
  due_date: string | null
  place_of_supply: string | null
  status: InvoiceStatus
  gst_type: GstType
  gst_rate: number
  seller_name: string | null
  seller_gstin: string | null
  seller_address: string | null
  seller_phone: string | null
  seller_email: string | null
  buyer_name: string | null
  buyer_gstin: string | null
  buyer_address: string | null
  buyer_phone: string | null
  buyer_email: string | null
  items: InvoiceItem[]
  subtotal: number
  total_gst: number
  grand_total: number
  bank_name: string | null
  bank_account: string | null
  bank_ifsc: string | null
  bank_holder: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export const PLAN_LIMITS = {
  free: { invoices: 5, businesses: 1 },
  pro: { invoices: Infinity, businesses: 3 },
  business: { invoices: Infinity, businesses: 10 },
}

export const GST_RATES = [0, 5, 12, 18, 28]

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]
