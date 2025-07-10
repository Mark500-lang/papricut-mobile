import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Promise<boolean> | boolean {
    return this.authService.getIsAuthenticatedValue().then(isAuth => {
      console.log('[AuthGuard] CanActivate result:', isAuth);
      if (!isAuth) {
        this.router.navigate(['/welcome']);
        return false;
      }
      return true;
    });
  }


}
