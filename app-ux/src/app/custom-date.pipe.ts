import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  transform(value: Date | string): string {
    if (!value) {
      return '';
    }

    const currentDate = new Date();
    const inputDate = new Date(value);

    // Resetting time for date comparison
    currentDate.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    const dayDifference = (currentDate.valueOf() - inputDate.valueOf()) / (1000 * 60 * 60 * 24);

    if (dayDifference === -1) {
      return `Tomorrow ${this.getFormattedTime(new Date(value))}`;
    }
    else if (dayDifference === 0) {
      return `Today ${this.getFormattedTime(new Date(value))}`;
    } else if (dayDifference === 1) {
      return `Yesterday ${this.getFormattedTime(new Date(value))}`;
    } else {
      return `${this.getFormattedDate(new Date(value))} ${this.getFormattedTime(new Date(value))}`;
    }
  }

  private getFormattedDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}/${year}`;
  }

  private getFormattedTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    return `${hours < 10 ? '0' + hours : hours}:${minutesStr} ${ampm}`;
  }

}
