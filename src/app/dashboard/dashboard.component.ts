import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService } from '../shared/services/billing.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  bills: any[] = [];
  selectedBilling: any = null;
  private _subs: Subscription[] = [];

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
    const s1 = this.dataService.getAllBillingDetails().subscribe(items => {
      this.bills = items || [];
      // debug: show a sample document so we can verify field names
      if (this.bills.length) console.debug('dashboard - sample billing doc:', this.bills[0]);
      this.computeStats();
    }, err => console.error('Failed to load billing details', err));

    const s2 = this.dataService.selectedBilling$.subscribe(sb => {
      this.selectedBilling = sb;
      console.log('selected billing changes:',sb);
    });
    this._subs.push(s1 as Subscription, s2 as Subscription);
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s && s.unsubscribe && s.unsubscribe());
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
    const quarters = [
      { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 2, 31) },   // Q1
      { start: new Date(now.getFullYear(), 3, 1), end: new Date(now.getFullYear(), 5, 30) },   // Q2
      { start: new Date(now.getFullYear(), 6, 1), end: new Date(now.getFullYear(), 8, 30) },   // Q3
      { start: new Date(now.getFullYear(), 9, 1), end: new Date(now.getFullYear(), 11, 31) }   // Q4
    ];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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

      if (dt && dt >= startOfMonth && dt <= endOfMonth) {
        monthlyTotal += cost;
        monthlyCount += 1;
      }
      const currentQuarter = quarters.find(q => now >= q.start && now <= q.end);
      if (dt && currentQuarter && dt >= currentQuarter.start && dt <= currentQuarter.end) {
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

  downloadHealthCard() {
    const element = document.getElementById('healthCardSection');
    console.log('healthcar:',element)
    if (!element) {
      console.error('Health card section not found!');
      return;
    }
    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.html(element, {
      callback: function (pdf) {
        pdf.setFontSize(12);
        pdf.setFont('Noto Sans');
        const fileName = 'Health_Card_' + (new Date()).toISOString().split('T')[0] + '.pdf';
        pdf.save(fileName);
      },
    });
  }
}