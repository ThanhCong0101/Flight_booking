import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log('role guard');
    return this.authService.isAuthenticated().pipe(
      switchMap((isAuth) => {
        return this.authService.getDataFromAccessToken().pipe(
          map((data) => {
            console.log(data);
            const expectedRole = route.data['expectedRole'];

            if (!isAuth || data.role !== expectedRole) {
              this.router.navigate(['/login']);
              return false;
            }
            return true;
          })
        );
      })
    );
  }
}
