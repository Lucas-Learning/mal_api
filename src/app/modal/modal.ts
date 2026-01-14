import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MainPage } from '../main-page/main-page';
import { Popup } from '../popup/popup';
import { ScorePopup } from '../score-popup/score-popup';

@Component({
  selector: 'app-modal',
  imports: [Popup, ScorePopup],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  constructor(protected mainPage: MainPage) {}
  @Output() close = new EventEmitter<void>();
  isPopupVisible = false;
  isScorePopupVisible = false;
  closeModal(): void{
    this.close.emit();
  }
  showPopup(){
    this.isPopupVisible = true;
  }
  hidePopup(){
    this.isPopupVisible = false;
  }
  showScorePopup(status: string){
    this.mainPage.statusUpdating.set(status);
    
    if (!status) {
      console.error("No status provided!");
      return;
    }
    this.isScorePopupVisible = true;
  }
  hideScorePopup(){
    this.isScorePopupVisible = false;
  }
  

}
