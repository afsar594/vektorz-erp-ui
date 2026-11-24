import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-clockdashboard',
  templateUrl: './clockdashboard.component.html',
  styleUrls: ['./clockdashboard.component.scss']
})
export class ClockdashboardComponent implements OnInit {

  hourStyle: any;
  minuteStyle: any;
  secondStyle: any;

  dayName: string;
  monthName: string;
  date: number;
  clockNumbers = [];

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.generateClockNumbers();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  generateClockNumbers() {
    const radiusPercent = 42;
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = 50 + radiusPercent * Math.cos(angle);
      const y = 50 + radiusPercent * Math.sin(angle);
      this.clockNumbers.push({ label: i, left: x, top: y });
    }
  }

  updateTime() {
    const now = new Date();

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = seconds * 6;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;

    this.secondStyle = { transform: `rotate(${secondDeg}deg)` };
    this.minuteStyle = { transform: `rotate(${minuteDeg}deg)` };
    this.hourStyle = { transform: `rotate(${hourDeg}deg)` };

    const currentLang = this.translate.currentLang || 'en-US';
    this.dayName = now.toLocaleString(currentLang, { weekday: 'short' }).toUpperCase();
    this.monthName = now.toLocaleString(currentLang, { month: 'short' }).toUpperCase();
    this.date = now.getDate();
  }
}
