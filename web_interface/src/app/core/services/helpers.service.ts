import { HttpClient } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class HelpersService {

    constructor(private http: HttpClient) { }

    static stringToColour() {
        throw new Error('Method not implemented.');
    }

    markFormGroupDirty(formGroup: FormGroup) {
        (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
            control.markAsDirty();

            if (control.controls) {
                this.markFormGroupDirty(control);
            }
        });
    }

    markFormGroupPristine(formGroup: FormGroup) {
        (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
            control.markAsPristine();

            if (control.controls) {
                this.markFormGroupPristine(control);
            }
        });
    }

    markFormGroupTouched(formGroup: FormGroup) {
        (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
            control.markAsTouched();

            if (control.controls) {
                this.markFormGroupTouched(control);
            }
        });
    }

    isValid(name: string, form: FormGroup): boolean {
        let control = null;
        if (form) {
            control = form.get(name);
        }
        if (control) {
            return control.valid || !control.touched;
        } else {
            return true;
        }
    }

    stringToHexColour(str: String) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }

    getAllStatuses() {
        return this.http.get<any>('/assets/data/campaign_status.json');
    }

    public reverseGeolocation(lat: any, lon: any) {
        return this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?lat=` + lat + `&lon=` + lon + `&format=json`);
    }

    getTimeAhead(h: any, m: any) {
        
        let date = new Date();
        let hours = h + 1;
        let minutes = m;
        date.setTime(date.getTime() + hours * minutes * 60 * 1000);
        return date;
    }

    getUTCtimestamp(date: any, type: any, current_date: any) {
        date.setHours(current_date.getHours())
        date.setMinutes(current_date.getMinutes())
        date.setSeconds(current_date.getSeconds())
        if (type == "start") {
          return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
        } else if (type == "end") {
          return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59);
        } else {
          return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        }
        
      }

      
  convertUTCtoLocalDate(labels: any, current_date: any) {
    for (var i = 0; i < labels.length; i++) {
      let label_date = new Date(labels[i])
      var local_date = new Date(Date.UTC(label_date.getUTCFullYear(), label_date.getUTCMonth(), label_date.getUTCDate(), current_date.getUTCHours(), current_date.getUTCMinutes(), current_date.getUTCSeconds()));
      let year = local_date.getFullYear()
      let month = local_date.getMonth() + 1
      let day = local_date.getDate()
      labels[i] = year + "-" + month + "-" + day
    }
    return labels

  }

}