import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  firstClick() {
    console.log("in first click");
    return console.log('clicked');
  }
  getUsers() {
    console.log("in get users");
    return this.http.get('https://reqres.in/api/users');
  }
  getBlockchain() {
    console.log("in getBlockchain");
    return this.http.get('http://localhost:3000/btc/?startTime=1543429541000&endTime=1543505704000');
  }
  sendFeedback(messageForm) {
    //Send a request to the backend witht the feedback, it should be sent as an email
    console.log(messageForm.controls.telegramId.value);
  }
}