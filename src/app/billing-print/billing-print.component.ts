import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import { BillingService } from '../shared/services/billing.service';
import '../../assets/smtp.js';
declare let Email: any;

@Component({
  selector: 'app-billing-print',
  templateUrl: './billing-print.component.html',
  styleUrls: ['./billing-print.component.css'],
  standalone: false,
})
export class BillingPrintComponent implements OnInit {
  @ViewChild('panel') panel: ElementRef;
  basicDetails: any;
  fileName: any;
  constructor(
    private router: Router,
    private dataService: BillingService,
  ) {}

  ngOnInit(): void {
    this.basicDetails = this.dataService.getBillingDetails();
    this.fileName = this.basicDetails._id.split('-');

    console.log(this.fileName);
  }

  generatePdf() {
    let fname = this.fileName[1] + '.pdf';
    const element = document.getElementById('panel-body');
    console.log(this.panel.nativeElement);
    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.html(this.panel.nativeElement, {
      callback: function (pdf) {
        pdf.setFontSize(12);
        pdf.setFont('Noto Sans');
        pdf.save(fname);
      },
    });

    Email.send({
      // Host : 'smtp.elasticemail.com',
      // Username : 'shivi325322@gmail.com',
      // Password : '84DEE532F2C4D9D8B887BB039F05D0C02DA3',
      Host: 'smtp.gmail.com',
      Username: 'synergycliniclko@gmail.com',
      Password: 'uvsxwaxsvtucokju',
      To: this.basicDetails.email,
      From: 'synergycliniclko@gmail.com',
      Subject:
        'Bill payment successful at Synergy Physiotherapy and Sports Injury Rehab Clinic',
      Body:
        '<p>Dear <strong>' +
        this.basicDetails.name +
        ',</strong></p><p>I hope this email finds you well. We wanted to notify you of the services we provided on ' +
        this.basicDetails._DOA +
        ', a patient id is generated i.e <strong>' +
        this.basicDetails._id +
        '</strong>.Please keep it for future reference.</p></br><p>Best Regards,</p></br><p>Synergy Physiotherapy and Sports Injury Rehab Clinic</p>',
      // attachments: [
      //   {
      //     content: pdf,
      //     filename: 'file.pdf',
      //     contentType: 'application/pdf'
      //   }
      // ]
    }).then((message) => {
      (alert('Email Sent'),
        (error) => {
          console.log(error.text);
        });
    });
  }
}
