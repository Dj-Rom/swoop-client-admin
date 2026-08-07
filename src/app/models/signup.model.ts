export interface SignupRequest {
  fullName: string;
  country: string;

  placeName: string;
  nip: string;

  companyEmail: string;
  contactNumber: string;

  acceptTerms: boolean;
}
