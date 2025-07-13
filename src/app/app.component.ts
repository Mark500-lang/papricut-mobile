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
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';

// Services
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
    } catch (error) {
      console.error('Bootstrap failed:', error);
      this.showFatalError();
    }
  }

  private async initializeApp() {
    // 1. Initialize storage first
    await this.storage.create();

    // 2. Wait for platform readiness
    await this.platform.ready();

    // 3. Configure UI
    await this.configureUI();

    // 4. Initialize auth state
    await this.authService.initializeAuth();

    // 5. Setup network monitoring
    this.setupNetworkListener();

    // 6. Check for updates
    this.safeCheckForUpdate();

    // 7. Navigate based on auth state
    this.navigateBasedOnAuth();
  }

  private async configureUI() {
    try {
      await StatusBar.setBackgroundColor({ color: '#d1378c' });
      await StatusBar.setOverlaysWebView({ overlay: true });
      await SplashScreen.hide();
      this.setupBackButtonHandler();
    } catch (error) {
      console.warn('UI configuration failed:', error);
    }
  }

  private setupBackButtonHandler() {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
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
          handler: () => CapacitorApp.exitApp()
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => this.isActionSheetOpen = false
        }
      ]
    });
    await actionSheet.present();
  }

  private setupNetworkListener() {
    this.networkListener = Network.addListener('networkStatusChange', status => {
      if (!status.connected) {
        this.toast('You are offline. Some features may not work.');
      }
    });
  }

  private async navigateBasedOnAuth() {
    try {
      const isAuth = await this.authService.getIsAuthenticatedValue();
      const initialRoute = isAuth ? '/home' : '/welcome';
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
      buttons: updateData.force ? ['Update Now'] : ['Later', 'Update Now']
    });

    await alert.present();

    if (updateData.force) {
      alert.onDidDismiss().then(() => {
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
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: async () => {
            await this.authService.clearAuthentication();
            this.router.navigate(['/welcome'], { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }

  private showFatalError() {
    this.alertCtrl.create({
      header: 'App Error',
      message: 'A critical error occurred. Please restart the app.',
      backdropDismiss: false,
      buttons: [{
        text: 'Exit',
        handler: () => CapacitorApp.exitApp()
      }]
    }).then(alert => alert.present());
  }

  async toast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }

  ngOnDestroy() {
    this.networkListener?.remove();
  }
}