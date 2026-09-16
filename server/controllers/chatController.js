import { getDb } from '../config/db.js';
import { getAuthenticatedUser } from '../middleware/authMiddleware.js';

export async function getConversations(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.query);
    const userId = authUser?.userId || req.query.userId;

    if (!userId) {
      return res.json({ success: true, conversations: [] });
    }

    const conversations = await db.collection('messages').aggregate([
      {
        $match: {
          $or: [{ fromUserId: userId }, { toUserId: userId }]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: ['$fromUserId', '$toUserId'] },
              { $concat: ['$toUserId', ':', '$fromUserId'] },
              { $concat: ['$fromUserId', ':', '$toUserId'] }
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      conversations: conversations.map(c => c.lastMessage)
    });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.query);
    const currentUserId = authUser?.userId || req.query.userId;
    const targetUserId = req.params.recipientId || req.query.recipientId;

    if (!currentUserId || !targetUserId) {
      return res.json({ success: true, messages: [] });
    }

    const messages = await db.collection('messages').find({
      $or: [
        { fromUserId: currentUserId, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: currentUserId }
      ]
    }).sort({ timestamp: 1 }).toArray();

    res.json({
      success: true,
      messages
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'Unauthenticated: Please log in to send messages.' });
    }

    const fromUserId = authUser.userId;
    const { toUserId, recipientId, propertyId, content, text } = req.body;
    const targetRecipientId = toUserId || recipientId;

    if (!targetRecipientId) {
      return res.status(400).json({ success: false, error: 'Recipient ID is required.' });
    }

    const messageText = (content || text || '').trim();
    if (!messageText) {
      return res.status(400).json({ success: false, error: 'Message content cannot be empty.' });
    }

    const conversationId = [fromUserId, targetRecipientId].sort().join(':');

    const newMessage = {
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      conversationId,
      fromUserId,
      toUserId: targetRecipientId,
      senderId: fromUserId,
      recipientId: targetRecipientId,
      propertyId: propertyId || '',
      content: messageText,
      timestamp: new Date(),
      read: false
    };

    await db.collection('messages').insertOne(newMessage);

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (err) {
    next(err);
  }
}
