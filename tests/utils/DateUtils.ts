import { format, addMinutes, setSeconds } from 'date-fns'

export class DateUtils {
  static getFormattedDateTime(date: Date) {
    return format(date, 'dd-MM-yyyy HH:mm')
  }
  static getDateTimeAndAppendMinutes(appendedMinutes: number) {
    return setSeconds(addMinutes(new Date(), appendedMinutes), 0)
  }
}
