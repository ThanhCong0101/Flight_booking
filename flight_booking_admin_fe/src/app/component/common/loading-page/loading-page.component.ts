import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-page.component.html',
  styleUrls: ['./loading-page.component.css']
})
export class LoadingPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
