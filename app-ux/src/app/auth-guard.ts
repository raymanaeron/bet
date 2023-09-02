import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AppConstants } from "src/environments/app-constants";
import { AuthService } from "./auth-service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): any {
        //this.authService.isAuthenticated();
        var loggedin = false;
        if (AppConstants.userProfile != null) { 
            loggedin = true; 
        }
        return loggedin;
    }
}