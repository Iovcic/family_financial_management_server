export interface IBudget {
    id: number;
    user_id: number;
    month: number;
    year: number;
    total_budget: number;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateBudgetDTO {
    user_id: number;
    month: number;
    year: number;
    total_budget: number;
}

export interface IUpdateBudgetDTO {
    total_budget?: number;
}
