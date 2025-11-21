// src/services/tradeService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const tradesCollection = collection(db, 'trades');

// Add a new trade (user-specific)
export const addTrade = async (tradeData, userId) => {
  try {
    // copy payload so we can convert date strings to Timestamp if provided
    const payload = {
      ...tradeData,
      userId: userId,
      createdAt: Timestamp.now()
    };

    // convert date strings (YYYY-MM-DD) to Firestore Timestamps when present
    if (payload.buyDate) {
      // new Date('YYYY-MM-DD') creates a Date at local midnight — OK for storing
      payload.buyDate = Timestamp.fromDate(new Date(payload.buyDate));
    } else {
      payload.buyDate = null;
    }

    if (payload.sellDate) {
      payload.sellDate = Timestamp.fromDate(new Date(payload.sellDate));
    } else {
      payload.sellDate = null;
    }

    const docRef = await addDoc(tradesCollection, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('Error adding trade:', error);
    throw error;
  }
};

// Get all trades for a specific user
export const getTrades = async (userId) => {
  try {
    const q = query(
      tradesCollection, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const trades = [];
    querySnapshot.forEach((doc) => {
      trades.push({ id: doc.id, ...doc.data() });
    });
    return trades;
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }
};

// Delete a trade
export const deleteTrade = async (tradeId) => {
  try {
    await deleteDoc(doc(db, 'trades', tradeId));
  } catch (error) {
    console.error('Error deleting trade:', error);
    throw error;
  }
};

// Update a trade (for delivery trades when sold)
export const updateTrade = async (tradeId, updates) => {
  try {
    // convert any buyDate/sellDate string to Timestamp (if provided in updates)
    const updatesPayload = { ...updates };
    if (updatesPayload.buyDate && !(updatesPayload.buyDate instanceof Timestamp)) {
      updatesPayload.buyDate = Timestamp.fromDate(new Date(updatesPayload.buyDate));
    }
    if (updatesPayload.sellDate && !(updatesPayload.sellDate instanceof Timestamp)) {
      updatesPayload.sellDate = Timestamp.fromDate(new Date(updatesPayload.sellDate));
    }

    const tradeRef = doc(db, 'trades', tradeId);
    await updateDoc(tradeRef, updatesPayload);
  } catch (error) {
    console.error('Error updating trade:', error);
    throw error;
  }
};

// Calculate profit/loss
export const calculateProfitLoss = (trade) => {
  // For delivery trades without sell price, return null
  if (trade.tradeType === 'delivery' && (!trade.sellPrice || trade.sellPrice === 0)) {
    return {
      grossProfit: null,
      netProfit: null,
      totalCharges: (parseFloat(trade.brokerage || 0) + parseFloat(trade.taxes || 0)).toFixed(2),
      status: 'holding'
    };
  }

  const { buyPrice, sellPrice, quantity, brokerage = 0, taxes = 0 } = trade;
  
  const grossProfit = (sellPrice - buyPrice) * quantity;
  const totalCharges = parseFloat(brokerage) + parseFloat(taxes);
  const netProfit = grossProfit - totalCharges;
  
  return {
    grossProfit: grossProfit.toFixed(2),
    netProfit: netProfit.toFixed(2),
    totalCharges: totalCharges.toFixed(2),
    status: 'closed'
  };
};