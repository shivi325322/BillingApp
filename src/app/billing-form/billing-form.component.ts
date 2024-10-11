import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BasicDetails } from '../shared/models/basicDetail.model';
import { BillingService } from '../shared/services/billing.service';

@Component({
  selector: 'app-billing-form',
  templateUrl: './billing-form.component.html',
  styleUrls: ['./billing-form.component.css']
})
export class BillingFormComponent implements OnInit {
  @ViewChild('form') infoForm:NgForm;

  //Setting default values
  defaultEmail = 'synergycliniclko@gmail.com';
  defaultTreatmentType = '2';
  defaultDiscountedAmount = '0';
 
  //Data to bind a radiobuttons
  Genders=['Male','Female','Others'];

  _Payment=['UPI','Cash'];
  //Data to bind a checkboxes
  Services:any;
  serviceCost:number;
  calcCost:number=0;
  sittings:number=0;
  additionalServicesList:any;
  // Services:{}[]=this.dataService.AdditionalServices;
  Treatment:any;

  //constructor of this component. Get fired when an instance of this component is created.
  // Injected the BillingService 
  // Injected Basic details model
  constructor(private dataService:BillingService,private router:Router) { 
    
  }

  ngOnInit(): void {
    this.Treatment=this.dataService.TreatmentType;
    this.Services=this.dataService.getServiceList();
    this.additionalServicesList=this.dataService.getAddtionalServicesList();
    console.log(this.Services);
    console.log(this.additionalServicesList);
  }

  //Gets the value of the form through NgForm type from the template. This is event is triggered when submit button if clicked of the form
  submitForm(form: NgForm){
    //console.log(form);
    //console.log(this.infoForm);
    //console.log(this.Services);
    //console.log(this.additionalServicesList);
    console.log('onSubmitTriggered');
    this.dataService.setBillingDetails(form);
    this.router.navigate(['/billing-print']);
  }

  onSittingsChange(){
    console.log('onChangeTriggered');
    //console.log('No of Sittings'+this.sittings);
    //console.log(this.infoForm.value.adservices);
    let filteredData=this.dataService.additionalServiceList.filter(s=>s.id===this.infoForm.value.adservices).map(i=> i.serviceCost);
    //console.log(this.dataService.additionalServiceList);
    //console.log('service cost'+ filteredData);
    this.calcCost=this.sittings * Number(filteredData);
    //console.log(this.calcCost);
  }

  onAddService(){
    console.log('OnAddServiceTrigger');
    let selectedService=this.dataService.additionalServiceList.filter(s=>s.id===this.infoForm.value.adservices).map(i=> i.serviceName).toString();
    this.dataService.addServiceList(
      selectedService,
      this.sittings,
      this.calcCost
    )
    console.log('added service to service list');
    console.log(this.dataService.getServiceList());
  }

  OnRemoveService(index:any){
    this.dataService.removeFromServiceList(index);
  }

  onReset(){
    console.log('resetform');
    this.infoForm.reset();
    this.router.navigate(['/']);
  }

}
