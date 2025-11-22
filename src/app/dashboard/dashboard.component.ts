import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService } from '../shared/services/billing.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  bills: any[] = [];

  // totals
  monthlyTotal = 0;
  quarterlyTotal = 0;

  monthlyPatients = 0;
  quarterlyPatients = 0;

  paymentCash = 0;
  paymentUpi = 0;
  cashPct = 0;
  upiPct = 0;
  higherPayment: string = '';

  constructor(private dataService: BillingService, private router: Router) {}

  openBillingList() {
    this.router.navigate(['/billing-list']);
  }

  ngOnInit(): void {
    this.dataService.getAllBillingDetails().subscribe(items => {
      this.bills = items || [];
      // debug: show a sample document so we can verify field names
      if (this.bills.length) console.debug('dashboard - sample billing doc:', this.bills[0]);
      this.computeStats();
    }, err => console.error('Failed to load billing details', err));
  }

  private parseDate(d: any): Date | null {
    if (!d) return null;
    // Firestore Timestamp
    if (d && typeof d.toDate === 'function') return d.toDate();
    // If ISO string or other JS-recognized format
    const iso = new Date(d);
    if (!isNaN(iso.getTime())) return iso;

    // Try dd-mm-yyyy or dd/mm/yyyy
    if (typeof d === 'string') {
      const m = d.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
      if (m) {
        const day = m[1].padStart(2, '0');
        const month = m[2].padStart(2, '0');
        const year = m[3].length === 2 ? '20' + m[3] : m[3];
        const norm = `${year}-${month}-${day}`; // yyyy-mm-dd
        const nd = new Date(norm);
        if (!isNaN(nd.getTime())) return nd;
      }
    }

    return null;
  }

  computeStats(){
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startQuarter = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    let monthlyTotal = 0;
    let quarterlyTotal = 0;
    let monthlyCount = 0;
    let quarterlyCount = 0;
    let cash = 0;
    let upi = 0;

    for (const b of this.bills) {
      const rawDate = b.billingDate || b.billing_date || b.createdAt || b.created_at || b._createdAt || b.date;
      const dt = this.parseDate(rawDate);

      // Robust cost lookup: try several possible fields
      let cost = 0;
      const costKeys = ['cost','amount','total','billingAmount','packageCost','consultationCost','grandTotal','_cost','_amount'];
      for (const k of costKeys) {
        if (b[k] != null) { cost = Number(b[k]) || 0; break; }
      }
      // fallback: sum services if they were stored as array of items
      if (!cost && Array.isArray(b.services) && b.services.length) {
        cost = b.services.reduce((s:any, it:any) => s + (Number(it.cost) || Number(it.amount) || 0), 0);
      }

      if (dt && dt >= startOfMonth && dt <= now) {
        monthlyTotal += cost;
        monthlyCount += 1;
      }
      if (dt && dt >= startQuarter && dt <= now) {
        quarterlyTotal += cost;
        quarterlyCount += 1;
      }

      const pay = (b.payment || b.paymentMethod || b._paymentType || b.mode || '').toString().toLowerCase();
      if (pay.includes('upi')) upi += 1;
      else if (pay.includes('cash')) cash += 1;
    }

    this.monthlyTotal = Math.round(monthlyTotal);
    this.quarterlyTotal = Math.round(quarterlyTotal);
    this.monthlyPatients = monthlyCount;
    this.quarterlyPatients = quarterlyCount;

    this.paymentCash = cash;
    this.paymentUpi = upi;
    const totalPayments = cash + upi;
    if (totalPayments === 0) { this.cashPct = 0; this.upiPct = 0; }
    else { this.cashPct = Math.round((cash / totalPayments) * 100); this.upiPct = Math.round((upi / totalPayments) * 100); }
    if (this.cashPct > this.upiPct) this.higherPayment = 'Cash';
    else if (this.upiPct > this.cashPct) this.higherPayment = 'UPI';
    else this.higherPayment = 'Equal';
  }
}
