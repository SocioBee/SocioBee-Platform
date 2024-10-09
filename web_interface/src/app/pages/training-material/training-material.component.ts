import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-training-material',
  templateUrl: './training-material.component.html',
  styleUrls: ['./training-material.component.scss']
})
export class TrainingMaterialComponent implements OnInit {

  materials: any = []

  constructor(private apiService: APIService) { }

  async ngOnInit(): Promise<void> {
    this.materials = await this.apiService.getTrainingMaterials().toPromise();
  }

  openMaterial(material: any){
    alert(material.id)
  }

}
