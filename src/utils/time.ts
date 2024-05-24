function withLeadingZero(number: number) {
    return number < 10 ? ("0" + number) : ("" + number); 
}

export function timeConverter(timestamp: number) {
    const a = new Date(timestamp);
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    return year + '-' + month + '-' + withLeadingZero(date) + ' '
        + withLeadingZero(hour) + '-'  + withLeadingZero(min) + '-'  + withLeadingZero(sec)
}