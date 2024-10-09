import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class AppToastService {
    constructor(
        private translationService: TranslateService,
        private toastr: ToastrService
    ) { }

    errorMessage(message: string) {
        this.toastr.error(this.translationService.instant(message), '');
    }

    infoMessage(message: string) {
        this.toastr.info(this.translationService.instant(message), '');
    }
    
    successMessage(message: string) {
        this.toastr.success(this.translationService.instant(message), '');
    }
    
    warningMessage(message: string) {
        this.toastr.warning(this.translationService.instant(message), '');
    }
}