import { Component, OnInit } from '@angular/core';
import { LayoutsService } from "../layouts.service";
import { Router } from "@angular/router";
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { LanguageService } from 'src/app/core/services/language.service';

@Component({
  selector: 'app-shell-layout',
  templateUrl: './shell-layout.component.html',
  styleUrls: ['./shell-layout.component.scss']
})
export class ShellLayoutComponent implements OnInit {
  isSidebarOpen = false;
  isMarketInnerMenuOpen = false;
  user: any;

  constructor(
    public layoutsService: LayoutsService,
    private router: Router,
    public auth: AuthenticationService,
    private language: LanguageService
  ) { }

  ngOnInit(): void {
    this.user = this.auth.getUser()
    this.manageSideBarOnMobile()
  }

  logout() {
    if (this.auth.logout()) {
      this.router.navigateByUrl("/login");
    }

  }

  changeLanguage(selected_lang: string) {
    this.language.setLangStorage(selected_lang)
    location.reload();
  }

  toggleSidebar() {
    if (!this.layoutsService.sidebarOpen.value) {
      document.documentElement.style.setProperty('--sidebar-width', 250 + 'px');
    } else {
      document.documentElement.style.setProperty('--sidebar-width', 0 + 'px');
    }
    this.layoutsService.sidebarOpen.next(!this.layoutsService.sidebarOpen.value);
  }

  toggleMarketInnerMenu() {
    this.isMarketInnerMenuOpen = !this.isMarketInnerMenuOpen
  }

  closeSidebar() {
    document.documentElement.style.setProperty('--sidebar-width', 0 + 'px');
    this.layoutsService.sidebarOpen.next(!this.layoutsService.sidebarOpen.value);
  }

  manageSideBarOnMobile() {
    // const mediaSmall = window.matchMedia("(max-width: 767px)");
    const mediaSmall = window.matchMedia("(max-width: 886px)");
    if (mediaSmall.matches) {
      document.documentElement.style.setProperty('--sidebar-width', 0 + 'px');
      this.layoutsService.sidebarOpen.next(false);
    }
    mediaSmall.addEventListener("change", (e) => {
      if (e.matches) {
        document.documentElement.style.setProperty('--sidebar-width', 0 + 'px');
        this.layoutsService.sidebarOpen.next(false);
      } else {
        document.documentElement.style.setProperty('--sidebar-width', 250 + 'px');
        this.layoutsService.sidebarOpen.next(true);
      }
    });
  }

}
