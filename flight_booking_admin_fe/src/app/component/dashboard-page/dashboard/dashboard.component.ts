import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  single!: any[];
  view: [number, number] = [500, 400];

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

  metrics: any = {};
  bookingTrends: any[] = [];
  revenueGrowth: any[] = [];
  popularDestinations: any[] = [];

  // bookingTrends = [
  //   {
  //     name: 'Bookings',
  //     series: [
  //       { name: 'Jan', value: 400 },
  //       { name: 'Feb', value: 580 },
  //       { name: 'Mar', value: 620 },
  //       { name: 'Apr', value: 810 },
  //       { name: 'May', value: 950 },
  //     ],
  //   },
  // ];

  // revenueGrowth = [
  //   {
  //     name: 'Revenue',
  //     series: [
  //       { name: 'Jan', value: 25000 },
  //       { name: 'Feb', value: 35000 },
  //       { name: 'Mar', value: 42000 },
  //       { name: 'Apr', value: 55000 },
  //       { name: 'May', value: 68000 },
  //     ],
  //   },
  // ];

  // popularDestinations = [
  //   { name: 'New York', value: 8940 },
  //   { name: 'London', value: 7240 },
  //   { name: 'Paris', value: 6200 },
  //   { name: 'Tokyo', value: 5200 },
  //   { name: 'Dubai', value: 4900 },
  // ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getDashboardMetrics().subscribe((data) => {
      this.metrics = data;
      console.log('metrics', this.metrics);
    });

    this.dashboardService.getDashboardBookingTrends().subscribe((data: any) => {
      this.bookingTrends = [
        {
          name: 'Bookings',
          series: data.bookingTrends.map((trend: any) => ({
            name: new Date(trend.month).toLocaleString('default', {
              month: 'short',
            }),
            value: parseInt(trend.count),
          })),
        },
      ];
      this.revenueGrowth = [
        {
          name: 'Revenue',
          series: data.revenueTrends.map((trend: any) => ({
            name: new Date(trend.month).toLocaleString('default', {
              month: 'short',
            }),
            value: parseFloat(trend.revenue),
          })),
        },
      ];

      console.log('bookingTrends', this.bookingTrends);
      console.log('revenueGrowth', this.revenueGrowth);
    });

    this.dashboardService.getDashboardDestination().subscribe((data: any) => {
      this.popularDestinations = data.map((dest: any) => ({
        name: dest.destination,
        value: parseInt(dest.count),
      }));
    });
    console.log('popularDestinations', this.popularDestinations);
  }
}
