import { Role } from "./role.interface";
import { Company } from "./company.interface";
import { Publication } from "./publication.interface";
import { Comment } from "./comment.interface";

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  currentPosition: boolean;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string | Date;
  endDate?: string | Date;
  description?: string;
}

export interface Reference {
  id?: string;
  name: string;
  relationship: string;
  contact: string;
  comment?: string;
}

export interface SocialLink {
  id?: string;
  type:
    | "LinkedIn"
    | "GitHub"
    | "Twitter"
    | "Facebook"
    | "Instagram"
    | "Website"
    | string;
  url: string;
}

export enum UserPlan {
  FREE = "free",
  PREMIUM = "premium",
  CREATOR = "creator",
}

export interface User {
  id?: string;
  email: string;
  password?: string;
  name: string;
  cellphone: string;
  genre: string;
  born_at: Date;
  cv_url?: string;
  profile_image?: string;
  created_at?: Date;
  roles?: string[] | { id: string; name: string }[] | undefined;
  profession?: string;
  skills?: string[];
  isVerify?: boolean;
  cedula?: string;
  plan?: UserPlan;

  // Relaciones
  idPhotos?: {
    id: string;
    image_url: string;
    status: "pending" | "approved" | "rejected";
    reviewed_by?: {
      id: string;
      name: string;
    };
  }[];
  company?: Company;
  publications?: Publication[];
  comments?: Comment[];
  experiences?: Experience[];
  bio?: string;
  education?: Education[];
  references?: Reference[];
  socialLinks?: SocialLink[];
  currentEmployment?: {
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    duration?: {
      days: number;
      months: number;
      years: number;
      displayText: string;
    };
  };
}

export // Interfaces para los DTOs
interface CreateUserDto {
  name: string;
  password: string;
  cv_url?: string;
  genre: string;
  cellphone: string;
  email: string;
  born_at: Date;
  roles?: string[];
  companyId?: string;
  profession?: string;
  skills?: string[];
}
