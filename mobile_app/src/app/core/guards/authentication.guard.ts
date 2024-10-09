import { Injectable } from "@angular/core";
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
    providedIn: "root",
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }
    async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let boolReturn: boolean = false
        if (this.authService.isUserAuthenticated()) {
            boolReturn = true;
        } else {
            this.logoutLocal(state)
        }
        return boolReturn
    }

    logoutLocal(state: any) {
        this.authService.logout();
        this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
    }



    ngOnDestroy() {

    }
}
