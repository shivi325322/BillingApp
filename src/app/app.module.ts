import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { BillingFormComponent } from './billing-form/billing-form.component';
import { BillingService } from './shared/services/billing.service';
import { BillingPrintComponent } from './billing-print/billing-print.component';
import { PrintHeaderComponent } from './billing-print/print-header/print-header.component';
import { PrintBasicDetailsComponent } from './billing-print/print-basic-details/print-basic-details.component';
import { RouterModule, Routes } from '@angular/router';
import { BillingMessageComponent } from './billing-message/billing-message.component';
import { PrintInvoiceComponent } from './billing-print/print-invoice/print-invoice.component';
import { BillingListComponent } from './billing-list/billing-list.component';

const appRoutes: Routes = [
  { path: '', component: BillingMessageComponent }, //empty path
  { path: 'billing-print', component: BillingPrintComponent }, //path:localhost:4200/billing-print
  { path: 'billing-list', component: BillingListComponent },
  { path: 'home', component: BillingFormComponent }, //path:localhost:4200/billing-print
];

@NgModule({
  declarations: [
    AppComponent,
    BillingFormComponent,
    BillingPrintComponent,
    PrintHeaderComponent,
    PrintBasicDetailsComponent,
    BillingMessageComponent,
    PrintInvoiceComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    BillingListComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
