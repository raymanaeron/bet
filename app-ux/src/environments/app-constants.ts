import { Input, Output, EventEmitter } from '@angular/core';
// import { SocialUser } from "angularx-social-login"

export class AppConstants {

    // Fires from process-signin compoenent when login completes 
    public static loginCompleted: EventEmitter<boolean> = new EventEmitter<boolean>();
    public static checkoutReviewCompleted: EventEmitter<string> = new EventEmitter<string>();
    public static checkoutCompleted: EventEmitter<any> = new EventEmitter<any>();
    public static accountBalanceChanged: EventEmitter<any> = new EventEmitter<any>();

    public static accessToken: any;
    public static userName: string;
    public static userProfile: any;

    public static amazonPayMerchantId: string = 'A1KQ03NPYR1WG7';
    public static amazonPayPublicKeyId: string = 'SANDBOX-AGKAIRVR4OMHS6ITOILGQUSW';
}