export interface AlvaraLog {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  city: string;
  service: "Todos" | "AVCB" | "CLCB";
  quantity: number;
  consumedDate: Date;
  initDate: Date;
  endDate: Date;
}