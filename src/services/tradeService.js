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
    const trade = {
      ...tradeData,
      userId: userId,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(tradesCollection, trade);
    return { id: docRef.id, ...trade };
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
    const tradeRef = doc(db, 'trades', tradeId);
    await updateDoc(tradeRef, updates);
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