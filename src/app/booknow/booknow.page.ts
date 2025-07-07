import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController, PopoverController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { OtherService } from '../services/other.service';
import { NetworkService } from '../services/network.service';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
//import { phoneNumbers } from '../../assets/data/phone-numbers';

@Component({
  selector: 'app-booknow',
  templateUrl: './booknow.page.html',
  styleUrls: ['./booknow.page.scss'],
})
export class BooknowPage implements OnInit {

  apiLoader:boolean = false;
  data:any;

  currentStep: number = 1;

  services = [
    { label: 'Photography', selected: false },
    { label: 'Videography', selected: false },
    { label: 'Video Editing Only', selected: false },
    { label: 'Live Streaming', selected: false },
    { label: 'Influencer Collaboration', selected: false }
  ];
  selectedservices: string[] = [];

  countries:any[] = [];
  cities:any[] = [];

  PostData = {
    country:'',
    city:'',
    start_date:'',
    details:'',
    first_name:'',
    email:'',
    phone_number:'',
    company:''
  };

  hasClick:any = false;

  minDate: string;

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private alertCtrl:AlertController,
    private router: Router,
    private apiService: ApiService,
    public otherService : OtherService,
    private networkService: NetworkService,
    private popoverController: PopoverController
  ) {
    this.otherService.statusBar("#d1378c",1);

    const today = new Date();
    // Create a new date instance for tomorrow
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Convert to ISO string format required by ion-datetime
    this.minDate = tomorrow.toISOString();
    // Set the default date to tomorrow as well
    //this.PostData.start_date = tomorrow.toISOString();
    this.PostData.start_date = formatDate(this.minDate, 'yyyy-MM-dd', 'en-US');

  }

  ngOnInit() {
    this.getCountries();
  }

  updateCrewCoreServiceSelection(option: any) {
  if (option.selected) {
    // Add to the array when selected
    this.selectedservices.push(option.label);
    //console.log('Selected selectedservices:', this.selectedservices);
  } else {
    // Remove from the array when deselected
    const index = this.selectedservices.indexOf(option.label);
    if (index !== -1) {
      this.selectedservices.splice(index, 1);
      //console.log('Selected selectedservices:', this.selectedservices);
    }
  }
}

  handlestart_dateChange(event: any) {
      this.PostData.start_date = formatDate(event.detail.value, 'yyyy-MM-dd', 'en-US');
      //console.log('Selected start_date:', this.PostData.start_date);
      // Dismiss the popover
      this.popoverController.dismiss();
  }

  popoverDismissed() {
        // Optional: Handle any logic when the popover is dismissed
  }

  openTab(currentStep:any) {
    this.currentStep = currentStep;
  }

  // Function to navigate to the next step
  goToNextStep() {
    if (this.currentStep === 1) {
      if (this.selectedservices.length === 0) {
        this.toast('Please select the core service(s) that you need.');
      } else if (this.PostData.country === "") {
        this.toast('Please select your country.');
      } else if (this.PostData.start_date === "") {
        this.toast('Please select the project date.');
      } else {
        // Convert the selected date and today's date to local dates at midnight.
        const selectedDate = new Date(this.PostData.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Validate: selected date must be greater than today.
        if (selectedDate.getTime() <= today.getTime()) {
          this.toast('Please select a date later than today.');
        } else {
          this.currentStep++;
        }
      }
    }
  }

  // Function to navigate to the previous step
  goToPreviousStep() {
    this.currentStep--;
  }

  // Function to submit the registration form
  ActionSubmit() {

  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if(navigator.onLine !== true || this.networkService.checkInternetConnection() == 0) {
      this.presentAlert('No Internet Connection!',"Please put Internet Connection ON and try again");
    }
    else if (this.PostData.start_date === "") {
    this.presentAlert('',"Please select date");
  }
    else if (this.PostData.email === "") {
    this.presentAlert('',"Please enter your email address");
  }
  else if(!re.test(this.PostData.email)) {
    this.presentAlert('',"Invalid email address");
  }
  else if (this.PostData.first_name === "") {
    this.presentAlert('',"Please enter your name");
  }
  else if (this.PostData.phone_number === "") {
    this.presentAlert('',"Please enter your mobile number");
  }
  // else if (this.PostData.company === "") {
  //   this.presentAlert('',"Please enter your company name");
  // }
  // else if (this.PostData.company_designation === "") {
  //   this.presentAlert('',"Please enter your designation in your company");
  // }
  else {

    this.hasClick = true;

    this.apiService.bookNow(
      this.PostData,
      this.selectedservices
    ).then((result:any) => {
    this.hasClick = false;
    this.data = result;

    let code = this.data.code;
    let message = this.data.message;

    if(code == 1) {
      this.deleteAll();
      this.navCtrl.back();
      //this.presentAlertWithDismiss("",message);
    }

    this.presentAlert("",message);

  }, (err:any) => {
    this.hasClick = false;
    this.presentAlert("",err.error.message);
  });

  }

  }

  deleteAll() {

    this.selectedservices = [];

    this.PostData = {
      country:'',
      city:'',
      start_date:'',
      details:'',
      first_name:'',
      email:'',
      phone_number:'',
      company:''
    };

  }

openSignin() {
  //this.router.navigate(['/signin']);
  this.apiService.openLink('https://papricut.com/login');
}

 countryEvent(event: CustomEvent) {
   this.getCities(event.detail.value);
 }

 getCountries(){
   if(navigator.onLine !== true || this.networkService.checkInternetConnection() == 0) {
       this.presentAlert('No Internet Connection!',"Please put Internet Connection ON and try again");
     } else {
 this.apiService.loadCountries()
 .then(result => {
   this.data = result;
   this.countries = this.data.result;
 });
}
 }

 getCities(country:any){
 this.apiLoader = true;
 this.apiService.loadCities(country)
 .then(result => {
   this.apiLoader = false;
   this.data = result;
   this.cities = this.data.result;
 });
 }

  adjustTextarea(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

async presentAlertWithDismiss(alerttitle: any, alertcontent: any) {
  const alert = await this.alertCtrl.create({
    header: alerttitle,
    message: alertcontent,
    backdropDismiss: false, // Prevent dismissing by tapping on backdrop
    buttons: [
      {
        text: 'Login',
        handler: () => {
          // Add any dismissal logic here if needed
          this.openSignin();
        }
      }
    ]
  });
  await alert.present();
}

async presentAlert(header:any,message:any) {
  const alert = await this.alertCtrl.create({
    header: header,
    message: message,
    buttons: ['OK']
  });
  await alert.present();
}

async toast(txt:any) {
const toast = await this.toastController.create({
  message: txt,
  duration: 2000,
  position : 'bottom',
  mode : 'ios',
  color : 'dark'
});
toast.present();
}

}
