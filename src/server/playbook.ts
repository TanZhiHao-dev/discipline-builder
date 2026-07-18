"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { playbook } from "@/db/schema";
import { requireUser } from "@/lib/session";

const revalidate = () => {
  revalidatePath("/playbooks");
  revalidatePath("/journal");
  revalidatePath("/stats");
};

const PlaybookSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(80),
  description: z.string().max(500).default(""),
  rules: z.string().max(4000).default(""),
  checklist: z.string().max(4000).default(""),
  color: z.string().max(20).default("blue"),
});

export async function savePlaybook(input: z.input<typeof PlaybookSchema>) {
  const user = await requireUser();
  const d = PlaybookSchema.parse(input);
  if (d.id) {
    await db
      .update(playbook)
      .set({
        name: d.name,
        description: d.description,
        rules: d.rules,
        checklist: d.checklist,
        color: d.color,
      })
      .where(and(eq(playbook.id, d.id), eq(playbook.userId, user.id)));
    revalidate();
    return { id: d.id };
  }
  const id = crypto.randomUUID();
  const count = (
    await db.select({ id: playbook.id }).from(playbook).where(eq(playbook.userId, user.id))
  ).length;
  await db.insert(playbook).values({
    id,
    userId: user.id,
    name: d.name,
    description: d.description,
    rules: d.rules,
    checklist: d.checklist,
    color: d.color,
    sortOrder: count,
  });
  revalidate();
  return { id };
}

export async function deletePlaybook(id: string) {
  const user = await requireUser();
  const pid = z.string().min(1).parse(id);
  await db.delete(playbook).where(and(eq(playbook.id, pid), eq(playbook.userId, user.id)));
  revalidate();
  return { ok: true };
}
