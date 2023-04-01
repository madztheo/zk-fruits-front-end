import { createHash } from "crypto";

export function hashSet(set: Set<string>, secretKey: string): string[] {
  const hashedSet = new Array<string>();
  set.forEach((item) => {
    if (item) {
      hashedSet.push(
        "0x" +
          createHash("sha256")
            .update(secretKey + item)
            .digest("hex")
            .slice(0, 20)
      );
    }
  });
  for (let i = 0; i < 20 - set.size; i++) {
    hashedSet.push("0x" + (0).toString(16).padStart(20, "0"));
  }
  return hashedSet;
}
