import { Component, EventEmitter, Input, Output, input } from '@angular/core';
import { MainPage } from '../main-page/main-page';
import { Modal } from '../modal/modal';
import { FormsModule } from '@angular/forms';
import { Popup } from '../popup/popup';

@Component({
  selector: 'app-score-popup',
  imports: [FormsModule],
  templateUrl: './score-popup.html',
  styleUrl: './score-popup.css',
})
export class ScorePopup {
constructor(protected mainPage: MainPage, protected modal: Modal) {}
@Output() close = new EventEmitter<void>();
@Output() submitScore = new EventEmitter<number>();
isPopupVisible = false;
score = 0;

onSubmit(){
  this.submitScore.emit(this.score);
  this.showPopup();
  this.closePopup();
}
closePopup(){
  this.close.emit();
 }
showPopup(){
  this.isPopupVisible = true;
}
hidePopup(){
  this.isPopupVisible = false;
}

}
