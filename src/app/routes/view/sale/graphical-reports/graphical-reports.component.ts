import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-graphical-reports',
  templateUrl: './graphical-reports.component.html',
  styleUrls: ['./graphical-reports.component.scss']
})
export class GraphicalReportsComponent implements OnInit {
title:string;
subtitle:string;
index: number = 0;
handleChange(e) {
  this.index = e.index;
}
  constructor(private activatedroute:ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data=>{ 
      this.title=data.title;
      this.subtitle=data.subtitle;
    }
     

      )
  }

}
