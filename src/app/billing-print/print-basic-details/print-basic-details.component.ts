import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BillingService } from 'src/app/shared/services/billing.service';

@Component({
  selector: 'app-print-basic-details',
  templateUrl: './print-basic-details.component.html',
  styleUrls: ['./print-basic-details.component.css']
})
export class PrintBasicDetailsComponent implements OnInit {
  formValues:any;
  uniqueId:string;
  
  constructor(private dataService:BillingService) {
    console.log('printbasicformctor');
   }

  ngOnInit(): void {
    console.log('printbasicforminit');
    this.formValues=this.dataService.getBillingDetails();
    // this.uniqueId = `ID-${Math.floor(Date.now() / 10000)}`;
    console.log(this.formValues);
  }

}
