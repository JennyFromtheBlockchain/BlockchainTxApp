import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

interface BlockchainObj {
  blockchainTicker?: string;
  totalTransactions?: number;
}
interface BlockchainObjs {
  blockchains?: Object[];
}
@Component({
  selector: 'blockchain',
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.scss']
})
export class BlockchainComponent implements OnInit {

  displayedColumns: string[] = ['blockchainTicker', 'totalTransactions'];

  dataSource: BlockchainObjs;

  constructor(private data: DataService) { }
  ngOnInit() {
    this.data.getAll().subscribe(data => {
      console.log(data);
        let allData : BlockchainObjs = data;
        this.dataSource = allData;
        console.log(this.dataSource);
      }
    );
  }
}