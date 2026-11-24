import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss']
})
export class CircleProgressComponent implements OnInit {
  @Input() value = 0; // Input value for the progress (0 to 100)
  @Input() strokeColor = '#4caf50'; // Input value for the stroke color
  circumference = 2 * Math.PI * 40; // Circumference of the circle

  constructor() { }

  ngOnInit(): void {
  }
  get offset(): number {
    const progress = this.value / 100;
    return this.circumference * (1 - progress);
  }

}
