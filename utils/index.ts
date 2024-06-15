export const extractTime = (date: Date) => {
    let newDate: Date = new Date(date);

    let options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    let timeString = newDate.toLocaleTimeString("en-US", options);
    return timeString;
}