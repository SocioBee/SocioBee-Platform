import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {

  campaign_tab = ""

  constructor(
    private router: Router
  ) { }

  ngOnInit() {

  }

  clickTab(event: Event, tab: string) {
    event.stopImmediatePropagation();
    let next_path = ""
    // if (tab == "campaigns"){
    //   if (this.campaign_tab == ""){
    //     this.campaign_tab = "volunteering"
    //   }
    //   next_path = "tabs/" + tab + "/" + this.campaign_tab
      
    // }else{
      next_path = "tabs/" + tab
    // }
    this.router.navigate([next_path]);
    console.log("next_path: " + next_path)
  }

}
