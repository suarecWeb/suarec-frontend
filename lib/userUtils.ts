import { User, UserPlan } from "@/interfaces/user.interface";

export interface UserIconResult {
  verified: string | null;
  plan: string | null;
}

export function getUserIcon(user: User): UserIconResult {
  // Si el usuario está verificado, mostramos el ícono según su plan
  if (user.isVerify) {
    const planIcons = {
      [UserPlan.FREE]: "checked-gray",
      [UserPlan.PREMIUM]: "checked-blue",
      [UserPlan.CREATOR]: "checked-gold",
    };

    return {
      verified: user.plan ? planIcons[user.plan] : "checked-gray",
      plan: null, // No necesitamos mostrar el plan por separado
    };
  }

  return {
    verified: null,
    plan: null,
  };
}

export function getPlanColor(plan: UserPlan): string {
  const colors = {
    [UserPlan.FREE]: "text-gray-500",
    [UserPlan.PREMIUM]: "text-blue-500",
    [UserPlan.CREATOR]: "text-amber-500",
  };
  return colors[plan];
}

export function getPlanDisplayName(plan: UserPlan): string {
  const names = {
    [UserPlan.FREE]: "Plan Gratuito",
    [UserPlan.PREMIUM]: "Plan Premium",
    [UserPlan.CREATOR]: "Creador",
  };
  return names[plan];
}
