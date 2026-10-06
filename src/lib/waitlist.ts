import { z } from "zod";

export const GROUPS = ["farmer", "seller", "buyer"] as const;
export type Group = (typeof GROUPS)[number];

export const CATEGORIES = [
  "Cereals & Grains",
  "Legumes",
  "Fruits & Vegetables",
  "Meat & Poultry",
  "Seafood",
  "Dairy Products",
] as const;

export const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi",
  "Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
] as const;

// +2348012345678 or 08012345678
const ngPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+234|0)[789][01]\d{8}$/.test(v), "Enter a Nigerian number, like 0803 123 4567")
  .transform((v) => (v.startsWith("0") ? "+234" + v.slice(1) : v));

const optionalPhone = z.union([z.literal(""), ngPhone]).optional();
const email = z.string().trim().toLowerCase().email("Enter a valid email address");
const optionalEmail = z.union([z.literal(""), email]).optional();

const base = {
  name: z.string().trim().min(2, "Enter your full name"),
  state: z.enum(NG_STATES, { message: "Pick your state" }),
  consent: z.literal(true, { message: "Tick the box to get launch updates" }),
  referredBy: z.string().trim().max(16).optional(),
  utmSource: z.string().max(64).optional(),
  utmCampaign: z.string().max(64).optional(),
};

export const farmerSchema = z.object({
  group: z.literal("farmer"),
  ...base,
  phone: ngPhone,
  email: optionalEmail,
  lgaOrCity: z.string().trim().min(2, "Enter your LGA"),
  categories: z.array(z.enum(CATEGORIES)).min(1, "Pick at least one"),
  businessName: z.string().trim().optional(),
  scale: z.enum(["Under 1 plot", "1–5 plots", "1–5 hectares", "Over 5 hectares"]),
  sellsOnline: z.enum(["yes", "no"]),
});

export const sellerSchema = z.object({
  group: z.literal("seller"),
  ...base,
  phone: ngPhone,
  email,
  lgaOrCity: z.string().trim().min(2, "Enter your city"),
  categories: z.array(z.enum(CATEGORIES)).min(1, "Pick at least one"),
  businessName: z.string().trim().min(2, "Enter your business name"),
  scale: z.enum(["Market stall", "Shop", "Aggregator", "Processor"]),
  sellsOnline: z.enum(["yes", "no"]),
});

export const buyerSchema = z.object({
  group: z.literal("buyer"),
  ...base,
  phone: optionalPhone,
  email,
  lgaOrCity: z.string().trim().min(2, "Enter your city"),
  scale: z.enum(["Household", "Restaurant", "Caterer"]),
});

export const signupSchema = z.discriminatedUnion("group", [farmerSchema, sellerSchema, buyerSchema]);
export type SignupInput = z.infer<typeof signupSchema>;

export type SignupRecord = SignupInput & {
  id: string;
  referralCode: string;
  referralCount: number;
  createdAt: string;
};
