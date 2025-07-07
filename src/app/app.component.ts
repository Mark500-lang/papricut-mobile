import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  NavController,
  Platform,
  ToastController,
  AlertController,
  ActionSheetController,
} from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@capacitor/status-bar';
import { ApiService } from './services/api.service';
import { NetworkService } from './services/network.service';
import { AuthService } from './services/auth.service';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { App as CapacitorApp } from '@capacitor/app';
import { PushNotifications, Token, PushNotification, PushNotificationActionPerformed } from '@capacitor/push-notifications'; 
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  currentVersion = environment.currentVersion;

  isActionSheetOpen: boolean = false;

  first_name: any;
  last_name: any;
  image_url: any;

  data: any; // ✅ FIX for all the `this.data` errors

  constructor(
    public storage: Storage,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private location: Location,
    private apiService: ApiService,
    private networkService: NetworkService,
    private authService: AuthService
  ) {
    this.initStorage();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.setBackgroundColor({ color: '#d1378c' });
      StatusBar.setOverlaysWebView({ overlay: true });

      this.splashScreen.hide();
      this.checkCanGoBack();

      if (this.platform.is('cordova')) {
        this.initPushNotification(); // ✅ ENABLE push logic
      }

      if (this.authService.isAuthenticated()) {
        console.log('isAuthenticated getDashboard');
        this.router.navigate(['/home']);
      } else {
        console.log('isAuthenticated welcome');
        this.router.navigate(['/welcome']);
      }

      this.checkForUpdate();
    });
  }

  async initStorage() {
    await this.storage.create();
  }

  checkCanGoBack() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.isActionSheetOpen) return;

      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          this.isActionSheetOpen = true;
          this.presentBackActionSheet();
        } else {
          window.history.back();
        }
      });
    });
  }

  async presentBackActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Do you want to close the app?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            console.log('User clicked Yes');
            this.isActionSheetOpen = false;
            this.exitApp();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('User clicked Cancel');
            this.isActionSheetOpen = false;
          },
        },
      ],
    });

    await actionSheet.present();
  }

  exitApp() {
    CapacitorApp.exitApp();
  }

  async logout() {
    let alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Do you want to logout from the App?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('User clicked Yes');
            // this.logoutNow(); // implement this if needed
          },
        },
      ],
    });
    await alert.present();
  }

  // ✅ Push Notification Logic
initPushNotification() {
  PushNotifications.requestPermissions().then(result => {
    if (result.receive === 'granted') {
      // Register with Apple / Google to receive push
      PushNotifications.register();
    } else {
      this.toast('Push Notification permission denied.');
    }
  });

  // On successful registration, send the token to the server
  PushNotifications.addListener('registration', (token: Token) => {
    console.log('Push registration success, token: ', token.value);
    this.SendTokenToServer(token.value);
  });

  // On registration error
  PushNotifications.addListener('registrationError', (error: any) => {
    console.error('Error on registration: ', JSON.stringify(error));
    this.toast('Push registration error.');
  });

  // On receiving push notification while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
    console.log('Push received: ', notification);
    this.presentAlertForeGround({
      title: notification.title,
      body: notification.body
    });
  });

  // When the user taps on a notification
  PushNotifications.addListener('pushNotificationActionPerformed', (action: PushNotificationActionPerformed) => {
    console.log('Notification action performed', action.notification);
    // You could navigate or trigger logic here
  });
}

  // ✅ Moved here from previous logic
  SendTokenToServer(fcmToken: any) {
    this.apiService.SendTokenToServer(fcmToken).then(
      (result: any) => {
        this.data = result;
      },
      (err: any) => {
        this.toast('Error sending FCM token.');
      }
    );
  }

  // ✅ FIX: pass required platform argument
  checkForUpdate() {
    const platform = this.platform.is('android') ? 'android' : 'ios';

    this.apiService.checkVersion(platform).then(
      (result: any) => {
        this.data = result;

        if ((this.data as any)?.result?.code == 1) {
          if ('result' in this.data) {
            this.PresentAlertCheck(this.data?.result);
          }
        }
      },
      (err: any) => {
        this.toast('Version check failed.');
      }
    );
  }

  async PresentAlertCheck(data: any) {
    const alert = await this.alertCtrl.create({
      header: data.title,
      message: data.message,
      buttons: ['Ok'],
    });
    await alert.present();

    if (data.force === true) {
      alert.onDidDismiss().then(() => {
        window.open(data.url, '_system');
      });
    }
  }

  async presentAlertForeGround(data: any) {
  const alert = await this.alertCtrl.create({
    header: data.title || 'Notification',
    message: data.body || 'You have a new message.',
    buttons: ['Ok'],
  });
  await alert.present();
}

  async toast(txt: any) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position: 'bottom',
      mode: 'ios',
      color: 'dark',
    });

    toast.present();
  }

  // Placeholders (optional to implement)
  shareApp() {}
  settings() {}
  myaccount() {}
  home() {}
}
