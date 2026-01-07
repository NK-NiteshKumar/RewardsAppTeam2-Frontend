export interface Transaction {
    transactionId: number;
    date: string; // LocalDateTime string
    amount: number;
    merchant: string;
    category: string;
    status: string;
    description: string;
}

export interface TransactionResponse {
    content: Transaction[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

// Minimal definition based on backend AuthController
export interface LoginResponse {
    jwtoken: string;
    username: string;
}

export interface LoginRequest {
    username: string; // The backend uses map<String, String> but usually expects keys
    password: string; // we'll send these keys
}

export interface LinkCardRequest {
    cardNumber: number;
    customerName: string;
    expiryDate: string; // YYYY-MM-DD
    cvv: number;
}
