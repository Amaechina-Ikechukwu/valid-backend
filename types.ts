import type { Request } from "express";

export interface FirebaseUserData {
  name: string;
  picture: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: {
    identities: {
      "google.com": string[];
      email: string[];
    };
    sign_in_provider: string;
  };
  uid: string;
}

export interface CustomRequest extends Request {
  user?: FirebaseUserData;
}

export interface CreateContribution {
  name: string;
  amount: string;
  photoUrl?: string;
  admin: string;
  participants: string[];
  id: string;
}
export interface BodyContributionData {
  name: string;
  amount: string;
  photoUrl?: string;
}
