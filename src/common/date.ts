import dayjs from "dayjs";

export function calendar(ts: number) {
  return dayjs(ts).calendar(null, {
    sameDay: "H:mm", // The same day ( Today at 2:30 AM )
    lastDay: "[昨天] H:mm A", // The day before ( Yesterday at 2:30 AM )
    lastWeek: "[上周] dddd h:mm A", // Last week ( Last Monday at 2:30 AM )
    sameElse: "YYYY/MM/DD H:mm", // Everything else ( 17/10/2011 )
  });
}
