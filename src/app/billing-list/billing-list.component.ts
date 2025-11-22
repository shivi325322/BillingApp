import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../shared/services/billing.service';

@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing-list.component.html',
  styleUrls: ['./billing-list.component.css'],
})
export class BillingListComponent implements OnInit {
  billings: any[] = [];
  filtered: any[] = [];
  searchTerm = '';
  editing: { [id: string]: boolean } = {};
  editedData: { [id: string]: any } = {};

  constructor(private dataService: BillingService) {}

  ngOnInit(): void {
    // subscribe to the observable and normalize incoming docs
    this.dataService.getAllBillingDetails().subscribe(
      (items) => {
        this.billings = items.map((i) => this.normalizeItem(i));
        this.applyFilter();
      },
      (err) => console.error('Failed to load billing details', err),
    );
  }

  normalizeItem(i: any) {
    // make sure common keys exist so template can bind consistently
    return {
      id: i.id,
      name: i.name || i._name || i['name'] || '',
      age: i.age || i._age || i['age'] || '',
      mobile: i.mobile || i._mobile || i['mobile'] || '',
      gender: i.gender || i._gender || i['gender'] || '',
      admissionDate: i.admissionDate || i._DOA || i['admissionDate'] || '',
      billingDate: i.billingDate || i._DOB || i['billingDate'] || '',
      treatmentType:
        i.treatmentType || i._treatmentType || i['treatmentType'] || '',
      payment: i.payment || i._paymentType || i['payment'] || '',
      discount: i.discount || i._discount || i['discount'] || 0,
      cost: i.cost || i._cost || i['cost'] || 0,
      services: i.services || [],
      createdAt: i.createdAt || i._createdAt || '',
    };
  }

  applyFilter() {
    const term = this.searchTerm?.toLowerCase().trim();
    if (!term) {
      this.filtered = [...this.billings];
      return;
    }
    this.filtered = this.billings.filter((b) => {
      return (
        b.id?.toLowerCase().includes(term) ||
        b.name?.toLowerCase().includes(term) ||
        String(b.mobile || '')
          .toLowerCase()
          .includes(term) ||
        String(b.treatmentType || '')
          .toLowerCase()
          .includes(term) ||
        String(b.payment || '')
          .toLowerCase()
          .includes(term)
      );
    });
  }

  startEdit(item: any) {
    this.editing[item.id] = true;
    // shallow copy editable fields
    this.editedData[item.id] = { ...item };
  }

  cancelEdit(id: string) {
    this.editing[id] = false;
    delete this.editedData[id];
  }

  saveEdit(id: string) {
    const data = { ...this.editedData[id] };
    // remove id if present
    delete data.id;
    this.dataService
      .updateBillingDetail(id, data)
      .then(() => {
        this.editing[id] = false;
        delete this.editedData[id];
      })
      .catch((err) => console.error('Update failed', err));
  }

  deleteItem(id: string) {
    if (!confirm('Delete this billing record?')) return;
    this.dataService
      .deleteBillingDetail(id)
      .then(() => console.log('Deleted', id))
      .catch((err) => console.error('Delete failed', err));
  }
}
