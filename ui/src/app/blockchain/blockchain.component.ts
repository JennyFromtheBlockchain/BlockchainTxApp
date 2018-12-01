import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable} from 'rxjs';

// @Component({
//   selector: 'blockchain',
//   templateUrl: './blockchain.component.html',
//   styleUrls: ['./blockchain.component.scss']
// })
// export class BlockchainComponent implements OnInit {

//   dataSource: Object;

//   constructor(private data: DataService) { }

//   ngOnInit() {
//     this.data.getBlockchain().subscribe(data => {
//         this.dataSource = data
//         console.log(this.dataSource);
//       }
//     );
//   }
// }

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

var ELEMENT_DATA: PeriodicElement[];

/**
 * @title Basic CDK data-table
 */
@Component({
  selector: 'blockchain',
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.scss']
})
// @Component({
//   selector: 'cdk-table-basic-example',
//   styleUrls: ['cdk-table-basic-example.css'],
//   templateUrl: 'cdk-table-basic-example.html',
// })
export class BlockchainComponent implements OnInit {

  dataSource: Object;

  constructor(private data: DataService) { }

  ngOnInit() {
    this.data.getBlockchain().subscribe(data => {
        //this.dataSource = data
        //console.log(this.dataSource);
        ELEMENT_DATA = [data[1], data[2]];
        this.dataSource = new ExampleDataSource();
        console.log(this.dataSource);
        console.log(ELEMENT_DATA);
        console.log(data);
      }
    );
  }

  //displayedColumns: string[] = ['position'];
  displayedColumns: string[] = ['blockchainTicker', 'blockNumber', 'transactions', 'timestamp'];
  // dataSource = new ExampleDataSource();
}

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class ExampleDataSource extends DataSource<PeriodicElement> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject<PeriodicElement[]>(ELEMENT_DATA);

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<PeriodicElement[]> {
    return this.data;
  }

  disconnect() {}
}
