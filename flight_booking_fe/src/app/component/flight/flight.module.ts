import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { FlightComponent } from './home/flight.component';
import { FlightRoutingModule } from './flight-routing.module';
import { DetailComponent } from './detail/detail.component';
import { LoadingPageComponent } from '../loading-page/loading-page.component';
import { CardListComponent } from './card-list/card-list.component';
import { CardDetailComponent } from './card-detail/card-detail.component';
import { CardFilterComponent } from './card-filter/card-filter.component';
import { CardDetailLegComponent } from './card-detail-leg/card-detail-leg.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardSearchComponent } from './card-search/card-search.component';
import { DateSliderComponent } from '../common/date-slider/date-slider.component';
import { SliderComponent } from '../common/slider/slider.component';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TimeFormatPipe } from "../../pipe/time-format.pipe";
import { DurationFormatPipe } from "../../pipe/duration-format.pipe";

@NgModule({
  declarations: [
    FlightComponent,
    DetailComponent,
    LoadingPageComponent,
    CardListComponent,
    CardDetailComponent,
  ],

  imports: [
    CommonModule,
    FormsModule,
    FlightRoutingModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    CardFilterComponent,
    CardDetailLegComponent,
    CardSearchComponent,
    DateSliderComponent,
    SliderComponent,
    InfiniteScrollModule,
    TimeFormatPipe,
    DurationFormatPipe
],
})
export class FlightModule {}
