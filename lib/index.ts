import { createHash } from "crypto";
import { io } from "socket.io-client";
// @ts-ignore
import { SinglePedersen } from "@noir-lang/barretenberg";
// @ts-ignore
import { BarretenbergWasm } from "@noir-lang/barretenberg";

export function hashSet(set: Set<string>, secretKey: string): string[] {
  const hashedSet = new Array<string>();
  set.forEach((item) => {
    if (item) {
      hashedSet.push(
        "0x" +
          createHash("sha256")
            .update(secretKey + item)
            .digest("hex")
      );
    }
  });
  for (let i = 0; i < 20 - set.size; i++) {
    hashedSet.push("0x" + (0).toString(16).padStart(64, "0"));
  }
  return hashedSet;
}

export async function getPedersenHash(set: string[]) {
  const barretenberg = await BarretenbergWasm.new();
  const pedersen = new SinglePedersen(barretenberg);
  const buffers = set.map((x) => Buffer.from(x.slice(2), "hex"));
  return "0x" + pedersen.compressInputs(buffers).toString("hex");
}

export function connectToSocket(
  onConnect: () => any,
  onDisconnect: () => any,
  onMessage: (data: any) => any
) {
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);

  socket.on(
    "personal_secret",
    (data: { publicKey: string; privateKey: string }) => {
      console.log({
        publicKey: data.publicKey,
      });
      socket.emit("get_shared_secret", data.publicKey);
    }
  );

  socket.on("shared_secret", (sharedSecret) => {
    console.log({
      sharedSecret,
    });
  });

  socket.on("connect", () => {
    console.log("Connection", socket.id);
    onConnect();
  });

  socket.on("disconnect", () => {
    console.log("Disconnection", socket.id);
    onDisconnect();
  });
}
