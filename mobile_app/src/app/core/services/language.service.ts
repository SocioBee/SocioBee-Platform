import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { Language } from '../models/Language';

const lang_key = 'lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  public current_lang: string = '';
  public version: string = 'V.1.0.13';

  constructor(private translate: TranslateService, private storage: Storage) { }

  setInitialAppLanguage() {
    let language = 'en';
    this.translate.setDefaultLang('en');
    let storage_lang = this.getLangStorage();
    if (storage_lang != null) {
      this.setLanguage(storage_lang)
    } else {
      this.setLanguage(language);
    }
  }

  setLangStorage(language: string) {
    return localStorage.setItem(lang_key, language);
  }

  getLangStorage() {
    return localStorage.getItem(lang_key) || null;
  }

  setLanguage(lang: string) {
    this.translate.use(lang).subscribe(() => {
      this.current_lang = lang;
      this.setLangStorage(lang);
    });
  }

  getLanguagesTag(key: any) {
    if (key == "gr") {
      return "greek"
    } else if (key == "en") {
      return "english"
    }
  }

  getAvailableLangs() {
    return [{
      name: "English",
      value: "en"
    },
    {
      name: "Ελληνικά",
      value: "gr"
    },
    {
      name: "Español",
      value: "es"
    },
    {
      name: "Italiano",
      value: "it"
    }]
  }
}