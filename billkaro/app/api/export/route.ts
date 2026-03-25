import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { format, from, to, invoiceIds } = await req.json()

    // Fetch invoices
    let query = supabase.from('invoices').select('*').eq('user_id', user.id)
    if (from) query = query.gte('invoice_date', from)
    if (to) query = query.lte('invoice_date', to)
    if (invoiceIds?.length) query = query.in('id', invoiceIds)
    query = query.order('invoice_date', { ascending: true })

    const { data: invoices, error } = await query
    if (error) throw error

    const wb = XLSX.utils.book_new()

    if (format === 'tally') {
      // ─── TALLY XML Export ───────────────────────────────────────────────
      const xml = buildTallyXML(invoices || [])
      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="BillKaro-Tally-${Date.now()}.xml"`,
        },
      })
    }

    if (format === 'excel') {
      // ─── SHEET 1: Invoice Summary ──────────────────────────────────────
      const summaryData = (invoices || []).map((inv, i) => ({
        'Sr. No.': i + 1,
        'Invoice No.': inv.invoice_number,
        'Invoice Date': inv.invoice_date,
        'Due Date': inv.due_date || '',
        'Seller Name': inv.seller_name || '',
        'Seller GSTIN': inv.seller_gstin || '',
        'Buyer Name': inv.buyer_name || '',
        'Buyer GSTIN': inv.buyer_gstin || '',
        'Place of Supply': inv.place_of_supply || '',
        'GST Type': inv.gst_type?.toUpperCase() || '',
        'Subtotal (₹)': Number(inv.subtotal) || 0,
        'Total GST (₹)': Number(inv.total_gst) || 0,
        'Grand Total (₹)': Number(inv.grand_total) || 0,
        'Status': inv.status?.toUpperCase() || '',
      }))

      const ws1 = XLSX.utils.json_to_sheet(summaryData)
      // Column widths
      ws1['!cols'] = [
        { wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
        { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 18 },
        { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
      ]
      XLSX.utils.book_append_sheet(wb, ws1, 'Invoice Summary')

      // ─── SHEET 2: Item-wise Detail ─────────────────────────────────────
      const itemRows: object[] = []
      ;(invoices || []).forEach(inv => {
        const items = Array.isArray(inv.items) ? inv.items : []
        items.forEach((item: any) => {
          itemRows.push({
            'Invoice No.': inv.invoice_number,
            'Invoice Date': inv.invoice_date,
            'Buyer Name': inv.buyer_name || '',
            'Buyer GSTIN': inv.buyer_gstin || '',
            'Item Name': item.name || '',
            'HSN/SAC': item.hsn || '',
            'Qty': Number(item.qty) || 0,
            'Rate (₹)': Number(item.rate) || 0,
            'Taxable Amount (₹)': Number(item.taxable) || 0,
            'GST Rate (%)': Number(item.gst_rate) || 0,
            'GST Amount (₹)': Number(item.gst_amount) || 0,
            'Total (₹)': Number(item.total) || 0,
          })
        })
      })

      const ws2 = XLSX.utils.json_to_sheet(itemRows)
      ws2['!cols'] = [
        { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 18 },
        { wch: 24 }, { wch: 10 }, { wch: 8 }, { wch: 12 },
        { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
      ]
      XLSX.utils.book_append_sheet(wb, ws2, 'Item Detail')

      // ─── SHEET 3: GST Summary (GSTR-1 style) ──────────────────────────
      const gstRows = (invoices || []).map(inv => ({
        'Invoice No.': inv.invoice_number,
        'Invoice Date': inv.invoice_date,
        'Buyer GSTIN': inv.buyer_gstin || 'UNREGISTERED',
        'Buyer Name': inv.buyer_name || '',
        'Place of Supply': inv.place_of_supply || '',
        'Invoice Value (₹)': Number(inv.grand_total) || 0,
        'Taxable Value (₹)': Number(inv.subtotal) || 0,
        'IGST (₹)': inv.gst_type === 'igst' ? Number(inv.total_gst) : 0,
        'CGST (₹)': inv.gst_type === 'cgst' ? Number(inv.total_gst) / 2 : 0,
        'SGST (₹)': inv.gst_type === 'cgst' ? Number(inv.total_gst) / 2 : 0,
      }))

      const ws3 = XLSX.utils.json_to_sheet(gstRows)
      ws3['!cols'] = [
        { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 22 },
        { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      ]
      XLSX.utils.book_append_sheet(wb, ws3, 'GST Summary (GSTR-1)')

      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="BillKaro-Export-${Date.now()}.xlsx"`,
        },
      })
    }

    // CSV fallback
    const csvData = (invoices || []).map(inv => [
      inv.invoice_number, inv.invoice_date, inv.buyer_name, inv.buyer_gstin,
      inv.subtotal, inv.total_gst, inv.grand_total, inv.status,
    ].join(','))

    const csv = ['Invoice No,Date,Buyer,Buyer GSTIN,Subtotal,GST,Total,Status', ...csvData].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="invoices-${Date.now()}.csv"`,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

function buildTallyXML(invoices: any[]) {
  const vouchers = invoices.map(inv => {
    const items = Array.isArray(inv.items) ? inv.items : []
    const itemEntries = items.map((item: any) => `
      <ALLINVENTORYENTRIES.LIST>
        <STOCKITEMNAME>${item.name || 'Item'}</STOCKITEMNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <RATE>${item.rate}/${item.qty > 1 ? 'Nos' : 'Nos'}</RATE>
        <AMOUNT>-${item.taxable.toFixed(2)}</AMOUNT>
        <ACTUALQTY>${item.qty} Nos</ACTUALQTY>
        <BILLEDQTY>${item.qty} Nos</BILLEDQTY>
        <ACCOUNTINGALLOCATIONS.LIST>
          <LEDGERNAME>Sales @${item.gst_rate}%</LEDGERNAME>
          <AMOUNT>-${item.taxable.toFixed(2)}</AMOUNT>
        </ACCOUNTINGALLOCATIONS.LIST>
      </ALLINVENTORYENTRIES.LIST>`).join('')

    const gstEntries = inv.gst_type === 'cgst'
      ? `<LEDGERENTRIES.LIST>
          <LEDGERNAME>CGST</LEDGERNAME>
          <AMOUNT>-${(inv.total_gst / 2).toFixed(2)}</AMOUNT>
        </LEDGERENTRIES.LIST>
        <LEDGERENTRIES.LIST>
          <LEDGERNAME>SGST</LEDGERNAME>
          <AMOUNT>-${(inv.total_gst / 2).toFixed(2)}</AMOUNT>
        </LEDGERENTRIES.LIST>`
      : `<LEDGERENTRIES.LIST>
          <LEDGERNAME>IGST</LEDGERNAME>
          <AMOUNT>-${inv.total_gst.toFixed(2)}</AMOUNT>
        </LEDGERENTRIES.LIST>`

    return `
    <VOUCHER REMOTEID="${inv.id}" VCHTYPE="Sales" ACTION="Create">
      <DATE>${inv.invoice_date?.replace(/-/g, '')}</DATE>
      <NARRATION>${inv.notes || ''}</NARRATION>
      <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
      <VOUCHERNUMBER>${inv.invoice_number}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${inv.buyer_name || 'Customer'}</PARTYLEDGERNAME>
      <LEDGERENTRIES.LIST>
        <LEDGERNAME>${inv.buyer_name || 'Sundry Debtors'}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <AMOUNT>${inv.grand_total.toFixed(2)}</AMOUNT>
      </LEDGERENTRIES.LIST>
      ${gstEntries}
      ${itemEntries}
    </VOUCHER>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>BillKaro</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          ${vouchers}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`
}
