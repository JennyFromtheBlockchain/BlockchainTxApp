import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'blockchain',
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.scss']
})
export class BlockchainComponent implements OnInit {

  blockchain: Object;

  constructor(private data: DataService) { }

  ngOnInit() {
    this.data.getBlockchain().subscribe(data => {
        this.blockchain = data
        console.log(this.blockchain);
      }
    );
  }
}
