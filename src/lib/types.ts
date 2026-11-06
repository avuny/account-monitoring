export type EmailItem = { id: string; address: string; createdAt: string };

export type AccountItem = {
  id: string;
  emailId: string;
  emailAddress: string;
  name: string;
  quotaPercent: number | null;
  resetAt: string | null;
  createdAt: string;
  updatedAt: string;
};
