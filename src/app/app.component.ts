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
import { StatusBar, StatusBarStyle } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage';
import { environment } from '../environments/environment';
import { ApiService } from './services/api.service';
import { NetworkService } from './services/network.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  currentVersion = environment.currentVersion;
  isActionSheetOpen = false;
  private networkListener: any;

  constructor(
    private storage: Storage,
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
      await this.initializeApp();
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Webview error:', event.reason);
      });
    } catch (error) {
      console.error('Bootstrap failed:', error);
      this.showFatalError();
    }
  }

  private async initializeApp() {
    console.log('Initializing app...');
    await this.storage.create();
    console.log('Storage initialized');
    await this.platform.ready();
    console.log('Platform ready');
    await this.configureUI();
    await this.authService.initializeAuth();
    console.log('Auth initialized');
    this.setupNetworkListener();
    this.safeCheckForUpdate();
    await this.navigateBasedOnAuth();
  }

  private async configureUI() {
    try {
      await StatusBar.setBackgroundColor({ color: '#d1378c' });
      await StatusBar.setStyle({ style: StatusBarStyle.Light });
      await StatusBar.setOverlaysWebView({ overlay: true });
      await SplashScreen.hide()
        .then(() => console.log('Splash screen hidden'))
        .catch(err => console.error('Splash screen hide error:', err));
    } catch (error) {
      console.warn('UI configuration failed:', error);
    }
  }

  private setupBackButtonHandler() {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      console.log('Back button pressed, canGoBack:', canGoBack);
      if (!canGoBack && !this.isActionSheetOpen) {
        this.presentExitConfirmation();
      } else {
        window.history.back();
      }
    });
  }

  private async presentExitConfirmation() {
    this.isActionSheetOpen = true;
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Exit App?',
      buttons: [
        {
          text: 'Exit',
          icon: 'power',
          handler: () => {
            console.log('Exiting app');
            CapacitorApp.exitApp();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.isActionSheetOpen = false;
            console.log('Exit cancelled');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  private setupNetworkListener() {
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed:', status);
      if (!status.connected) {
        this.toast('You are offline. Some features may not work.');
      }
    });
  }

  private async navigateBasedOnAuth() {
    try {
      const isAuth = await this.authService.getIsAuthenticatedValue();
      const initialRoute = isAuth ? '/home' : '/welcome';
      console.log('Navigating to:', initialRoute);
      await this.router.navigate([initialRoute], { replaceUrl: true });
    } catch (error) {
      console.error('Navigation failed:', error);
      this.router.navigate(['/welcome'], { replaceUrl: true });
    }
  }

  private async safeCheckForUpdate() {
    try {
      if (!environment.production) return;
      const platform = this.platform.is('android') ? 'android' : 'ios';
      const response = await this.apiService.checkVersion(platform) as any;
      if (response?.result?.code === 1) {
        await this.handleUpdateResponse(response.result);
      }
    } catch (error) {
      console.warn('Version check failed:', error);
    }
  }

  private async handleUpdateResponse(updateData: any) {
    const alert = await this.alertCtrl.create({
      header: updateData.title || 'Update Available',
      message: updateData.message || 'A new version is available.',
      buttons: updateData.force ? ['Update Now'] : ['Later', 'Update Now'],
    });

    await alert.present();

    if (updateData.force) {
      alert.onDidDismiss().then(() => {
        console.log('Opening update URL:', updateData.url);
        window.open(updateData.url, '_system');
        CapacitorApp.exitApp();
      });
    }
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to sign out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Logout',
          handler: async () => {
            console.log('Logging out');
            await this.authService.clearAuthentication();
            this.router.navigate(['/welcome'], { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }

  private showFatalError() {
    this.alertCtrl.create({
      header: 'App Error',
      message: 'A critical error occurred. Please restart the app.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Exit',
          handler: () => {
            console.log('Exiting due to fatal error');
            CapacitorApp.exitApp();
          },
        },
      ],
    }).then((alert) => alert.present());
  }

  async toast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  ngOnDestroy() {
    console.log('Removing network listener');
    this.networkListener?.remove();
  }
}