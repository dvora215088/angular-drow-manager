// interfaces.ts
export interface User {
    id: number;
    name: string;
  }
  
  export interface Rating {
    id: number;
    ratingValue: number;
    worksheetId: number;
    userId: number;
    user: User;
  }
  
  export interface Category {
    id: number;
    name: string;
  }
  
  export interface Worksheet {
    id: number;
    title: string;
    fileUrl: string;
    ageGroup: string;
    difficulty: string;
    ratings: Rating[];
    categoryId: number;
    category: Category;
    userId: number;
    user: User;
  }
  
  export interface RatingStats {
    worksheetTitle: string;
    averageRating: number;
    totalRatings: number;
    ratingDistribution: number[];
  }
  