import { Injectable } from "@angular/core";
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthenticationService } from "../services/authentication.service";

@Injectable({
    providedIn: "root",
})
export class RoleGuard implements CanActivate {
    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {

        const user = this.authService.getUser();
        if (user["role"] == "monitor"){
            return false;
        }else{
            return true;
        }
    }
}
