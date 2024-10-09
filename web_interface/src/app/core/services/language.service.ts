import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const lang_key = 'lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  public current_lang: string = '';
  public version: string = 'V.1.0.13';

  constructor(private translate: TranslateService) { }

  setInitialAppLanguage(){
    // let language = this.translate.getBrowserLang();
    let language = 'en';
    this.translate.setDefaultLang('en');

    let storage_lang = this.getLangStorage();
    if (storage_lang != null){
      this.setLanguage(storage_lang)
    }else{
      this.setLanguage(language);
    }

  }

  setLangStorage(language: string){
    return localStorage.setItem(lang_key, language);
  }

  getLangStorage(){
    return localStorage.getItem(lang_key) || null; 
  }

  setLanguage(lang: string) {
    this.translate.use(lang).subscribe(() => {
      this.current_lang = lang;
      this.setLangStorage(lang);
    });
  }

}