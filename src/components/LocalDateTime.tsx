export default function LocalDateTime({
  utcDate,
  format,
}: {
  utcDate: string;
  format?: "1D" | "1H";
}) {
  if (!utcDate) return <span>N/A</span>;

  let options: Intl.DateTimeFormatOptions | undefined;

  switch (format) {
    case "1D":
      options = {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      };
      break;

    case "1H":
      options = {
        hour: "2-digit",
        minute: "2-digit",
      };
      break;

    default:
      // Unknown formats should return the raw input
      return <span>{utcDate}</span>;
  }

  try {
    const date = new Date(utcDate);
    const local = date.toLocaleString(undefined, options);
    return <span>{local}</span>;
  } catch {
    return <span>{utcDate}</span>;
  }
}
