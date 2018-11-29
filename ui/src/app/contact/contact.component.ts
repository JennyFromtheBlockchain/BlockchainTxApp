import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

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
