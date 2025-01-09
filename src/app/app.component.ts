import { Component, inject } from '@angular/core';
import { interval, Subscription } from "rxjs";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './component/dialog/dialog.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapp';
  beginnerIcons = [
    "face",
    "check_circle",
    "pets",
    "cake",
  ];
  intermediateIcons = [
    "local_florist",
    "sports_soccer",
    "directions_car",
    "shopping_cart",
    "school",
    "cake",
    "sports_basketball",
    "local_cafe",
  ];
  hardIcons = [
    "extension",
    "filter_vintage",
    "emoji_nature",
    "healing",
    "public",
    "emoji_food_beverage",
    "spa",
    "palette",
    "local_fire_department",
    "science",
    "hiking",
    "sailing",
  ];
  gameSize: number = 0;
  gamesArray: {
    selected: boolean;
    iconName: string;
  }[][] = [];
  iconPairSelected: {
    indexArray: number;
    indexIcon: number;
    iconName: string;
  }[] = [];
  formattedTime: string = "00:00";
  initialRemainingTime = 300;
  private remainingTime: number = 300; // Set initial time in seconds
  private timerSubscription!: Subscription;

  readonly dialog = inject(MatDialog);

  openDialog(title: string, bodyText: string, afterFunct: () => void): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      maxWidth: '300px',
      data: {
        title,
        bodyText
      }
    });
    dialogRef.afterClosed().subscribe(afterFunct)
  }

  selectLevel(levelSize: number) {
    this.gameSize = levelSize;
    this.generateGamesTile();
    this.startTimer();
  }

  generateGamesTile() {
    this.gamesArray = [];
    let gamesArrayToBe: string[] = [];
    for (let i = 0; i < this.gameSize; i++) {
      gamesArrayToBe = gamesArrayToBe.concat(this.shuffleArray());
    }
    for (let i = 0; i < this.gameSize; i++) {
      const gamesArrayPerItem = [];
      for (let j = 0; j < this.gameSize; j++) {
        const randomIndex = this.getRandomNumber(0, gamesArrayToBe.length - 1);
        gamesArrayPerItem.push({
          selected: false,
          iconName: gamesArrayToBe[randomIndex],
        });
        gamesArrayToBe.splice(randomIndex, 1);
      }
      this.gamesArray.push(gamesArrayPerItem);
    }
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  shuffleArray(): string[] {
    let array: string[] = [];
    switch (this.gameSize) {
      case 4:
        array = this.beginnerIcons;
        break;
      case 8:
        array = this.intermediateIcons;
        break;
      case 12:
        array = this.hardIcons;
        break;
    }
    const shuffled = [...array]; // Create a copy of the array to avoid mutating the original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1)); // Get a random index
      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i],
      ]; // Swap elements
    }
    return shuffled;
  }

  selectIcon(indexArray: number, indexIcon: number) {
    if (this.gamesArray[indexArray][indexIcon].selected) {
      // do nothing on selected icons
      return;
    }
    if (this.iconPairSelected.length == 2) {
      if (
        this.iconPairSelected[0].iconName != this.iconPairSelected[1].iconName
      ) {
        this.iconPairSelected.forEach((item) => {
          this.gamesArray[item.indexArray][item.indexIcon].selected = false;
        });
      }
      this.iconPairSelected = [];
    }
    this.iconPairSelected.push({
      indexArray: indexArray,
      indexIcon: indexIcon,
      iconName: this.gamesArray[indexArray][indexIcon].iconName,
    });
    this.gamesArray[indexArray][indexIcon].selected = true;
    if (this.iconPairSelected.length == 2) {
      if (
        this.gamesArray.every((array) => array.every((icon) => icon.selected))
      ) {
        setTimeout(() => {
          this.winTheGame();
        }, 100);
      }
    }
  }

  resetGame() {
    this.gamesArray = [];
    this.gameSize = 0;
    this.iconPairSelected = [];
  }

  winTheGame() {
    this.openDialog("CONGRATULATION", "You win the Game. Wanna win another one?", ()=>{
      this.resetGame();
      this.remainingTime = this.initialRemainingTime;
    });
  }

  loseTheGame() {
    this.openDialog(
      "UNFORTUNATELY",
      "You lose the game. Wanna try again?",
      () => {
        this.resetGame();
        this.remainingTime = this.initialRemainingTime;
      }
    )
  }

  startTimer(): void {
    this.updateDisplay();

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateDisplay();
      } else {
        this.stopTimer();
        if (
          this.gamesArray.some((array) => array.some((icon) => !icon.selected))
        ) {
          this.loseTheGame();
        }
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  resetTimer(): void {
    this.stopTimer();
    this.startTimer();
  }

  private updateDisplay(): void {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    this.formattedTime = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }
}
