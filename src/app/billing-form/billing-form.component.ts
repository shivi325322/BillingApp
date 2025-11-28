import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BasicDetails } from '../shared/models/basicDetail.model';
import { BillingService } from '../shared/services/billing.service';

@Component({
  selector: 'app-billing-form',
  templateUrl: './billing-form.component.html',
  styleUrls: ['./billing-form.component.css'],
  standalone: false,
})
export class BillingFormComponent implements OnInit {
  @ViewChild('form') infoForm: NgForm;

  //Setting default values
  defaultEmail = 'synergycliniclko@gmail.com';
  defaultTreatmentType = '2';
  defaultDiscountedAmount = '0';
  defaultdescription = '';

  //Data to bind a radiobuttons
  Genders = ['Male', 'Female', 'Others'];

  _Payment = ['UPI', 'Cash'];
  //Data to bind a checkboxes
  Services: any;
  serviceCost: number;
  calcCost: number = 0;
  sittings: number = 0;
  additionalServicesList: any;
  // Services:{}[]=this.dataService.AdditionalServices;
  Treatment: any;

  //constructor of this component. Get fired when an instance of this component is created.
  // Injected the BillingService
  // Injected Basic details model
  constructor(
    private dataService: BillingService,
    private router: Router,
  ) { }

  // Toggle for issuing health card (off by default)
  issueHealthCard: boolean = false;

  ngOnInit(): void {
    this.Treatment = this.dataService.TreatmentType;
    this.Services = this.dataService.getServiceList();
    this.additionalServicesList = this.dataService.getAddtionalServicesList();
    console.log(this.Services);
    console.log(this.additionalServicesList);
  }

  onCheckMobileNumber() {
    console.log('onCheckMobileNumberTriggered');
    const mobileNumber = this.infoForm.value.mobile;
    console.log('Checking mobile number:', mobileNumber);
    this.dataService.getPatientByMobile(mobileNumber).then((patient) => {
      if (patient) {
        console.log('Patient found:', patient);
        // Pre-fill the form with patient details
        this.infoForm.setValue({
          name: patient.name || '',
          age: patient.age || '',
          mobile: patient.mobile || '',
          gender: patient.gender || '',
          admissionDate: patient.admissionDate || '',
          billingDate: patient.billingDate || '',
          treatmentType: patient.treatmentType || this.defaultTreatmentType,
          payment: patient.payment || '',
          discount: 10,
          email: patient.email || this.defaultEmail,
          cost: patient.cost || 0,
          issueHealthCard: patient.issueHealthCard || false,
          validity: patient.validity || '',
          treatmentPlan: patient.treatmentPlan || this.defaultdescription
        });
      } else {
        console.log('No patient found with this mobile number.');
      }
    });
  }

  //Gets the value of the form through NgForm type from the template. This is event is triggered when submit button if clicked of the form
  submitForm(form: NgForm) {
    console.log(form);
    console.log('SubmitTriggered');
    // Save to Firestore first. After persistence, keep the in-memory details and navigate to printable page.
    this.dataService
      .saveBillingDetailsToFirestore(form)
      .then((docRef) => {
        console.log('Saved billing doc:', docRef.id);
        this.dataService.setBillingDetails(form);
        this.router.navigate(['/billing-print']);
      })
      .catch((err) => {
        console.error('Error saving billing details:', err);
        // Fallback: still set local details and navigate so user can continue
        this.dataService.setBillingDetails(form);
        this.router.navigate(['/billing-print']);
      });
  }

  onSittingsChange() {
    console.log('onChangeTriggered');
    let filteredData = this.dataService.additionalServiceList
      .filter((s) => s.id === this.infoForm.value.adservices)
      .map((i) => i.serviceCost);
    this.calcCost = this.sittings * Number(filteredData);
  }

  onAddService() {
    console.log('OnAddServiceTrigger');
    let selectedService = this.dataService.additionalServiceList
      .filter((s) => s.id === this.infoForm.value.adservices)
      .map((i) => i.serviceName)
      .toString();
    this.dataService.addServiceList(
      selectedService,
      this.sittings,
      this.calcCost,
    );
    console.log('added service to service list');
    console.log(this.dataService.getServiceList());
  }

  OnRemoveService(index: any) {
    this.dataService.removeFromServiceList(index);
  }

  onReset() {
    console.log('resetform');
    this.infoForm.reset();
    this.router.navigate(['/']);
  }
}
