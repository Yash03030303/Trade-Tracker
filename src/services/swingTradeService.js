// src/services/swingTradeService.js
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const swingTradesCollection = collection(db, 'swingTrades');

/**
 * Add a new swing trade plan.
 * Default status = 'planned'.
 */
export const addSwingTrade = async (data, userId) => {
  try {
    const payload = {
      ...data,
      userId,
      status: data.status || 'planned',
      createdAt: Timestamp.now()
    };

    // Convert entryDate string to Timestamp if provided
    if (payload.entryDate && typeof payload.entryDate === 'string') {
      payload.entryDate = Timestamp.fromDate(new Date(payload.entryDate));
    }

    const docRef = await addDoc(swingTradesCollection, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('Error adding swing trade:', error);
    throw error;
  }
};

/**
 * Get all swing trades for a specific user, ordered by createdAt desc.
 */
export const getSwingTrades = async (userId) => {
  try {
    // Only filter by userId — no orderBy to avoid needing a composite index
    const q = query(
      swingTradesCollection,
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const trades = [];
    snapshot.forEach((docSnap) => {
      trades.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort client-side by createdAt descending
    trades.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
    return trades;
  } catch (error) {
    console.error('Error fetching swing trades:', error);
    throw error;
  }
};

/**
 * Update a swing trade (e.g. planned -> active, mark target hit, close trade).
 */
export const updateSwingTrade = async (tradeId, updates) => {
  try {
    const payload = { ...updates };

    // Convert entryDate string to Timestamp if provided in updates
    if (payload.entryDate && typeof payload.entryDate === 'string') {
      payload.entryDate = Timestamp.fromDate(new Date(payload.entryDate));
    }

    const tradeRef = doc(db, 'swingTrades', tradeId);
    await updateDoc(tradeRef, payload);
  } catch (error) {
    console.error('Error updating swing trade:', error);
    throw error;
  }
};

/**
 * Delete a swing trade.
 */
export const deleteSwingTrade = async (tradeId) => {
  try {
    await deleteDoc(doc(db, 'swingTrades', tradeId));
  } catch (error) {
    console.error('Error deleting swing trade:', error);
    throw error;
  }
};

/**
 * Calculate Risk:Reward ratio from entry, stoploss, and target.
 * Risk = entry - stoploss
 * Reward = target - entry
 */
export const calculateRiskReward = (entryPrice, stoploss, target) => {
  const entry = parseFloat(entryPrice);
  const sl = parseFloat(stoploss);
  const tgt = parseFloat(target);

  if (!entry || !sl || !tgt || entry <= sl || tgt <= entry) return null;

  const risk = entry - sl;
  const reward = tgt - entry;

  if (risk <= 0) return null;

  return (reward / risk).toFixed(2);
};
