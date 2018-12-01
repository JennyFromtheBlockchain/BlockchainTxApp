import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

interface BlockchainObj {
  blockchainTicker?: string;
  blockNumer?: number;
  transactions?: number;
  timestamp?: BigInteger;
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

  displayedColumns: string[] = ['blockchainTicker', 'blockNumber', 'transactions', 'timestamp'];

  dataSource: BlockchainObjs;

  constructor(private data: DataService) { }

  ngOnInit() {
    this.data.getBlockchain().subscribe(data => {
        let allData : BlockchainObjs = data;
        this.dataSource = allData;
        console.log(this.dataSource);
      }
    );
  }
}