import { Component, EventEmitter, Output } from '@angular/core';
import { MainPage } from '../main-page/main-page';
import { Modal } from '../modal/modal';
@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.html',
  styleUrl: './popup.css',
})
export class Popup {
  constructor(protected mainPage: MainPage, protected modal: Modal) {}
 @Output() close = new EventEmitter<void>();
 closePopup(){
  this.close.emit();
 }
}
