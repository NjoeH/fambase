import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ── Users / Family ─────────────────────────────────────────────────────────

export async function getUserFamilyId(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().familyId ?? null) : null;
}

export async function getFamilyName(familyId: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "families", familyId));
  return snap.exists() ? (snap.data().name ?? null) : null;
}

export async function createFamily(
  name: string,
  uid: string,
  displayName: string,
  email: string,
): Promise<string> {
  const familyRef = doc(collection(db, "families"));
  const familyId = familyRef.id;
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  await setDoc(familyRef, { name, createdBy: uid, inviteCode, createdAt: serverTimestamp() });
  await setDoc(doc(db, "families", familyId, "members", uid), {
    role: "admin", joinedAt: serverTimestamp(), displayName, email,
  });
  await setDoc(doc(db, "inviteCodes", inviteCode), { familyId, createdAt: serverTimestamp() });
  await setDoc(doc(db, "users", uid), { familyId, displayName, email }, { merge: true });

  return familyId;
}

export async function joinFamilyByCode(
  code: string,
  uid: string,
  displayName: string,
  email: string,
): Promise<string | null> {
  const codeSnap = await getDoc(doc(db, "inviteCodes", code.toUpperCase()));
  if (!codeSnap.exists()) return null;

  const { familyId } = codeSnap.data() as { familyId: string };
  await setDoc(doc(db, "families", familyId, "members", uid), {
    role: "member", joinedAt: serverTimestamp(), displayName, email,
  });
  await setDoc(doc(db, "users", uid), { familyId, displayName, email }, { merge: true });

  return familyId;
}

// ── Vehicles ───────────────────────────────────────────────────────────────

export interface VehicleData {
  name: string;
  plate: string;
  type: "electric" | "gas";
  fuelPct: number;
  mileage: number;
  insuranceExpiry: string;
}

export interface Vehicle extends VehicleData {
  id: string;
}

export async function getVehicles(familyId: string): Promise<Vehicle[]> {
  const snap = await getDocs(
    query(collection(db, "families", familyId, "vehicles"), orderBy("createdAt", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vehicle));
}

export async function addVehicle(familyId: string, data: VehicleData): Promise<string> {
  const ref = await addDoc(collection(db, "families", familyId, "vehicles"), {
    ...data, createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteVehicle(familyId: string, vehicleId: string): Promise<void> {
  await deleteDoc(doc(db, "families", familyId, "vehicles", vehicleId));
}

// ── Maintenance Records (Property) ─────────────────────────────────────────

export interface MaintenanceRecordData {
  title: string;
  desc: string;
  cost: string;
  date: string;
  contractor: string;
  icon: string;
}

export interface MaintenanceRecord extends MaintenanceRecordData {
  id: string;
}

export async function getMaintenanceRecords(familyId: string): Promise<MaintenanceRecord[]> {
  const snap = await getDocs(
    query(collection(db, "families", familyId, "maintenanceRecords"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MaintenanceRecord));
}

export async function addMaintenanceRecord(
  familyId: string, data: MaintenanceRecordData,
): Promise<string> {
  const ref = await addDoc(collection(db, "families", familyId, "maintenanceRecords"), {
    ...data, createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteMaintenanceRecord(familyId: string, recordId: string): Promise<void> {
  await deleteDoc(doc(db, "families", familyId, "maintenanceRecords", recordId));
}

// ── Pets ───────────────────────────────────────────────────────────────────

export interface PetData {
  name: string;
  breed: string;
  birthday: string;
  gender: "male" | "female";
  neutered: boolean;
  chipNo: string;
}

export interface Pet extends PetData {
  id: string;
}

export async function getPets(familyId: string): Promise<Pet[]> {
  const snap = await getDocs(
    query(collection(db, "families", familyId, "pets"), orderBy("createdAt", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pet));
}

export async function addPet(familyId: string, data: PetData): Promise<string> {
  const ref = await addDoc(collection(db, "families", familyId, "pets"), {
    ...data, createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deletePet(familyId: string, petId: string): Promise<void> {
  await deleteDoc(doc(db, "families", familyId, "pets", petId));
}

// ── Warranties ─────────────────────────────────────────────────────────────

export interface WarrantyData {
  name: string;
  serial: string;
  purchaseDate: string;
  expiryDate: string;
  category: "appliance" | "electronics" | "other";
}

export interface Warranty extends WarrantyData {
  id: string;
}

export async function getWarranties(familyId: string): Promise<Warranty[]> {
  const snap = await getDocs(
    query(collection(db, "families", familyId, "warranties"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Warranty));
}

export async function addWarranty(familyId: string, data: WarrantyData): Promise<string> {
  const ref = await addDoc(collection(db, "families", familyId, "warranties"), {
    ...data, createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteWarranty(familyId: string, warrantyId: string): Promise<void> {
  await deleteDoc(doc(db, "families", familyId, "warranties", warrantyId));
}

// ── Fuel Records ────────────────────────────────────────────────────────────

export interface FuelRecordData {
  date: string;
  mileage: number;
  amount: number;   // litres (gas) or kWh (electric)
  cost: number;
  notes: string;
}

export interface FuelRecord extends FuelRecordData {
  id: string;
}

export async function getFuelRecords(familyId: string, vehicleId: string): Promise<FuelRecord[]> {
  const snap = await getDocs(
    query(
      collection(db, "families", familyId, "vehicles", vehicleId, "fuelRecords"),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FuelRecord));
}

export async function addFuelRecord(
  familyId: string, vehicleId: string, data: FuelRecordData,
): Promise<string> {
  const ref = await addDoc(
    collection(db, "families", familyId, "vehicles", vehicleId, "fuelRecords"),
    { ...data, createdAt: serverTimestamp() },
  );
  return ref.id;
}

// ── Service Records ─────────────────────────────────────────────────────────

export interface ServiceRecordData {
  date: string;
  mileage: number;
  type: string;
  cost: number;
  shop: string;
  notes: string;
}

export interface ServiceRecord extends ServiceRecordData {
  id: string;
}

export async function getServiceRecords(familyId: string, vehicleId: string): Promise<ServiceRecord[]> {
  const snap = await getDocs(
    query(
      collection(db, "families", familyId, "vehicles", vehicleId, "serviceRecords"),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceRecord));
}

export async function addServiceRecord(
  familyId: string, vehicleId: string, data: ServiceRecordData,
): Promise<string> {
  const ref = await addDoc(
    collection(db, "families", familyId, "vehicles", vehicleId, "serviceRecords"),
    { ...data, createdAt: serverTimestamp() },
  );
  return ref.id;
}
