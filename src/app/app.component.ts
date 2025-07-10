import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  NavController,
  Platform,
  ToastController,
  AlertController,
  ActionSheetController,
} from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
// import { PushNotifications } from '@capacitor/push-notifications'; // DISABLED for now

import { ApiService } from './services/api.service';
import { NetworkService } from './services/network.service';
import { AuthService } from './services/auth.service';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  currentVersion = environment.currentVersion;
  isActionSheetOpen = false;
  data: any;

  constructor(
    public storage: Storage,
    private platform: Platform,
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private apiService: ApiService,
    private networkService: NetworkService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      await this.initStorage();
      await this.authService.initializeAuth();

      this.platform.ready().then(async () => {
        await StatusBar.setBackgroundColor({ color: '#d1378c' });
        await StatusBar.setOverlaysWebView({ overlay: true });

        await SplashScreen.hide();
        this.checkCanGoBack();

        // 👇 Safely skip push notification setup
        this.safeInitPushNotification();

        const isAuth = await this.authService.getIsAuthenticatedValue();
        this.router.navigate([isAuth ? '/home' : '/welcome']);

        this.checkForUpdate();
      });
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  }

  async initStorage() {
    await this.storage.create();
  }

  checkCanGoBack() {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        this.isActionSheetOpen = true;
        this.presentBackActionSheet();
      } else {
        window.history.back();
      }
    });
  }

  async presentBackActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Do you want to close the app?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.isActionSheetOpen = false;
            this.exitApp();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
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
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Do you want to logout from the App?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Yes',
          handler: () => {
            this.authService.clearAuthentication();
            this.router.navigate(['/welcome']);
          },
        },
      ],
    });
    await alert.present();
  }

  /**
   * This method is stubbed to prevent crashing due to missing Firebase config.
   * Replace with OneSignal or actual push logic once ready.
   */
  safeInitPushNotification() {
    console.warn(
      '[Push] PushNotifications skipped. Firebase not configured (no google-services.json).'
    );

    // ❗ You can conditionally integrate OneSignal or Pushy SDK here later
  }

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

  checkForUpdate() {
    const platform = this.platform.is('android') ? 'android' : 'ios';

    this.apiService.checkVersion(platform).then(
      (result: any) => {
        this.data = result;
        if (this.data?.result?.code == 1) {
          this.PresentAlertCheck(this.data.result);
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

  // Empty methods for future features
  shareApp() {}
  settings() {}
  myaccount() {}
  home() {}
}
