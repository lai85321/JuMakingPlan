export default function getMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setHours(0, 0, 0, 0);
    return new Date(date.setDate(diff));
}