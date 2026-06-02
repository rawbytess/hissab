import { atom } from "jotai";
import { loadable } from "jotai/utils";
import {
  getSkillsFromIDB,
  saveSkillsToIDB,
} from "@/lib/idb-stores/mcp-store.ts";
import { seedSkills } from "@/lib/mcp/defaults.ts";
import type { Skill } from "@/lib/mcp/types.ts";

const skillsDataAtom = atom<Skill[] | null>(null);

let skillsLoadPromise: Promise<Skill[]> | null = null;
const loadSkills = async (): Promise<Skill[]> => {
  const stored = await getSkillsFromIDB();
  if (stored !== undefined) return stored;
  const seeded = seedSkills();
  if (seeded.length > 0) await saveSkillsToIDB(seeded);
  return seeded;
};

export const asyncSkillsAtom = atom<
  Skill[] | Promise<Skill[]>,
  [Skill[]],
  void
>(
  (get) => {
    const cached = get(skillsDataAtom);
    if (cached !== null) return cached;
    if (!skillsLoadPromise) {
      skillsLoadPromise = loadSkills();
    }
    return skillsLoadPromise;
  },
  async (_get, set, updated: Skill[]) => {
    await saveSkillsToIDB(updated);
    set(skillsDataAtom, updated);
  },
);

export const skillsAtom = loadable(asyncSkillsAtom);
