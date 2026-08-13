/**
 * Smart Gender-Aware & Profile Photo Avatar Resolution Engine for AnimusLab Anchor
 */

const FEMALE_NAMES = new Set([
  "ananya", "priya", "sarah", "emma", "neha", "sophia", "elena", "meera", "pooja", 
  "shreya", "divya", "isabella", "olivia", "ava", "mia", "charlotte", "emily", 
  "aaliyah", "fatima", "zara", "aanya", "ria", "tanya", "simran", "kavya", "aditi",
  "aishwarya", "deepika", "sakshi", "sneha", "swati", "natasha", "rachel", "jessica"
]);

export interface AvatarResolutionOptions {
  name?: string;
  gender?: "male" | "female" | "auto" | "custom";
  customPhotoUrl?: string;
}

export function detectGenderFromName(name?: string): "male" | "female" {
  if (!name) return "male";
  const firstName = name.trim().split(" ")[0].toLowerCase();
  return FEMALE_NAMES.has(firstName) ? "female" : "male";
}

export function getAvatarImage(
  expression: "wink" | "smile",
  options: AvatarResolutionOptions
): { type: "memoji" | "custom"; src: string; resolvedGender: "male" | "female" | "custom" } {
  if (options.customPhotoUrl) {
    return {
      type: "custom",
      src: options.customPhotoUrl,
      resolvedGender: "custom",
    };
  }

  const gender =
    options.gender && options.gender !== "auto" && options.gender !== "custom"
      ? options.gender
      : detectGenderFromName(options.name);

  if (gender === "female") {
    return {
      type: "memoji",
      src: expression === "wink" ? "/avatars/memoji_female_wink.jpg" : "/avatars/memoji_female_smile.jpg",
      resolvedGender: "female",
    };
  }

  return {
    type: "memoji",
    src: expression === "wink" ? "/avatars/memoji_wink.jpg" : "/avatars/memoji_smile.jpg",
    resolvedGender: "male",
  };
}
