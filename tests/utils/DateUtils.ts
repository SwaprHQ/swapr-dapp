import { addMinutes, format, setSeconds } from 'date-fns'

export class DateUtils {
  static getFormattedDateTimeForInput(date: Date) {
    return format(date, 'MM-dd-yyyy HH:mm')
  }
  static getFormattedDateTimeForValidation(date: Date) {
    return format(date, 'dd-MM-yyyy HH:mm')
  }
  static getDateTimeAndAppendMinutes(appendedMinutes: number) {
    return setSeconds(addMinutes(new Date(), appendedMinutes), 0)
  }
}
