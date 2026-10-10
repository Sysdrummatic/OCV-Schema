/* Generated from schemas/1.0.0/schema.json. Run npm run generate:types. */

export type Person = Person1 & Person2;
export type Person1 =
  | {
      first_name?: string;
      [k: string]: unknown;
    }
  | {
      family_name?: string;
      [k: string]: unknown;
    };
/**
 * This interface was referenced by `Person2`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `Summary`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `Contact`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `QrCode`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `Skill`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `Language`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `Experience`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `Education`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `Course`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 *
 * This interface was referenced by `OcvDocument`'s JSON-Schema definition
 * via the `patternProperty` "^x-.+".
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {
      [k: string]: JsonValue;
    };

export interface OcvDocument {
  /**
   * OCV format version, independent of the library version.
   */
  ocv: "1.0.0";
  person: Person;
  summary?: Summary[];
  contact?: Contact[];
  qr_codes?: QrCode[];
  skills?: Skill[];
  tech_stack?: string[];
  languages?: Language[];
  interests?: string[];
  experience?: Experience[];
  education?: Education[];
  courses?: Course[];
  gdpr_clause?: string;
  [k: string]:
    | JsonValue
    | "1.0.0"
    | Person
    | Summary[]
    | Contact[]
    | QrCode[]
    | Skill[]
    | string[]
    | Language[]
    | Experience[]
    | Education[]
    | Course[]
    | string
    | undefined;
}
export interface Person2 {
  brand_initials?: string;
  first_name: string;
  family_name: string;
  [k: string]: JsonValue | string | undefined;
}
export interface Summary {
  position: string;
  description: string;
  default: boolean;
  [k: string]: JsonValue | string | boolean;
}
export interface Contact {
  label: string;
  value: string;
  link?: string;
  [k: string]: JsonValue | string | undefined;
}
export interface QrCode {
  label: string;
  value: string;
  /**
   * Preferred square size in CSS pixels.
   */
  size: number;
  [k: string]: JsonValue | string | number;
}
export interface Skill {
  name: string;
  /**
   * Self-assessment on a five-point scale, not a certification.
   */
  level: number;
  [k: string]: JsonValue | string | number;
}
export interface Language {
  name: string;
  level_text: string;
  /**
   * Self-assessment on a five-point scale, not a certification.
   */
  level: number;
  [k: string]: JsonValue | string | number;
}
export interface Experience {
  period: string;
  company: string;
  role: string;
  highlights: string[];
  [k: string]: JsonValue | string | string[];
}
export interface Education {
  period: string;
  school: string;
  degree: string;
  detail: string;
  [k: string]: JsonValue | string;
}
export interface Course {
  year: number;
  name: string;
  [k: string]: JsonValue | number | string;
}
