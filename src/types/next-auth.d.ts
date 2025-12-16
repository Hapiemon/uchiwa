import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    timezone?: string;
  }

  interface Session {
    user: User;
  }
}
