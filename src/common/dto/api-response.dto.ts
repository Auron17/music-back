export class ApiResponse<T> {
  success!: boolean;
  message!: string;
  data!: T | null;
  timestamp!: number;
}
