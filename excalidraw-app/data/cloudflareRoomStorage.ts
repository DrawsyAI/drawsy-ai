import { reconcileElements } from "@excalidraw/excalidraw";
import {
  decryptData,
  encryptData,
} from "@excalidraw/excalidraw/data/encryption";
import { restoreElements } from "@excalidraw/excalidraw/data/restore";
import { toBrandedType } from "@excalidraw/common";
import { getSceneVersion } from "@excalidraw/element";

import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import type {
  ExcalidrawElement,
  OrderedExcalidrawElement,
} from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

import { getSyncableElements } from ".";

import type { SyncableExcalidrawElement } from ".";
import type Portal from "../collab/Portal";
import type { Socket } from "socket.io-client";

type RoomSnapshot = {
  sceneVersion: number;
  iv: string;
  ciphertext: string;
};

type RoomResponse = {
  exists: boolean;
  revision?: number;
  snapshot?: RoomSnapshot | null;
};

type RoomState = {
  revision: number;
  sceneVersion: number;
};

const roomStateCache = new WeakMap<Socket, RoomState>();

const getBackendUrl = () => {
  const configuredUrl = import.meta.env.VITE_APP_DRAWSY_BACKEND_URL?.trim();
  if (!configuredUrl) {
    throw new Error("VITE_APP_DRAWSY_BACKEND_URL is not configured");
  }
  return configuredUrl.replace(/\/$/, "");
};

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)),
    );
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const isRoomSnapshot = (value: unknown): value is RoomSnapshot => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(candidate.sceneVersion) &&
    Number(candidate.sceneVersion) >= 0 &&
    typeof candidate.iv === "string" &&
    typeof candidate.ciphertext === "string"
  );
};

const requestRoom = async (
  roomId: string,
  method: "GET" | "PUT",
  body?: unknown,
): Promise<{ response: Response; body: RoomResponse }> => {
  const response = await fetch(
    `${getBackendUrl()}/v1/rooms/${encodeURIComponent(roomId)}/snapshot`,
    {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  const responseBody = (await response
    .json()
    .catch(() => ({}))) as RoomResponse;
  return { response, body: responseBody };
};

const decryptElements = async (
  snapshot: RoomSnapshot,
  roomKey: string,
): Promise<readonly ExcalidrawElement[]> => {
  const decrypted = await decryptData(
    fromBase64Url(snapshot.iv),
    fromBase64Url(snapshot.ciphertext),
    roomKey,
  );
  return JSON.parse(new TextDecoder().decode(new Uint8Array(decrypted)));
};

const encryptElements = async (
  elements: readonly SyncableExcalidrawElement[],
  roomKey: string,
): Promise<RoomSnapshot> => {
  const encoded = new TextEncoder().encode(JSON.stringify(elements));
  const { encryptedBuffer, iv } = await encryptData(roomKey, encoded);
  return {
    sceneVersion: getSceneVersion(elements),
    iv: toBase64Url(iv),
    ciphertext: toBase64Url(new Uint8Array(encryptedBuffer)),
  };
};

const decodeStoredElements = async (snapshot: RoomSnapshot, roomKey: string) =>
  getSyncableElements(
    restoreElements(await decryptElements(snapshot, roomKey), null, {
      deleteInvisibleElements: true,
    }),
  );

export const isSavedToCloudflare = (
  portal: Portal,
  elements: readonly ExcalidrawElement[],
) => {
  if (portal.socket && portal.roomId && portal.roomKey) {
    return (
      roomStateCache.get(portal.socket)?.sceneVersion ===
      getSceneVersion(elements)
    );
  }
  return true;
};

export const loadFromCloudflare = async (
  roomId: string,
  roomKey: string,
  socket: Socket | null,
): Promise<readonly SyncableExcalidrawElement[] | null> => {
  const { response, body } = await requestRoom(roomId, "GET");
  if (!response.ok) {
    throw new Error(`Cloudflare room load failed (${response.status})`);
  }
  if (!body.exists || !isRoomSnapshot(body.snapshot)) {
    return null;
  }
  const elements = await decodeStoredElements(body.snapshot, roomKey);
  if (socket) {
    roomStateCache.set(socket, {
      revision: Number(body.revision || 0),
      sceneVersion: getSceneVersion(elements),
    });
  }
  return elements;
};

export const saveToCloudflare = async (
  portal: Portal,
  elements: readonly SyncableExcalidrawElement[],
  appState: AppState,
) => {
  const { roomId, roomKey, socket } = portal;
  if (!roomId || !roomKey || !socket || isSavedToCloudflare(portal, elements)) {
    return null;
  }

  let expectedRevision = roomStateCache.get(socket)?.revision;
  let candidateElements = elements;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (expectedRevision === undefined) {
      const current = await requestRoom(roomId, "GET");
      if (!current.response.ok) {
        throw new Error(
          `Cloudflare room load failed (${current.response.status})`,
        );
      }
      expectedRevision = Number(current.body.revision || 0);
      if (current.body.exists && isRoomSnapshot(current.body.snapshot)) {
        const currentElements = await decodeStoredElements(
          current.body.snapshot,
          roomKey,
        );
        candidateElements = getSyncableElements(
          reconcileElements(
            candidateElements,
            currentElements as OrderedExcalidrawElement[] as RemoteExcalidrawElement[],
            appState,
          ),
        );
      }
    }

    const snapshot = await encryptElements(candidateElements, roomKey);
    const result = await requestRoom(roomId, "PUT", {
      expectedRevision,
      snapshot,
    });
    if (result.response.ok && result.body.revision !== undefined) {
      const storedElements = getSyncableElements(
        restoreElements(await decryptElements(snapshot, roomKey), null),
      );
      roomStateCache.set(socket, {
        revision: result.body.revision,
        sceneVersion: getSceneVersion(storedElements),
      });
      return toBrandedType<RemoteExcalidrawElement[]>(storedElements);
    }
    if (result.response.status !== 409) {
      throw new Error(
        `Cloudflare room save failed (${result.response.status})`,
      );
    }
    expectedRevision = Number(result.body.revision || 0);
    if (isRoomSnapshot(result.body.snapshot)) {
      const currentElements = await decodeStoredElements(
        result.body.snapshot,
        roomKey,
      );
      candidateElements = getSyncableElements(
        reconcileElements(
          candidateElements,
          currentElements as OrderedExcalidrawElement[] as RemoteExcalidrawElement[],
          appState,
        ),
      );
    }
  }
  throw new Error("Cloudflare room save conflict retry limit exceeded");
};
