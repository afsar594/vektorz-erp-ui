import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  ActivatedRoute,
  NavigationEnd,
  CanActivateChild,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Menu } from 'src/app/routes/domain/Administration/menu';
import { UserFile } from 'src/app/routes/domain/UserFile';
import { AppConfigService } from 'src/app/routes/service/configuration.service';
import { LoginService } from 'src/app/routes/service/login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private loginService: LoginService,
    private route: ActivatedRoute // private config: AppConfigService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.loginService.user$.subscribe((data) => {
      // return true;  // to be remove
      if (data != null) {
        // logged in so return true
        var userData = this.loginService.GetCredentialData() as UserFile;

        if (userData) {
          // alert('ok true');
          return true;
        } else {
          // alert('ok false');
          this.router.navigate(['login']);
          return false;
        }

        // return userData ? true :false;
      }
    });
    // not logged in so redirect to login page with the return url and return false
    // this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return true;
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    // this.loginService.user$.subscribe(data => {

    //   return true;
    //   if (data != null) {
    //     this.config.load().then((k: Menu[]) => {
    //       var userData = this.loginService.GetCredentialData() as UserFile

    //       let route = this.route.snapshot;
    //       let data = k.filter((m) => m.privilages?.find(x => x == userData.workGroupId));
    //       var urlList = data.map(c => c.routerLink);
    //       data.forEach((v, i, arry) => {
    //         if (v.items != null && v.items?.length > 0) {
    //           if (v.items.filter(v => v.privilages != null && v.privilages.length > 0)) {
    //             const data = v.items.filter(n => n.privilages?.find(m => m == userData.workGroupId));
    //             if (data?.length > 0) {
    //               arry[i].items = data;
    //               urlList.push(...(arry[i].items).map(x => x.routerLink))
    //               arry[i].items.forEach((cv, ci, carrry) => {
    //                 if (cv?.items != null && cv.items?.length > 0) {
    //                   if (cv.items.filter(v => v.privilages != null && v.privilages.length > 0)) {
    //                     const data2 = cv.items.filter(n => n.privilages?.find(m => m == userData.workGroupId));
    //                     if (data2?.length > 0) {
    //                       carrry[ci].items = data2;
    //                       urlList.push(...(carrry[ci].items).map(x => x.routerLink))
    //                     }
    //                   }
    //                 }
    //               });
    //             }
    //           }
    //         }
    //       });
    //       var urlListarry = flatten(urlList);

    //       urlListarry.push('/');
    //       if (urlListarry.some(k => (k != undefined || null) && ((k.toLocaleLowerCase()).trim()).indexOf(((state.url).toLocaleLowerCase()).trim()) > -1)) {
    //         return true;
    //       } else {
    //         this.router.navigate(['']);
    //         return false;
    //       }

    //     });
    //   }

    // });

    return true;
  }
}
function flatten(arr) {
  return [].concat(...arr);
}
function getResolvedUrl(route: ActivatedRouteSnapshot): string {
  return route.pathFromRoot
    .map((v) => v.url.map((segment) => segment.toString()).join('/'))
    .join('/');
}

function getConfiguredUrl(route: ActivatedRouteSnapshot): string {
  return (
    '/' +
    route.pathFromRoot
      .filter((v) => v.routeConfig)
      .map((v) => v.routeConfig!.path)
      .join('/')
  );
}
