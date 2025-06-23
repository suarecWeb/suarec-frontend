// interfaces/rating.interface.ts
export interface Rating {
    id?: string;
    stars: number;
    comment?: string;
    category: RatingCategory;
    created_at: Date;
    updated_at?: Date;
    reviewer?: User;
    reviewee?: User;
    workContract?: WorkContract;
  }
  
  export enum RatingCategory {
    SERVICE = 'SERVICE',
    EMPLOYER = 'EMPLOYER',
    EMPLOYEE = 'EMPLOYEE'
  }
  
  export interface CreateRatingDto {
    reviewerId: number;
    revieweeId: number;
    stars: number;
    comment?: string;
    category: RatingCategory;
    workContractId?: string;
  }
  
  export interface UpdateRatingDto {
    stars?: number;
    comment?: string;
  }
  
  export interface RatingStats {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
    categoryStats: { [category: string]: { average: number; count: number } };
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
  }
  
  export interface WorkContract {
    id: string;
    title: string;
    status: string;
  }